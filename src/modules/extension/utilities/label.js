import config from "../../../config/index.js";

const createLabel = (text) => {
  return new Promise((resolve, reject) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
    viewBox="0 0 512 512" width="512" height="512">
      <g>
        <circle style="fill:#ffffff;stroke:#010101;stroke-width:30;stroke-miterlimit:10;" cx="250" cy="250" r="220">
        </circle>
        <text font-family='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' font-size="200" font-weight="400" fill="black" x="50%" y="52%" text-anchor="middle" stroke="#000000" dy=".3em">${text}</text>
      </g>
    </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const image = document.createElement("img");

    image.addEventListener("load", async () => {
      const path = `${game.settings.get("vtta-ddb", "sceneImageDirectory")}/${
        config.paths.labels
      }`;

      const OVERWRITE_EXISTING = false;
      const result = await window.vtta.image.upload(
        path,
        `${text}.svg`,
        blob,
        OVERWRITE_EXISTING
      );

      // deliver the result of the upload operation
      if (result.status === "success") {
        resolve(result.path);
      } else {
        reject(result);
      }

      URL.revokeObjectURL(url),
        {
          once: true,
        };
    });
    image.src = url;
  });
};

export default {
  create: createLabel,
};
