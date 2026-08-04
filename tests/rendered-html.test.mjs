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
  assert.match(html, /0\.9 release notes/);
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
  assert.equal(catalog.patches.length, 11);
  assert.deepEqual(
    catalog.patches.map((patch) => patch.id),
    [
      "sd-gundam-operation-uc-en-v6",
      "mobile-suit-gundam-msvs-en-v1-0",
      "sd-gundam-eiyuu-den-kishi-densetsu-en-v1-0",
      "sd-gundam-eiyuu-den-musha-densetsu-en-v1-0",
      "sd-gundam-g-generation-mono-eye-gundams-en-v1-0",
      "sd-gundam-g-generation-gather-beat-2-en-v1-0",
      "sd-gundam-emotional-jam-en-v1-0",
      "sd-gundam-g-generation-gather-beat-en-v1-0",
      "sd-gundam-gashapon-senki-episode-1-en-v1-0-1",
      "kidou-senshi-gundam-vol-2-jaburo-en-v1-0",
      "kidou-senshi-gundam-vol-1-side-7-en-v1-0",
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
        title: "Mobile Suit Gundam MSVS",
        language: "English",
        revision: "Japan",
        tags: ["ENGLISH", "WS", "IPS", "CERTIFIED"],
      },
      {
        title: "SD Gundam Eiyuu Den: Kishi Densetsu",
        language: "English",
        revision: "Japan",
        tags: ["ENGLISH", "WSC", "IPS", "CERTIFIED"],
      },
      {
        title: "SD Gundam Eiyuu Den: Musha Densetsu",
        language: "English",
        revision: "Japan",
        tags: ["ENGLISH", "WSC", "IPS", "CERTIFIED"],
      },
      {
        title: "SD Gundam G Generation: Mono-Eye Gundams",
        language: "English",
        revision: "Japan",
        tags: ["ENGLISH", "WSC", "IPS", "CERTIFIED"],
      },
      {
        title: "SD Gundam G Generation: Gather Beat 2",
        language: "English",
        revision: "Japan",
        tags: ["ENGLISH", "WSC", "IPS", "CERTIFIED"],
      },
      {
        title: "SD Gundam - Emotional Jam",
        language: "English",
        revision: "Japan, Rev 3",
        tags: ["ENGLISH", "WS", "IPS", "CERTIFIED"],
      },
      {
        title: "SD Gundam G Generation: Gather Beat",
        language: "English",
        revision: "Japan",
        tags: ["ENGLISH", "WS", "IPS", "CERTIFIED"],
      },
      {
        title: "SD Gundam Gashapon Senki - Episode 1",
        language: "English",
        revision: "Japan",
        tags: ["ENGLISH", "WS", "IPS", "CERTIFIED"],
      },
      {
        title: "Kidou Senshi Gundam Vol. 2 - Jaburo",
        language: "English",
        revision: "Japan",
        tags: ["ENGLISH", "WSC", "IPS", "CERTIFIED"],
      },
      {
        title: "Kidou Senshi Gundam Vol. 1 - Side 7",
        language: "English",
        revision: "Japan",
        tags: ["ENGLISH", "WSC", "IPS", "PRACTICAL"],
      },
    ],
  );
  assert.match(component, /customElements\.define\("yokoi-rom-patcher"/);
  assert.match(component, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(component, /patchUrl\.origin !== location\.origin/);
  assert.match(component, /ALLOWED_RELEASE_TAGS/);
  assert.match(component, /"PRACTICAL"/);
  assert.match(component, /data-role="release-tags"/);
  assert.match(component, /`Patch v\$\{this\.patch\.version/);
  assert.match(engines, /export function applyIps/);
  assert.match(engines, /export function applyBps/);
  assert.match(worker, /new Uint8Array\(event\.data\.source\)/);
  assert.doesNotMatch(catalogText, /https?:|base64|romUrl/i);
  assert.deepEqual(patchFiles.sort(), [
    ".gitkeep",
    "kidou-senshi-gundam-vol-1-side-7-en-v1.0.ips",
    "kidou-senshi-gundam-vol-2-jaburo-en-v1.0.ips",
    "mobile-suit-gundam-msvs-en-v1.0.ips",
    "sd-gundam-eiyuu-den-kishi-densetsu-en-v1.0.ips",
    "sd-gundam-eiyuu-den-musha-densetsu-en-v1.0.ips",
    "sd-gundam-emotional-jam-en-v1.0.ips",
    "sd-gundam-g-generation-gather-beat-2-en-v1.0.ips",
    "sd-gundam-g-generation-gather-beat-en-v1.0.ips",
    "sd-gundam-g-generation-mono-eye-gundams-en-v1.0.ips",
    "sd-gundam-gashapon-senki-episode-1-en-v1.0.1.ips",
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
      "mobile-suit-gundam-msvs-en-v1-0",
      {
        filename: "mobile-suit-gundam-msvs-en-v1.0.ips",
        patchSha256: "b72d71278c55b55b9f5bcd4f71186227bdd32a11dd4b6cff3943442a753d0a5e",
        sourceSha256: "d82239a439c51ced0fa7243e21d8f834f70340d072ef55a3ebc73f3d38f560c0",
        targetSha256: "3730917d3ce4f7b2f56ecd0ffc4dcc00a0a8cae1f6b0957fad5cf4820e4a9db1",
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
    [
      "sd-gundam-eiyuu-den-musha-densetsu-en-v1-0",
      {
        filename: "sd-gundam-eiyuu-den-musha-densetsu-en-v1.0.ips",
        patchSha256: "63a7ad99c5fc3d790dae8236cd7f6dc9681600a27170ec44c350904a318aecba",
        sourceSha256: "4cf3d1ee47502a485e2d9be8bd4d963704b0ea5dbee525e6c0e7e9e43efd25c7",
        targetSha256: "177520157459b81a4d6852ae12b65912a5a7f6c5417b0bb966f62511d8383bf6",
      },
    ],
    [
      "sd-gundam-g-generation-mono-eye-gundams-en-v1-0",
      {
        filename: "sd-gundam-g-generation-mono-eye-gundams-en-v1.0.ips",
        patchSha256: "a90a16b00b77d71956067b70029921993eb766afee088e2de35e30831891d51a",
        sourceSha256: "376e4c6b4b81cc3a7dceb15dc4b7d0af04d3e6c8b81e8572569c39d3394870a0",
        targetSha256: "8903e2da3b786e340e630b68b3a82a8fd829cf604178d7b268abdd99e07916e3",
      },
    ],
    [
      "sd-gundam-g-generation-gather-beat-2-en-v1-0",
      {
        filename: "sd-gundam-g-generation-gather-beat-2-en-v1.0.ips",
        patchSha256: "c1c3da03271ec862a11d9c9972065512126f30fe7b5461f39bf62c0d80f7144f",
        sourceSha256: "5ac156cde93438ca1274513c602785de50af1544673fcb27e6d81ddb28276f1d",
        targetSha256: "037b48271beb2adf592052a573b46459421ccd6a03a619e1ff839e7d7824ac34",
      },
    ],
    [
      "sd-gundam-emotional-jam-en-v1-0",
      {
        filename: "sd-gundam-emotional-jam-en-v1.0.ips",
        patchSha256: "e4c7742987da9819bcd58287f63a87025df80578bf5916691105e37240ad409f",
        sourceSha256: "abf1d29c1e1ea37e21757911e4c062c206b4c609368b323bc0ee51e005f3b432",
        targetSha256: "66532caecee023a256a08c0b63d4467528f423a4ebbd6736df02265237c3ea89",
      },
    ],
    [
      "sd-gundam-g-generation-gather-beat-en-v1-0",
      {
        filename: "sd-gundam-g-generation-gather-beat-en-v1.0.ips",
        patchSha256: "193629379762d96a48f1678330d08ac890e3a8e2b6ecae4db3fee0134fa1019b",
        sourceSha256: "8228cf09d5ee43e6f94f38dd2d33d185707bd49e1ef265191fdb2c6cbfe7366f",
        targetSha256: "f3d7c0038ed5d852c78ad579e246f965c7c6c46b0ed7912180a31a5ba0ea5528",
      },
    ],
    [
      "sd-gundam-gashapon-senki-episode-1-en-v1-0-1",
      {
        filename: "sd-gundam-gashapon-senki-episode-1-en-v1.0.1.ips",
        patchSha256: "6bc4363f9b758e9ef2659eaf985f402fa1058ab4427353bdc6828190f8bdeee7",
        sourceSha256: "a96c71af822401eddffd99d88fad57565404504a6fdbb9cab7b01ccb9b2e3540",
        targetSha256: "f3d49f825cc030846dc5dae25a414758f07d572722f1a44357cd3aecd5485132",
      },
    ],
    [
      "kidou-senshi-gundam-vol-2-jaburo-en-v1-0",
      {
        filename: "kidou-senshi-gundam-vol-2-jaburo-en-v1.0.ips",
        patchSha256: "57b964914befe6ebbe586b434d28b4d714dad12db3a84b9e29d2f604cf98ece2",
        sourceSha256: "dd9b62efd251053b24ecc33cf2ca7f19feeb2d51dff0dc23d5d838602f118607",
        targetSha256: "0d78080181327a9a83986e52b1af1f4bfe26d32b51c9f3e1e22503587795944c",
      },
    ],
    [
      "kidou-senshi-gundam-vol-1-side-7-en-v1-0",
      {
        filename: "kidou-senshi-gundam-vol-1-side-7-en-v1.0.ips",
        patchSha256: "e39055abec67bfe13cf4ea6616513f1a1774bc550d6d606a8362c4b44c17f999",
        sourceSha256: "327eedc63abd6cb55c60adcfea33344bdea576567d28914929751b46dbdafe83",
        targetSha256: "5823a28c2b65c7072e938d54a302230f65a8b7cc5270fb2f113db5cf8e3d18ea",
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
    assert.match(patch.outputFilename, /\.wsc?$/);

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
