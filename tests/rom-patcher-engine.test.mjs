import assert from "node:assert/strict";
import test from "node:test";
import {
  applyBps,
  applyIps,
  applyPatch,
  crc32,
} from "../public/rom-patcher/patch-engines.js";

const ascii = (value) => Array.from(Buffer.from(value, "ascii"));
const u24be = (value) => [(value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
const u16be = (value) => [(value >>> 8) & 0xff, value & 0xff];
const u32le = (value) => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];

function bpsNumber(value) {
  const output = [];
  let remaining = value;
  while (true) {
    const next = remaining & 0x7f;
    remaining = Math.floor(remaining / 128);
    if (remaining === 0) return [...output, next | 0x80];
    output.push(next);
    remaining -= 1;
  }
}

const action = (mode, length) => bpsNumber((length - 1) * 4 + mode);

function bps(source, target, actions) {
  const body = Uint8Array.from([
    ...ascii("BPS1"),
    ...bpsNumber(source.length),
    ...bpsNumber(target.length),
    ...bpsNumber(0),
    ...actions,
  ]);
  const checksummed = Uint8Array.from([
    ...body,
    ...u32le(crc32(source)),
    ...u32le(crc32(target)),
  ]);
  return Uint8Array.from([...checksummed, ...u32le(crc32(checksummed))]);
}

test("applies IPS records, RLE, expansion, and truncate", () => {
  const source = Uint8Array.from([0, 1, 2, 3, 4]);
  const patch = Uint8Array.from([
    ...ascii("PATCH"),
    ...u24be(1), ...u16be(2), 9, 8,
    ...u24be(5), ...u16be(0), ...u16be(3), 7,
    ...ascii("EOF"),
  ]);
  assert.deepEqual(Array.from(applyIps(source, patch)), [0, 9, 8, 3, 4, 7, 7, 7]);

  const truncate = Uint8Array.from([...ascii("PATCH"), ...ascii("EOF"), ...u24be(2)]);
  assert.deepEqual(Array.from(applyIps(source, truncate)), [0, 1]);
});

test("applies and authenticates BPS literal patches", () => {
  const source = Uint8Array.from([1, 2, 3, 4]);
  const target = Uint8Array.from([1, 9, 3, 8, 7]);
  const patch = bps(source, target, [...action(1, target.length), ...target]);
  assert.deepEqual(Array.from(applyBps(source, patch)), Array.from(target));
});

test("supports BPS source, target, and signed relative copies", () => {
  const source = Uint8Array.from(ascii("ABCD"));
  const repeated = Uint8Array.from(ascii("CDCDCD"));
  const repeatedPatch = bps(source, repeated, [
    ...action(2, 2), ...bpsNumber(4),
    ...action(3, 4), ...bpsNumber(0),
  ]);
  assert.equal(Buffer.from(applyBps(source, repeatedPatch)).toString("ascii"), "CDCDCD");

  const rewound = Uint8Array.from(ascii("CDAB"));
  const rewoundPatch = bps(source, rewound, [
    ...action(2, 2), ...bpsNumber(4),
    ...action(2, 2), ...bpsNumber(9),
  ]);
  assert.equal(Buffer.from(applyBps(source, rewoundPatch)).toString("ascii"), "CDAB");
});

test("rejects damaged, unsupported, and oversized patches", () => {
  const source = Uint8Array.from([1, 2]);
  const target = Uint8Array.from([3, 4]);
  const damaged = bps(source, target, [...action(1, 2), ...target]);
  damaged[8] ^= 0xff;
  assert.throws(() => applyBps(source, damaged), (error) => error.code === "BAD_BPS_PATCH_CRC");
  assert.throws(() => applyPatch(source, target, "xdelta"), (error) => error.code === "UNSUPPORTED_FORMAT");

  const expansion = Uint8Array.from([
    ...ascii("PATCH"),
    ...u24be(10), ...u16be(1), 4,
    ...ascii("EOF"),
  ]);
  assert.throws(
    () => applyIps(Uint8Array.of(1), expansion, { maxOutputSize: 5 }),
    (error) => error.code === "OUTPUT_TOO_LARGE",
  );
});

