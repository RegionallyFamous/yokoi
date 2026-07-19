import { applyPatch } from "./patch-engines.js";

self.addEventListener("message", (event) => {
  try {
    const output = applyPatch(
      new Uint8Array(event.data.source),
      new Uint8Array(event.data.patch),
      event.data.format,
      { maxOutputSize: event.data.maxOutputSize },
    );
    const transferable = output.buffer.slice(
      output.byteOffset,
      output.byteOffset + output.byteLength,
    );
    self.postMessage({ ok: true, output: transferable }, [transferable]);
  } catch (error) {
    self.postMessage({
      ok: false,
      code: error?.code ?? "PATCH_FAILED",
      message: error?.message ?? "The patch could not be applied.",
    });
  }
});

