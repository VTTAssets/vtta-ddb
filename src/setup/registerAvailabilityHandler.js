import config from "../config/index.js";

export default function () {
  console.log("Listening for extension events");
  window.addEventListener(config.messaging.extension.query, (event) => {
    console.log("Extension is querying for vtta-ddb");

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
