import config from "../../config/index.js";
import onShowImage from "./onShowImage.js";

const listen = () => {
  game.socket.on("module." + config.module.name, (data) => {
    if (data.sender === game.user.data._id) {
      return;
    }

    switch (data.action) {
      case "showImage":
        return onShowImage(data);
    }
  });
};

const send = (action, data) => {
  game.socket.emit("module." + config.module.name, {
    sender: game.user.data._id,
    action: action,
    ...data,
  });
};

export default { listen, send };
