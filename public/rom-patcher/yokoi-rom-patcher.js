import { applyPatch } from "./patch-engines.js";

const SCRIPT_URL = import.meta.url;
const WORKER_URL = new URL("./patch-worker.js", SCRIPT_URL);
const DEFAULT_CATALOG_URL = new URL("./catalog.json", SCRIPT_URL);
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const ALLOWED_RELEASE_TAGS = new Set([
  "ENGLISH",
  "WS",
  "WSC",
  "IPS",
  "BPS",
  "CERTIFIED",
]);
const DEFAULT_MAX_ROM_BYTES = 256 * 1024 * 1024;
const DEFAULT_MAX_PATCH_BYTES = 64 * 1024 * 1024;

const styles = `
  :host {
    --rp-ink: #12112f;
    --rp-deep: #0b0a22;
    --rp-cream: #fff4d6;
    --rp-paper: #fff9e9;
    --rp-lime: #ccff36;
    --rp-cyan: #51e7ff;
    --rp-pink: #ff75b5;
    display: block;
    color: var(--rp-cream);
    font-family: var(--rp-font, ui-sans-serif, system-ui, sans-serif);
  }

  *, *::before, *::after { box-sizing: border-box; }
  button, input, select { font: inherit; }
  button { -webkit-tap-highlight-color: transparent; }
  [hidden] { display: none !important; }

  .shell {
    overflow: hidden;
    border: 2px solid var(--rp-cream);
    border-radius: 24px;
    background:
      linear-gradient(rgba(255, 244, 214, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 244, 214, 0.04) 1px, transparent 1px),
      var(--rp-deep);
    background-size: 26px 26px;
    box-shadow: 12px 12px 0 var(--rp-cyan);
  }

  .topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 15px 19px;
    border-bottom: 1px solid rgba(255, 244, 214, 0.22);
    font-family: var(--rp-mono, ui-monospace, monospace);
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .privacy-pill {
    padding: 6px 9px;
    border-radius: 999px;
    color: var(--rp-ink);
    background: var(--rp-lime);
    letter-spacing: 0.05em;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(360px, 1.08fr);
  }

  .panel { padding: clamp(24px, 4vw, 44px); }
  .panel + .panel { border-left: 1px solid rgba(255, 244, 214, 0.22); }

  .step {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
  }

  .step span {
    width: 29px;
    height: 29px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 50%;
    color: var(--rp-ink);
    background: var(--rp-pink);
    font-family: var(--rp-mono, ui-monospace, monospace);
    font-size: 11px;
    font-weight: 900;
  }

  .step h3 { margin: 0; font-size: 18px; letter-spacing: -0.02em; }
  .field-label { display: grid; gap: 8px; }
  .field-label > span {
    color: rgba(255, 244, 214, 0.66);
    font-family: var(--rp-mono, ui-monospace, monospace);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  select {
    width: 100%;
    min-height: 52px;
    padding: 0 44px 0 14px;
    border: 1px solid rgba(255, 244, 214, 0.42);
    border-radius: 12px;
    color: var(--rp-cream);
    background: var(--rp-ink);
  }

  select:focus-visible, button:focus-visible, .dropzone:focus-visible, input:focus-visible {
    outline: 3px solid var(--rp-cyan);
    outline-offset: 3px;
  }

  .release {
    min-height: 146px;
    margin-top: 16px;
    padding: 18px;
    border: 1px solid rgba(255, 244, 214, 0.2);
    border-radius: 14px;
    background: rgba(255, 244, 214, 0.06);
  }

  .release strong { display: block; font-size: 23px; letter-spacing: -0.035em; }
  .release p { margin: 9px 0 0; color: rgba(255, 244, 214, 0.68); line-height: 1.5; }
  .release-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin: 14px 0 0;
    padding: 0;
    list-style: none;
  }
  .release-tags li {
    padding: 5px 8px;
    border: 1px solid rgba(255, 244, 214, 0.28);
    border-radius: 999px;
    color: var(--rp-cream);
    background: rgba(255, 244, 214, 0.07);
    font-family: var(--rp-mono, ui-monospace, monospace);
    font-size: 9px;
    font-weight: 850;
    letter-spacing: 0.08em;
  }
  .release small {
    display: block;
    margin-top: 14px;
    color: var(--rp-cyan);
    font-family: var(--rp-mono, ui-monospace, monospace);
    font-size: 10px;
    font-weight: 750;
    line-height: 1.55;
  }

  .empty {
    margin: 14px 0 0;
    padding: 17px;
    border: 1px dashed rgba(255, 244, 214, 0.35);
    border-radius: 13px;
    color: rgba(255, 244, 214, 0.72);
    line-height: 1.55;
  }

  .ownership {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-bottom: 14px;
    color: rgba(255, 244, 214, 0.7);
    cursor: pointer;
    font-size: 12px;
    line-height: 1.5;
  }

  .ownership input { width: 17px; height: 17px; margin: 1px 0 0; accent-color: var(--rp-lime); }

  .dropzone {
    min-height: 205px;
    display: grid;
    place-items: center;
    align-content: center;
    padding: 26px;
    border: 2px dashed rgba(255, 244, 214, 0.38);
    border-radius: 18px;
    cursor: pointer;
    text-align: center;
    transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
  }

  .dropzone:hover, .dropzone.dragging {
    border-color: var(--rp-lime);
    background: rgba(204, 255, 54, 0.07);
  }
  .dropzone.dragging { transform: scale(1.01); }
  .dropzone.busy { opacity: 0.65; pointer-events: none; cursor: progress; }
  .drop-icon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    margin-bottom: 11px;
    border-radius: 50%;
    color: var(--rp-ink);
    background: var(--rp-lime);
    box-shadow: 5px 5px 0 var(--rp-pink);
    font-size: 22px;
    font-weight: 900;
  }
  .dropzone strong { font-size: 16px; }
  .dropzone small { margin-top: 5px; color: rgba(255, 244, 214, 0.57); }

  .status {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-top: 13px;
    padding: 12px 13px;
    border-radius: 11px;
    background: rgba(255, 244, 214, 0.09);
    font-size: 12px;
    font-weight: 720;
    line-height: 1.45;
  }
  .status::before {
    content: "";
    width: 9px;
    height: 9px;
    flex: 0 0 auto;
    margin-top: 4px;
    border-radius: 50%;
    background: var(--rp-cyan);
  }
  .status[data-kind="working"]::before { animation: pulse 1s ease-in-out infinite; }
  .status[data-kind="success"] { color: var(--rp-lime); }
  .status[data-kind="success"]::before { background: var(--rp-lime); }
  .status[data-kind="error"] { color: #ffb3c9; }
  .status[data-kind="error"]::before { background: var(--rp-pink); }

  .download, .reset {
    width: 100%;
    min-height: 50px;
    margin-top: 12px;
    border: 2px solid var(--rp-lime);
    border-radius: 12px;
    cursor: pointer;
    font-family: var(--rp-mono, ui-monospace, monospace);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .download { color: var(--rp-ink); background: var(--rp-lime); box-shadow: 5px 5px 0 var(--rp-cyan); }
  .download:hover { transform: translate(-1px, -1px); box-shadow: 7px 7px 0 var(--rp-cyan); }
  .reset { border-color: rgba(255, 244, 214, 0.35); color: var(--rp-cream); background: transparent; }
  .fineprint { margin: 18px 0 0; color: rgba(255, 244, 214, 0.48); font-size: 10px; line-height: 1.55; }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(81, 231, 255, 0.35); }
    50% { box-shadow: 0 0 0 6px rgba(81, 231, 255, 0); }
  }

  @media (max-width: 760px) {
    .layout { grid-template-columns: 1fr; }
    .panel + .panel { border-left: 0; border-top: 1px solid rgba(255, 244, 214, 0.22); }
    .shell { border-radius: 18px; box-shadow: 7px 7px 0 var(--rp-cyan); }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

const markup = `
  <div class="shell">
    <div class="topline">
      <span>YOKOI / LOCAL PATCH STATION</span>
      <span class="privacy-pill">ROM STAYS HERE</span>
    </div>
    <div class="layout">
      <section class="panel">
        <div class="step"><span>1</span><h3>Choose a translation</h3></div>
        <label class="field-label">
          <span>Game and release</span>
          <select data-role="select" disabled>
            <option value="">Loading patch catalog…</option>
          </select>
        </label>
        <div class="release" data-role="release" hidden>
          <strong data-role="release-title"></strong>
          <p data-role="release-meta"></p>
          <ul class="release-tags" data-role="release-tags" aria-label="Release tags" hidden></ul>
          <small data-role="release-credits"></small>
        </div>
        <p class="empty" data-role="empty" hidden></p>
      </section>
      <section class="panel">
        <div class="step"><span>2</span><h3>Add your ROM</h3></div>
        <label class="ownership">
          <input data-role="ownership" type="checkbox" />
          <span>I dumped this ROM from a game I own and may make a personal backup.</span>
        </label>
        <label class="dropzone" data-role="dropzone" tabindex="0">
          <input data-role="file" type="file" hidden />
          <span class="drop-icon" aria-hidden="true">↓</span>
          <strong>Choose ROM file</strong>
          <small>or drop it here — it never leaves this browser</small>
        </label>
        <div class="status" data-role="status" role="status" aria-live="polite" hidden></div>
        <button class="download" data-role="download" type="button" hidden>Download translated ROM</button>
        <button class="reset" data-role="reset" type="button" hidden>Patch another copy</button>
        <p class="fineprint">Only the translation patch is downloaded. The original ROM, its hash, and the finished ROM are never sent to Yokoi or Vercel.</p>
      </section>
    </div>
  </div>
`;

function humanBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

async function sha256(value) {
  if (!globalThis.crypto?.subtle) throw new Error("WEB_CRYPTO_UNAVAILABLE");
  const digest = await crypto.subtle.digest("SHA-256", value);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeFilename(file, patch) {
  if (patch.outputFilename) return patch.outputFilename;
  const dot = file.name.lastIndexOf(".");
  const stem = dot > 0 ? file.name.slice(0, dot) : file.name;
  const extension = dot > 0 ? file.name.slice(dot) : ".rom";
  return `${stem}-english${extension}`;
}

function normalizePatch(value, catalogUrl) {
  if (!value || typeof value !== "object") return null;
  const format = String(value.patchFormat ?? "").toLowerCase();
  const sourceSha256 = String(value.sourceSha256 ?? "").toLowerCase();
  const targetSha256 = String(value.targetSha256 ?? "").toLowerCase();
  const sourceSize = Number(value.sourceSize ?? 0);
  const tags = Array.isArray(value.tags)
    ? [...new Set(
      value.tags
        .map((tag) => String(tag).trim().toUpperCase())
        .filter((tag) => ALLOWED_RELEASE_TAGS.has(tag)),
    )].slice(0, 6)
    : [];
  let patchUrl;

  try {
    patchUrl = new URL(value.patchUrl, catalogUrl);
  } catch {
    return null;
  }

  if (
    !value.id ||
    !value.title ||
    !["ips", "bps"].includes(format) ||
    !HASH_PATTERN.test(sourceSha256) ||
    !HASH_PATTERN.test(targetSha256) ||
    patchUrl.origin !== location.origin ||
    (sourceSize && (!Number.isSafeInteger(sourceSize) || sourceSize < 1))
  ) {
    return null;
  }

  return {
    id: String(value.id),
    title: String(value.title),
    originalTitle: String(value.originalTitle ?? ""),
    language: String(value.language ?? ""),
    system: String(value.system ?? ""),
    revision: String(value.revision ?? ""),
    version: String(value.version ?? ""),
    tags,
    credits: String(value.credits ?? ""),
    patchUrl: patchUrl.href,
    patchFormat: format,
    sourceSha256,
    targetSha256,
    sourceSize,
    outputFilename: String(value.outputFilename ?? "").replace(/[^a-zA-Z0-9._ -]/g, ""),
  };
}

class YokoiRomPatcher extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>${styles}</style>${markup}`;
    this.patches = [];
    this.patch = null;
    this.operation = 0;
    this.worker = null;
    this.workerReject = null;
    this.resultUrl = "";
    this.resultFilename = "";
  }

  connectedCallback() {
    if (this.ready) return;
    this.ready = true;
    this.select = this.shadowRoot.querySelector('[data-role="select"]');
    this.release = this.shadowRoot.querySelector('[data-role="release"]');
    this.releaseTitle = this.shadowRoot.querySelector('[data-role="release-title"]');
    this.releaseMeta = this.shadowRoot.querySelector('[data-role="release-meta"]');
    this.releaseTags = this.shadowRoot.querySelector('[data-role="release-tags"]');
    this.releaseCredits = this.shadowRoot.querySelector('[data-role="release-credits"]');
    this.empty = this.shadowRoot.querySelector('[data-role="empty"]');
    this.ownership = this.shadowRoot.querySelector('[data-role="ownership"]');
    this.dropzone = this.shadowRoot.querySelector('[data-role="dropzone"]');
    this.file = this.shadowRoot.querySelector('[data-role="file"]');
    this.status = this.shadowRoot.querySelector('[data-role="status"]');
    this.downloadButton = this.shadowRoot.querySelector('[data-role="download"]');
    this.resetButton = this.shadowRoot.querySelector('[data-role="reset"]');
    this.bindEvents();
    this.loadCatalog();
  }

  disconnectedCallback() {
    this.cancelWork();
    this.clearResult();
  }

  get maxRomBytes() {
    const value = Number(this.getAttribute("max-rom-bytes"));
    return Number.isSafeInteger(value) && value > 0 ? value : DEFAULT_MAX_ROM_BYTES;
  }

  get maxPatchBytes() {
    const value = Number(this.getAttribute("max-patch-bytes"));
    return Number.isSafeInteger(value) && value > 0 ? value : DEFAULT_MAX_PATCH_BYTES;
  }

  bindEvents() {
    this.select.addEventListener("change", () => this.choosePatch(this.select.value));
    this.file.addEventListener("change", () => this.processFile(this.file.files[0]));
    this.downloadButton.addEventListener("click", () => this.download());
    this.resetButton.addEventListener("click", () => this.reset(false));

    for (const eventName of ["dragenter", "dragover"]) {
      this.dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        this.dropzone.classList.add("dragging");
      });
    }
    for (const eventName of ["dragleave", "drop"]) {
      this.dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        this.dropzone.classList.remove("dragging");
      });
    }
    this.dropzone.addEventListener("drop", (event) => {
      if (event.dataTransfer.files.length) this.processFile(event.dataTransfer.files[0]);
    });
    this.dropzone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.file.click();
      }
    });
  }

  async loadCatalog() {
    const catalogUrl = new URL(
      this.getAttribute("catalog-url") || DEFAULT_CATALOG_URL,
      document.baseURI,
    );
    try {
      const response = await fetch(catalogUrl, { credentials: "same-origin", cache: "no-cache" });
      if (!response.ok) throw new Error("CATALOG_UNAVAILABLE");
      const catalog = await response.json();
      if (catalog?.version !== 1 || !Array.isArray(catalog.patches)) {
        throw new Error("BAD_CATALOG");
      }
      const seen = new Set();
      this.patches = catalog.patches
        .map((patch) => normalizePatch(patch, catalogUrl))
        .filter((patch) => {
          if (!patch || seen.has(patch.id)) return false;
          seen.add(patch.id);
          return true;
        });
      this.renderCatalog();
      this.dispatchEvent(new CustomEvent("rom-patcher:ready", {
        bubbles: true,
        detail: { patchCount: this.patches.length },
      }));
    } catch {
      this.select.replaceChildren(new Option("Patch catalog unavailable", ""));
      this.empty.textContent = "The translation catalog could not be loaded. Try again in a moment.";
      this.empty.hidden = false;
      this.showStatus("error", "The translation catalog could not be loaded.");
    }
  }

  renderCatalog() {
    this.select.replaceChildren(new Option(
      this.patches.length ? "Choose a game…" : "No translations published yet",
      "",
    ));
    for (const patch of this.patches) {
      const detail = [patch.system, patch.revision].filter(Boolean).join(" · ");
      this.select.add(new Option(`${patch.title}${detail ? ` — ${detail}` : ""}`, patch.id));
    }
    this.select.disabled = this.patches.length === 0;
    this.empty.textContent = this.patches.length
      ? ""
      : "The browser patcher is installed and ready. Verified translation releases will appear here as they are published.";
    this.empty.hidden = this.patches.length !== 0;
  }

  choosePatch(id) {
    this.reset(true);
    this.patch = this.patches.find((patch) => patch.id === id) ?? null;
    if (!this.patch) {
      this.release.hidden = true;
      return;
    }
    this.releaseTitle.textContent = this.patch.title;
    this.releaseMeta.textContent = [
      this.patch.originalTitle && this.patch.originalTitle !== this.patch.title
        ? this.patch.originalTitle
        : "",
      this.patch.language ? `${this.patch.language} translation` : "",
      this.patch.system,
      this.patch.revision,
      this.patch.version
        ? `Patch v${this.patch.version.replace(/^v/i, "")}`
        : "",
    ].filter(Boolean).join(" · ");
    this.releaseTags.replaceChildren(
      ...this.patch.tags.map((tag) => {
        const item = document.createElement("li");
        item.textContent = tag;
        return item;
      }),
    );
    this.releaseTags.hidden = this.patch.tags.length === 0;
    this.releaseCredits.textContent = this.patch.credits
      ? `Translation by ${this.patch.credits} · ${this.patch.patchFormat.toUpperCase()}`
      : `Verified ${this.patch.patchFormat.toUpperCase()} release`;
    this.release.hidden = false;
  }

  cancelWork() {
    this.operation += 1;
    if (this.worker) this.worker.terminate();
    this.worker = null;
    if (this.workerReject) this.workerReject(new Error("CANCELLED"));
    this.workerReject = null;
    this.dropzone?.classList.remove("busy", "dragging");
  }

  clearResult() {
    if (this.resultUrl) URL.revokeObjectURL(this.resultUrl);
    this.resultUrl = "";
    this.resultFilename = "";
    if (this.downloadButton) this.downloadButton.hidden = true;
    if (this.resetButton) this.resetButton.hidden = true;
  }

  reset(keepPatch) {
    this.cancelWork();
    this.clearResult();
    this.file.value = "";
    this.status.hidden = true;
    if (!keepPatch) this.file.focus();
  }

  showStatus(kind, message) {
    this.status.dataset.kind = kind;
    this.status.textContent = message;
    this.status.hidden = false;
  }

  fail(message) {
    this.dropzone.classList.remove("busy");
    this.showStatus("error", message);
    this.dispatchEvent(new CustomEvent("rom-patcher:error", {
      bubbles: true,
      detail: { patchId: this.patch?.id ?? null },
    }));
  }

  async processFile(file) {
    this.clearResult();
    if (!this.patch) return this.fail("Choose a translation first.");
    if (!this.ownership.checked) return this.fail("Confirm that you own the game before choosing a ROM.");
    if (!file) return this.fail("Choose a ROM file.");
    if (file.size > this.maxRomBytes) {
      return this.fail(`That file exceeds the ${humanBytes(this.maxRomBytes)} browser limit.`);
    }
    if (this.patch.sourceSize && file.size !== this.patch.sourceSize) {
      return this.fail(`Wrong ROM size. This release expects exactly ${humanBytes(this.patch.sourceSize)}.`);
    }

    const selectedPatch = this.patch;
    const token = ++this.operation;
    this.dropzone.classList.add("busy");
    try {
      this.showStatus("working", "Checking your ROM…");
      const source = await file.arrayBuffer();
      const sourceHash = await sha256(source);
      if (token !== this.operation) return;
      if (sourceHash !== selectedPatch.sourceSha256) {
        return this.fail("This is not the exact ROM revision required by the selected translation.");
      }

      this.showStatus("working", "Loading the translation patch…");
      const response = await fetch(selectedPatch.patchUrl, {
        credentials: "same-origin",
        cache: "force-cache",
      });
      if (token !== this.operation) return;
      if (!response.ok) throw new Error("PATCH_DOWNLOAD_FAILED");
      const declaredSize = Number(response.headers.get("content-length"));
      if (declaredSize && declaredSize > this.maxPatchBytes) throw new Error("PATCH_TOO_LARGE");
      const patch = await response.arrayBuffer();
      if (patch.byteLength > this.maxPatchBytes) throw new Error("PATCH_TOO_LARGE");
      if (token !== this.operation) return;

      this.showStatus("working", "Applying the translation…");
      const output = await this.applyInWorker(source, patch, selectedPatch);
      if (token !== this.operation) return;

      this.showStatus("working", "Verifying the finished game…");
      const targetHash = await sha256(output);
      if (token !== this.operation) return;
      if (targetHash !== selectedPatch.targetSha256) {
        throw new Error("BAD_OUTPUT");
      }

      this.resultUrl = URL.createObjectURL(new Blob([output], { type: "application/octet-stream" }));
      this.resultFilename = safeFilename(file, selectedPatch);
      this.dropzone.classList.remove("busy");
      this.showStatus("success", "Your verified translated ROM is ready.");
      this.downloadButton.hidden = false;
      this.resetButton.hidden = false;
      this.downloadButton.focus();
      this.dispatchEvent(new CustomEvent("rom-patcher:complete", {
        bubbles: true,
        detail: { patchId: selectedPatch.id, outputBytes: output.byteLength },
      }));
    } catch (error) {
      if (token !== this.operation) return;
      const messages = {
        WEB_CRYPTO_UNAVAILABLE: "ROM verification requires a modern browser on HTTPS.",
        PATCH_DOWNLOAD_FAILED: "The translation patch could not be downloaded.",
        PATCH_TOO_LARGE: "The translation patch exceeds this browser's safety limit.",
        BAD_OUTPUT: "The finished ROM did not match the verified release. Nothing was downloaded.",
      };
      this.fail(messages[error.message] ?? "The patch could not be applied to this ROM.");
    }
  }

  applyInWorker(source, patch, selectedPatch) {
    if (!globalThis.Worker) {
      return Promise.resolve(applyPatch(
        new Uint8Array(source),
        new Uint8Array(patch),
        selectedPatch.patchFormat,
        { maxOutputSize: this.maxRomBytes },
      ));
    }

    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker(WORKER_URL, { type: "module" });
      } catch {
        resolve(applyPatch(
          new Uint8Array(source),
          new Uint8Array(patch),
          selectedPatch.patchFormat,
          { maxOutputSize: this.maxRomBytes },
        ));
        return;
      }
      this.worker.addEventListener("message", (event) => {
        this.worker?.terminate();
        this.worker = null;
        this.workerReject = null;
        if (event.data?.ok) resolve(new Uint8Array(event.data.output));
        else reject(new Error(event.data?.code ?? "PATCH_FAILED"));
      }, { once: true });
      this.worker.addEventListener("error", () => {
        this.worker?.terminate();
        this.worker = null;
        this.workerReject = null;
        reject(new Error("PATCH_WORKER_FAILED"));
      }, { once: true });
      this.workerReject = reject;
      this.worker.postMessage(
        { source, patch, format: selectedPatch.patchFormat, maxOutputSize: this.maxRomBytes },
        [source, patch],
      );
    });
  }

  download() {
    if (!this.resultUrl) return;
    const link = document.createElement("a");
    link.href = this.resultUrl;
    link.download = this.resultFilename;
    document.body.append(link);
    link.click();
    link.remove();
  }
}

if (!customElements.get("yokoi-rom-patcher")) {
  customElements.define("yokoi-rom-patcher", YokoiRomPatcher);
}
