import config from "../../config/index.js";
import logger from "../../util/logger.js";
import query from "./query/index.js";
import add from "./add/index.js";
import postprocess from "./postprocess/index.js";
import connect from "./connect/index.js";
import CONSTANTS from "../../config/CONSTANTS.js";

const sendResponse = (event, response) => {
  window.dispatchEvent(new CustomEvent(event.detail.id, { detail: response }));
};

export default () => {
  logger.info(
    "Listening to events of type " + config.messaging.extension.default
  );

  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 150,
  });
  // register the default handler for all extension messages
  window.addEventListener(config.messaging.extension.default, async (event) => {
    const message = event.detail.data;

    console.log("Received message from extension", message);
    let response;

    switch (message.type) {
      case "CONNECT":
        response = await connect(message);
        break;
      case "QUERY":
        response = await query(message);
        break;
      case "ADD":
        response = await limiter.schedule(() => add(message));
        break;
      case "POSTPROCESS":
        response = await postprocess(message);
        break;
    }

    if (response) {
      response.success = true;
      sendResponse(event, response);
    } else {
      sendResponse(event, {
        success: false,
        reason: "Unknown command",
        data: null,
      });
    }
  });
};
