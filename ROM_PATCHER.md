# Yokoi browser ROM patcher

The site patcher is a framework-independent Web Component served as static files by Vercel. It does not need an API route, server function, database, or object-storage integration.

## Embed it

The Yokoi Next.js homepage uses `app/components/RomPatcherEmbed.tsx`. On any other page or site, the complete integration is:

```html
<script type="module" src="/rom-patcher/yokoi-rom-patcher.js"></script>
<yokoi-rom-patcher catalog-url="/rom-patcher/catalog.json">
  <p>Loading the local patch station…</p>
</yokoi-rom-patcher>
```

The element has its own Shadow DOM styles, so host-page CSS cannot accidentally break the patching interface. These optional attributes adjust memory limits:

```html
<yokoi-rom-patcher
  catalog-url="/rom-patcher/catalog.json"
  max-rom-bytes="268435456"
  max-patch-bytes="67108864"
></yokoi-rom-patcher>
```

## Publish a translation

1. Copy the release patch into `public/rom-patcher/patches/`.
2. Give every immutable release a versioned filename such as `game-title-en-v1.0.0.bps`.
3. Add one entry to `public/rom-patcher/catalog.json`.
4. Build and test the site.
5. Deploy to Vercel.

Example catalog entry:

```json
{
  "version": 1,
  "patches": [
    {
      "id": "game-title-en-1-0-0",
      "title": "Game Title — English",
      "originalTitle": "Original Japanese Title",
      "system": "WonderSwan Color",
      "revision": "Japan, Rev 1",
      "version": "1.0.0",
      "credits": "Translation Team",
      "patchUrl": "./patches/game-title-en-v1.0.0.bps",
      "patchFormat": "bps",
      "sourceSize": 4194304,
      "sourceSha256": "64-lowercase-hex-characters",
      "targetSha256": "64-lowercase-hex-characters",
      "outputFilename": "game-title-english.wsc"
    }
  ]
}
```

`sourceSize` is an optional fast check. Both SHA-256 values are mandatory. Invalid or incomplete entries are ignored by the component.

Calculate release values locally, never on Vercel:

```bash
wc -c < owned-original.wsc
shasum -a 256 owned-original.wsc
shasum -a 256 verified-english.wsc
```

Keep the two ROM files private. Commit only the translation patch and catalog metadata.

## Browser privacy model

The browser performs this sequence:

1. Read the visitor-selected local file.
2. Reject a wrong byte size when the catalog specifies one.
3. Calculate and compare the source SHA-256.
4. Download the same-origin IPS/BPS patch.
5. Apply it inside a Web Worker.
6. Calculate and compare the finished ROM SHA-256.
7. Create a local Blob download only after verification succeeds.

The ROM, its SHA-256, and the finished result are never placed in a request. Vercel sees ordinary requests for the page, catalog, JavaScript modules, worker, and selected patch file.

## Patch and deployment rules

- Only IPS and BPS are accepted.
- Patch URLs must resolve to the same origin as the website.
- BPS source, target, and patch CRC-32 fields are validated in addition to the catalog hashes.
- IPS records, run-length records, expansion, and the common three-byte truncate extension are supported.
- The default ROM allocation limit is 256 MiB; the default patch limit is 64 MiB.
- Patch files receive a one-year immutable Vercel cache header, so never replace a published file at the same URL. Publish a new versioned filename.
- The catalog uses revalidation headers so a deployment can publish new releases promptly.

## Integration events

The component emits bubbling events without ROM bytes or hashes:

```js
const patcher = document.querySelector("yokoi-rom-patcher");

patcher.addEventListener("rom-patcher:ready", (event) => {
  console.log(event.detail.patchCount);
});

patcher.addEventListener("rom-patcher:complete", (event) => {
  console.log(event.detail.patchId, event.detail.outputBytes);
});
```

`rom-patcher:error` contains only the selected patch ID, if any. Do not add analytics that capture filenames, local file data, hashes, or ROM-derived values.

