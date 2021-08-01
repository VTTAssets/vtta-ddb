import config from "../../config/index.js";
import logger from "../../util/logger.js";
import query from "./query/index.js";
import add from "./add/index.js";
import postprocess from "./postprocess/index.js";
import connect from "./connect/index.js";

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 150,
});

const processMessage = async (event) => {
  const message = event.detail.data;

  console.log("Received message from extension", message);
  let response;

  switch (message.type) {
    case "QUERY_CONNECTION_STATUS":
      response = connectionStatus(message);
      break;
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

  console.log(response);

  if (response) {
    response.success = true;
    window.dispatchEvent(
      new CustomEvent(event.detail.id, { detail: response })
    );
  } else {
    window.dispatchEvent(
      new CustomEvent(event.detail.id, {
        detail: {
          success: false,
          reason: "Unknown command",
          data: null,
        },
      })
    );
  }
};

export default () => {
  // register the default handler for all extension messages
  window.addEventListener(config.messaging.extension.default, processMessage);
  window.addEventListener(config.messaging.extension.message, processMessage);
};
