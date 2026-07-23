import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
  assert.match(html, /Translation Shelf/);
  assert.match(
    html,
    /https:\/\/github\.com\/RegionallyFamous\/SwanSong-Desktop\/releases\/latest/,
  );
  assert.match(
    html,
    /https:\/\/github\.com\/RegionallyFamous\/SwanSong-Desktop\/releases\/tag\/v0\.9\.0/,
  );
  assert.match(html, /Try 0\.9 beta/);
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
  assert.equal(catalog.patches.length, 2);
  assert.deepEqual(
    catalog.patches.map((patch) => patch.id),
    [
      "sd-gundam-operation-uc-en-v6",
      "sd-gundam-eiyuu-den-kishi-densetsu-en-v1-0",
    ],
  );
  assert.deepEqual(
    catalog.patches.map(({ title, language, revision, tags }) => ({
      title,
      language,
      revision,
      tags,
    })),
    [
      {
        title: "SD Gundam: Operation U.C.",
        language: "English",
        revision: "Japan",
        tags: ["ENGLISH", "WSC", "IPS", "CERTIFIED"],
      },
      {
        title: "SD Gundam Eiyuu Den: Kishi Densetsu",
        language: "English",
        revision: "Japan",
        tags: ["ENGLISH", "WSC", "IPS", "CERTIFIED"],
      },
    ],
  );
  assert.match(component, /customElements\.define\("yokoi-rom-patcher"/);
  assert.match(component, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(component, /patchUrl\.origin !== location\.origin/);
  assert.match(component, /ALLOWED_RELEASE_TAGS/);
  assert.match(component, /data-role="release-tags"/);
  assert.match(component, /`Patch v\$\{this\.patch\.version/);
  assert.match(engines, /export function applyIps/);
  assert.match(engines, /export function applyBps/);
  assert.match(worker, /new Uint8Array\(event\.data\.source\)/);
  assert.doesNotMatch(catalogText, /https?:|base64|romUrl/i);
  assert.deepEqual(patchFiles.sort(), [
    ".gitkeep",
    "sd-gundam-eiyuu-den-kishi-densetsu-en-v1.0.ips",
    "sd-gundam-operation-uc-en-v6.ips",
  ]);

  const expectedPatches = new Map([
    [
      "sd-gundam-operation-uc-en-v6",
      {
        filename: "sd-gundam-operation-uc-en-v6.ips",
        patchSha256: "9c805b02b24ef6bb48c4d07f8d6adcec7fdbc5daf07766bde6a2af9867266f6a",
        sourceSha256: "23111bd79a8d39ebffe5a925da5db5865ecb6c53dca851d367aefe1b0e52e969",
        targetSha256: "1105debcaf3135bd5ebafd5456e43b0251558c571afb60101429a5a69a723741",
      },
    ],
    [
      "sd-gundam-eiyuu-den-kishi-densetsu-en-v1-0",
      {
        filename: "sd-gundam-eiyuu-den-kishi-densetsu-en-v1.0.ips",
        patchSha256: "e555d3a6c43087760f6ea06c4bc27f7f6d6e0992f6eb20fae74fb856c4ee4687",
        sourceSha256: "9cebbb4e8baf720b817e5863193dcc087dce66bdac87490bb24ea0f79024961e",
        targetSha256: "8969a302f064aa68500484339d774b8ece04b0b14de6145010d0f75e27fc9636",
      },
    ],
  ]);

  for (const patch of catalog.patches) {
    const expected = expectedPatches.get(patch.id);
    assert.ok(expected, `unexpected patch catalog entry ${patch.id}`);
    assert.equal(patch.patchUrl, `./patches/${expected.filename}`);
    assert.equal(patch.patchFormat, "ips");
    assert.equal(patch.sourceSha256, expected.sourceSha256);
    assert.equal(patch.targetSha256, expected.targetSha256);
    assert.match(patch.outputFilename, /\.wsc$/);

    const bytes = await readFile(
      new URL(`../public/rom-patcher/patches/${expected.filename}`, import.meta.url),
    );
    assert.equal(bytes.subarray(0, 5).toString("ascii"), "PATCH");
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected.patchSha256);
  }

  const vercel = JSON.parse(vercelText);
  assert.equal(vercel.framework, "nextjs");
  assert.ok(vercel.headers.some((rule) => rule.source === "/rom-patcher/catalog.json"));
  assert.ok(vercel.headers.some((rule) => rule.source === "/rom-patcher/patches/(.*)"));
});
