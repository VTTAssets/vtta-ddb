import logger from "../util/logger.js";
import config from "../config/index.js";

export default function () {
  const partials = [];
  for (const [id, value] of Object.entries(config.templates.partials)) {
    partials.push(value);
  }
  logger.info("Preparing partials", partials);
  return loadTemplates(partials);
}
