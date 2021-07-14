import { semanticVersionCompare } from "../../../util/string.js";
import config from "../../../config/index.js";

export default async (message) => {
  const { user, extension } = message.data;

  const extensionRequirementMet = (requiredVersion, installedVersion) => {
    if (semanticVersionCompare(installedVersion, requiredVersion) === -1) {
      return false;
    }
    return true;
  };

  if (
    extensionRequirementMet(config.requirements.extension, extension.version)
  ) {
    window.vtta.ui.Notification.show(
      extension.name + " connected",
      `<p>You connected using <strong>v.${extension.version}</strong> of the extension.</p>`
    );

    // save the extension token
    game.settings.set("vtta-core", "access_token", user.token);
    // save the extension's parser environment
    game.settings.set("vtta-core", "environment", extension.environment);

    return {
      type: "CONNECT_RESPONSE",
      data: {
        success: true,
      },
    };
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

    return {
      type: "CONNECT_RESPONSE",
      data: {
        success: false,
      },
    };
  }
};
