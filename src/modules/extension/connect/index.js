import { semanticVersionCompare } from "../../../util/string.js";
import config from "../../../config/index.js";

const collectSystemData = () => {
  return {
    system: {
      label: game.system.data.title,
      version: game.system.data.version,
    },
    core: {
      world: game.data.world.data.title,
      version: game.data.version,
    },
  };
};

export default async (message) => {
  return {
    type: "ISALIVE_RESPONSE",
    data: Object.assign({ success: true }, collectSystemData()),
  };
};
