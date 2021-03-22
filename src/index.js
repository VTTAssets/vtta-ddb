import checkCoreAvailability from "./setup/checkCoreAvailability.js";
import setup from "./setup/index.js";

Hooks.once("ready", async () => {
  try {
    const coreVersionNumber = await checkCoreAvailability();
    console.log("vtta-ddb | Dependency detected, continuing...");
    await setup();
  } catch (error) {
    console.log(
      "vtta-ddb | Dependency 'vtta-core' did not respond in time, aborting start."
    );
    console.log(error);
    const core = game.modules.get("vtta-core");
    const coreMissing = core === undefined;
    const coreDisabled = core && core.active === false;

    if (coreMissing) {
      ui.notifications.error(game.i18n.localize(`ERROR.CoreMissing`), {
        permanent: true,
      });
    }

    if (coreDisabled) {
      ui.notifications.error(game.i18n.localize(`ERROR.CoreDisabled`), {
        permanent: true,
      });
    }
  }
});
