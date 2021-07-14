import config from "../config/index.js";

export default function () {
  window.addEventListener(config.messaging.extension.query, (event) => {
    const moduleVersion = game.modules.get(config.module.name).data.version;
    window.dispatchEvent(
      new CustomEvent(config.messaging.extension.response, {
        detail: {
          version: moduleVersion,
        },
      })
    );
  });
}
