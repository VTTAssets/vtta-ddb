import config from "../config/index.js";

export default {
  debug: (...data) => window.vtta.logger.debug(config.module.name, data),
  info: (...data) => window.vtta.logger.info(config.module.name, data),
  warn: (...data) => window.vtta.logger.warn(config.module.name, data),
  error: (...data) => window.vtta.logger.error(config.module.name, data),
};
