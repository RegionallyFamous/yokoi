import { createElement } from "react";

export default function RomPatcherEmbed() {
  return (
    <>
      <script
        src="/rom-patcher/yokoi-rom-patcher.js"
        type="module"
        async
      />
      {createElement(
        "yokoi-rom-patcher",
        {
          "catalog-url": "/rom-patcher/catalog.json",
          "aria-label": "Yokoi browser ROM translation patcher",
        },
        <p className="patcher-loading" role="status">
          Loading the local patch station…
        </p>,
      )}
    </>
  );
}
