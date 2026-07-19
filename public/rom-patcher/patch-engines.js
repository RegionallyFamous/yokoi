const DEFAULT_MAX_OUTPUT_SIZE = 1024 * 1024 * 1024;
let crcTable;

export class PatchError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PatchError";
    this.code = code;
  }
}

function fail(code, message) {
  throw new PatchError(code, message);
}

function bytes(value, label = "Value") {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  fail("INVALID_BYTES", `${label} must be an ArrayBuffer or typed array.`);
}

function matchesAscii(value, offset, text) {
  if (offset + text.length > value.length) return false;
  for (let index = 0; index < text.length; index += 1) {
    if (value[offset + index] !== text.charCodeAt(index)) return false;
  }
  return true;
}

function outputLimit(options) {
  const configured = Number(options?.maxOutputSize);
  return Number.isSafeInteger(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_OUTPUT_SIZE;
}

function grow(value, required, maximum) {
  if (required > maximum) {
    fail("OUTPUT_TOO_LARGE", "Patch output exceeds the configured safety limit.");
  }
  if (required <= value.length) return value;

  let length = Math.max(value.length || 1, 1024);
  while (length < required) {
    length = Math.min(maximum, length * 2);
    if (length < required && length === maximum) {
      fail("OUTPUT_TOO_LARGE", "Patch output exceeds the configured safety limit.");
    }
  }

  const expanded = new Uint8Array(length);
  expanded.set(value);
  return expanded;
}

function u24be(value, offset) {
  if (offset + 3 > value.length) {
    fail("TRUNCATED_PATCH", "Patch ends in the middle of a 24-bit value.");
  }
  return value[offset] * 0x10000 + value[offset + 1] * 0x100 + value[offset + 2];
}

function u16be(value, offset) {
  if (offset + 2 > value.length) {
    fail("TRUNCATED_PATCH", "Patch ends in the middle of a 16-bit value.");
  }
  return value[offset] * 0x100 + value[offset + 1];
}

function u32le(value, offset) {
  if (offset + 4 > value.length) {
    fail("TRUNCATED_PATCH", "Patch ends in the middle of a checksum.");
  }
  return (
    value[offset] +
    value[offset + 1] * 0x100 +
    value[offset + 2] * 0x10000 +
    value[offset + 3] * 0x1000000
  ) >>> 0;
}

export function applyIps(sourceValue, patchValue, options) {
  const source = bytes(sourceValue, "Source");
  const patch = bytes(patchValue, "Patch");
  const maximum = outputLimit(options);

  if (!matchesAscii(patch, 0, "PATCH")) {
    fail("BAD_IPS_HEADER", "File does not have an IPS header.");
  }
  if (source.length > maximum) {
    fail("OUTPUT_TOO_LARGE", "Source exceeds the configured safety limit.");
  }

  let output = new Uint8Array(source.length);
  output.set(source);
  let length = source.length;
  let position = 5;
  let foundEnd = false;

  while (position < patch.length) {
    if (matchesAscii(patch, position, "EOF")) {
      position += 3;
      foundEnd = true;
      break;
    }

    const offset = u24be(patch, position);
    position += 3;
    const recordLength = u16be(patch, position);
    position += 2;

    if (recordLength === 0) {
      const runLength = u16be(patch, position);
      position += 2;
      if (runLength === 0) fail("BAD_IPS_RECORD", "IPS run-length record is empty.");
      if (position >= patch.length) {
        fail("TRUNCATED_PATCH", "IPS run-length record is missing its byte.");
      }
      output = grow(output, offset + runLength, maximum);
      output.fill(patch[position], offset, offset + runLength);
      position += 1;
      length = Math.max(length, offset + runLength);
    } else {
      if (position + recordLength > patch.length) {
        fail("TRUNCATED_PATCH", "IPS record is missing data bytes.");
      }
      output = grow(output, offset + recordLength, maximum);
      output.set(patch.subarray(position, position + recordLength), offset);
      position += recordLength;
      length = Math.max(length, offset + recordLength);
    }
  }

  if (!foundEnd) fail("MISSING_IPS_EOF", "IPS patch has no EOF marker.");

  if (position < patch.length) {
    if (patch.length - position !== 3) {
      fail("BAD_IPS_TRAILER", "IPS patch has an invalid truncate extension.");
    }
    length = u24be(patch, position);
    output = grow(output, length, maximum);
  }

  return output.slice(0, length);
}

function buildCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

export function crc32(input, start = 0, end) {
  const value = bytes(input);
  const stop = end ?? value.length;
  crcTable ??= buildCrcTable();
  let crc = 0xffffffff;
  for (let index = start; index < stop; index += 1) {
    crc = crcTable[(crc ^ value[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

class BpsReader {
  constructor(value, limit) {
    this.value = value;
    this.limit = limit;
    this.position = 4;
  }

  number() {
    let data = 0;
    let shift = 1;
    while (true) {
      if (this.position >= this.limit) {
        fail("TRUNCATED_PATCH", "BPS variable-length number is incomplete.");
      }
      const next = this.value[this.position];
      this.position += 1;
      data += (next & 0x7f) * shift;
      if (!Number.isSafeInteger(data)) fail("BAD_BPS_NUMBER", "BPS number is too large.");
      if (next & 0x80) return data;
      shift *= 128;
      data += shift;
      if (!Number.isSafeInteger(shift) || !Number.isSafeInteger(data)) {
        fail("BAD_BPS_NUMBER", "BPS number is too large.");
      }
    }
  }

  signedNumber() {
    const value = this.number();
    const magnitude = Math.floor(value / 2);
    return value % 2 === 1 ? -magnitude : magnitude;
  }
}

export function applyBps(sourceValue, patchValue, options) {
  const source = bytes(sourceValue, "Source");
  const patch = bytes(patchValue, "Patch");
  const maximum = outputLimit(options);

  if (patch.length < 19 || !matchesAscii(patch, 0, "BPS1")) {
    fail("BAD_BPS_HEADER", "File does not have a complete BPS header.");
  }

  const footer = patch.length - 12;
  const sourceCrc = u32le(patch, footer);
  const targetCrc = u32le(patch, footer + 4);
  const patchCrc = u32le(patch, footer + 8);
  if (crc32(patch, 0, patch.length - 4) !== patchCrc) {
    fail("BAD_BPS_PATCH_CRC", "BPS patch checksum does not match.");
  }
  if (crc32(source) !== sourceCrc) {
    fail("BAD_BPS_SOURCE_CRC", "Source does not match the BPS patch.");
  }

  const reader = new BpsReader(patch, footer);
  const sourceSize = reader.number();
  const targetSize = reader.number();
  const metadataSize = reader.number();
  if (sourceSize !== source.length) {
    fail("BAD_BPS_SOURCE_SIZE", "Source size does not match the BPS patch.");
  }
  if (targetSize > maximum) {
    fail("OUTPUT_TOO_LARGE", "BPS output exceeds the configured safety limit.");
  }
  if (reader.position + metadataSize > footer) {
    fail("TRUNCATED_PATCH", "BPS metadata extends beyond the action stream.");
  }
  reader.position += metadataSize;

  const output = new Uint8Array(targetSize);
  let outputOffset = 0;
  let sourceRelativeOffset = 0;
  let targetRelativeOffset = 0;

  while (outputOffset < targetSize) {
    const action = reader.number();
    const mode = action % 4;
    const length = Math.floor(action / 4) + 1;
    if (outputOffset + length > targetSize) {
      fail("BAD_BPS_ACTION", "BPS action writes past the target size.");
    }

    if (mode === 0) {
      if (outputOffset + length > source.length) {
        fail("BAD_BPS_SOURCE_READ", "BPS SourceRead exceeds the source.");
      }
      output.set(source.subarray(outputOffset, outputOffset + length), outputOffset);
      outputOffset += length;
    } else if (mode === 1) {
      if (reader.position + length > footer) {
        fail("TRUNCATED_PATCH", "BPS TargetRead is missing literal bytes.");
      }
      output.set(patch.subarray(reader.position, reader.position + length), outputOffset);
      reader.position += length;
      outputOffset += length;
    } else if (mode === 2) {
      sourceRelativeOffset += reader.signedNumber();
      if (sourceRelativeOffset < 0 || sourceRelativeOffset + length > source.length) {
        fail("BAD_BPS_SOURCE_COPY", "BPS SourceCopy exceeds the source.");
      }
      for (let index = 0; index < length; index += 1) {
        output[outputOffset] = source[sourceRelativeOffset];
        outputOffset += 1;
        sourceRelativeOffset += 1;
      }
    } else {
      targetRelativeOffset += reader.signedNumber();
      if (targetRelativeOffset < 0 || targetRelativeOffset >= outputOffset) {
        fail("BAD_BPS_TARGET_COPY", "BPS TargetCopy points outside completed output.");
      }
      for (let index = 0; index < length; index += 1) {
        if (targetRelativeOffset >= outputOffset) {
          fail("BAD_BPS_TARGET_COPY", "BPS TargetCopy reads unwritten output.");
        }
        output[outputOffset] = output[targetRelativeOffset];
        outputOffset += 1;
        targetRelativeOffset += 1;
      }
    }
  }

  if (reader.position !== footer) {
    fail("BAD_BPS_ACTION_STREAM", "BPS action stream has trailing or missing bytes.");
  }
  if (crc32(output) !== targetCrc) {
    fail("BAD_BPS_TARGET_CRC", "BPS target checksum does not match.");
  }
  return output;
}

export function applyPatch(source, patch, format, options) {
  const normalized = String(format ?? "").toLowerCase();
  if (normalized === "ips") return applyIps(source, patch, options);
  if (normalized === "bps") return applyBps(source, patch, options);
  fail("UNSUPPORTED_FORMAT", "Only IPS and BPS patches are supported.");
}

