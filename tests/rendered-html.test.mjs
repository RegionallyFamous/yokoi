import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Yokoi site, translation archive, and patch station", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Yokoi — Tools for a Strange Little Handheld<\/title>/i);
  assert.match(html, /id="patcher"/);
  assert.match(html, /id="translations"/);
  assert.match(html, /Translation archive\./);
  assert.match(html, /Wonder Witch Technical Manual/);
  assert.match(html, /Read in browser/);
  assert.match(html, /Download PDF/);
  assert.match(html, /\/translations\/wonder-witch-technical-manual-en\.pdf/);
  assert.match(html, /Patch a game\./);
  assert.match(html, /yokoi-rom-patcher/);
  assert.match(html, /\/rom-patcher\/yokoi-rom-patcher\.js/);
  assert.match(html, /\/rom-patcher\/catalog\.json/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships a real translated PDF with both browser and download paths", async () => {
  const pdf = await readFile(
    new URL("../public/translations/wonder-witch-technical-manual-en.pdf", import.meta.url),
  );

  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.ok(pdf.byteLength > 30_000);
  assert.match(pdf.subarray(-1024).toString("latin1"), /%%EOF/);
});

test("ships a versioned, ROM-free patch catalog and module scripts", async () => {
  const [catalogText, component, engines, worker, patchFiles, vercelText] = await Promise.all([
    readFile(new URL("../public/rom-patcher/catalog.json", import.meta.url), "utf8"),
    readFile(new URL("../public/rom-patcher/yokoi-rom-patcher.js", import.meta.url), "utf8"),
    readFile(new URL("../public/rom-patcher/patch-engines.js", import.meta.url), "utf8"),
    readFile(new URL("../public/rom-patcher/patch-worker.js", import.meta.url), "utf8"),
    readdir(new URL("../public/rom-patcher/patches/", import.meta.url)),
    readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  ]);

  const catalog = JSON.parse(catalogText);
  assert.equal(catalog.version, 1);
  assert.deepEqual(catalog.patches, []);
  assert.match(component, /customElements\.define\("yokoi-rom-patcher"/);
  assert.match(component, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(component, /patchUrl\.origin !== location\.origin/);
  assert.match(engines, /export function applyIps/);
  assert.match(engines, /export function applyBps/);
  assert.match(worker, /new Uint8Array\(event\.data\.source\)/);
  assert.doesNotMatch(catalogText, /https?:|base64|romUrl/i);
  assert.deepEqual(patchFiles, [".gitkeep"]);

  const vercel = JSON.parse(vercelText);
  assert.equal(vercel.framework, "nextjs");
  assert.ok(vercel.headers.some((rule) => rule.source === "/rom-patcher/catalog.json"));
  assert.ok(vercel.headers.some((rule) => rule.source === "/rom-patcher/patches/(.*)"));
});
