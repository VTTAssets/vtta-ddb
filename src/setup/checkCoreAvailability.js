import config from "../config/index.js";
import logger from "../util/logger.js";

const checkCoreAvailability = () => {
  logger.info(`Querying for vtta-core`);
  return new Promise((resolve, reject) => {
    // query only so many times as configured
    let coreAvailabilityTries = 0;

    // setting up the interval
    const coreQueryInterval = setInterval(() => {
      coreAvailabilityTries++;
      logger.info(
        `Querying for vtta-core (${coreAvailabilityTries} attempt)...`
      );

      // if we exceed the number of queries, we abort the setup
      if (coreAvailabilityTries > config.messaging.core.retries) {
        clearInterval(coreQueryInterval);
        logger.warn(`No answer from vtta-core, aborting start.`);
        reject();
      }

      const availabilityQueryHandler = (event) => {
        // remove self from the event listeners
        window.removeEventListener(
          config.messaging.core.response,
          availabilityQueryHandler
        );
        // stop the interval
        clearInterval(coreQueryInterval);

        logger.info(`vtta-core v${event.detail.version} found.`);
        // resolve with the core version number
        resolve({
          version: event.detail.version,
        });
      };

      // add the event listener to the window-object
      window.addEventListener(
        config.messaging.core.response,
        availabilityQueryHandler
      );

      // dispatch the query event
      window.dispatchEvent(new CustomEvent(config.messaging.core.query));

      // do not wait forever for a reply, run into a timeout
      setTimeout(() => {
        window.removeEventListener(
          config.messaging.core.response,
          availabilityQueryHandler
        );
      }, config.messaging.core.timeout);

      // and repeat that for that given timeout
    }, config.messaging.core.timeout * 5);
  });
};

export default checkCoreAvailability;
