import config from "../config/index.js";

export default function () {
  window.addEventListener(config.messaging.extension.query, (event) => {
    console.log("Extension is querying for vtta-ddb");
    fetch("/modules/vtta-ddb/module.json")
      .then((response) => response.json())
      .then((json) => {
        window.dispatchEvent(
          new CustomEvent(config.messaging.extension.response, {
            detail: {
              version: json.version,
            },
          })
        );
      });
  });
}
