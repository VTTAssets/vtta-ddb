import config from "../config/index.js";
import { semanticVersionCompare } from "../util/string.js";

const collectSystemData = () => {
  return {
    system: {
      label: game.system.data.title,
      version: game.system.data.version,
    },
    core: {
      world: window.vtta.postEightZero
        ? game.data.world.data.title
        : game.data.world.title,
      version: game.data.version,
    },
    vtta: {
      core: game.modules.get("vtta-core").data.version,
      ddb: game.modules.get("vtta-ddb").data.version,
    },
  };
};

export default function () {
  window.addEventListener(config.messaging.extension.query, (event) => {
    console.log(
      "[vtta-ddb] Received event " + config.messaging.extension.query
    );

    const message = event.detail;
    console.log(event.detail);
    const { user, extension } = message;

    const extensionRequirementMet = (requiredVersion, installedVersion) => {
      if (semanticVersionCompare(installedVersion, requiredVersion) === -1) {
        return false;
      }
      return true;
    };

    if (
      extensionRequirementMet(config.requirements.extension, extension.version)
    ) {
      if (!user || !user.token) {
        window.vtta.ui.Notification.show(
          extension.name + " connected",
          `<p>You connected using <strong>v.${extension.version}</strong> of the extension, but you have not connected your VTTA.io user to the extension. Follow the steps displayed in the extension's popup menu in the upper right to continue.</p>`,
          null,
          { css: "warning" }
        );
      } else {
        window.vtta.ui.Notification.show(
          extension.name + " connected",
          `<p>You connected using <strong>v.${extension.version}</strong> of the extension.</p>`
        );

        // save the extension token
        game.settings.set("vtta-core", "access_token", user.token);
        // save the extension's parser environment
        game.settings.set("vtta-core", "environment", extension.environment);
      }
    } else {
      window.vtta.ui.Notification.show(
        "Incompatible Browser Extension",
        `<p>You connected using <strong>v.${extension.version}</strong> of the extension, 
       but ${config.module.name} requires at least <strong>v.${config.requirements.extension}</strong> to function correctly.</p>
       <p>Extension updates are rolled out by Google in waves and your update might not have reached you yet. To force an update, 
       you can uninstall the extension and re-install it from the Webstore again. 
      </p>`,
        null,
        { css: "warning" }
      );
    }

    window.dispatchEvent(
      new CustomEvent(config.messaging.extension.response, {
        detail: collectSystemData(),
      })
    );
  });
}
