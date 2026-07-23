# Yokoi website

The Vercel-deployed Yokoi site for WonderSwan projects, downloads, and the browser-local English translation patcher.

## Development

```bash
npm install
npm run dev
npm test
```

The production Vercel build uses `npx next build` from `vercel.json`. The repository also retains its vinext build for local and Cloudflare-compatible validation.

## ROM patcher

The homepage embeds a framework-independent Web Component from `public/rom-patcher/`. Read [ROM_PATCHER.md](ROM_PATCHER.md) before publishing a translation release.

The catalog contains only release-certified translations. The repository may
include immutable IPS or BPS files and source-safe verification metadata, but
never ROMs, BIOS files, saves, screenshots, extracted game assets, or
ROM-derived test fixtures.

## Translation archive

The homepage PDF library is driven by `app/data/translationCatalog.ts`. To add a document:

1. Put the finished PDF in `public/translations/` using a stable, descriptive filename.
2. Add its title, credits, source language, page count, topics, and file path to the catalog.
3. Build the site and confirm both the browser-reader and download links.

The library searches across document metadata, filters by type, and reveals results in groups of 12 so the page remains manageable as the archive grows. Published PDF responses are cached as immutable, so use a versioned filename when replacing an existing file.
