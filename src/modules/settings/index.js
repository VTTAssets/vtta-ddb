import config from "../../config/index.js";
import logger from "../../util/logger.js";
import { semanticVersionCompare } from "../../util/string.js";

export default function () {
  const denyFilter = (pack) => pack.metadata.package !== "dnd5e";

  /**
   * FOLLOWING:
   * Adjustments for 0.8.x
   */
  const actorCompendiums = game.packs
    .filter((pack) =>
      window.vtta.postEightZero
        ? pack.documentName === "Actor"
        : pack.entity === "Actor"
    )
    .filter(denyFilter)
    .reduce(
      (choices, pack) => {
        choices[
          pack.collection
        ] = `[${pack.metadata.package}] ${pack.metadata.label}`;
        return choices;
      },
      { none: "None: Do not save these entities in any compendium" }
    );

  const itemCompendiums = game.packs
    .filter((pack) =>
      window.vtta.postEightZero
        ? pack.documentName === "Item"
        : pack.entity === "Item"
    )
    .filter(denyFilter)
    .reduce(
      (choices, pack) => {
        choices[
          pack.collection
        ] = `[${pack.metadata.package}] ${pack.metadata.label}`;
        return choices;
      },
      { none: "None: Do not save these entities in any compendium" }
    );

  /**
   * END ADJUSTMENTS
   */
  const settings = [
    {
      // log level
      key: "logLevel",
      type: Number,
      default: 0,
      scope: "world",
      config: false,
      public: false,
    },
    {
      key: "sceneImageDirectory",
      type: window.vtta.settings.DirectoryPicker.Directory,
      default: "[data] uploads/scenes",
      scope: "world",
      config: false,
      public: true,
      section: "image",
    },
    // Unused as of 1.0.5
    // {
    //   key: "itemImageDirectory",
    //   type: window.vtta.settings.DirectoryPicker.Directory,
    //   default: "[data] uploads/items",
    //   scope: "world",
    //   config: false,
    //   public: true,
    //   section: "image",
    // },

    // Unused until release
    // Awaiting user feedback, perhaps going a totally different route
    // {
    //   key: "spellCompendium",
    //   type: String,
    //   default: "none",
    //   scope: "world",
    //   choices: itemCompendiums,
    //   config: false,
    //   public: false,
    //   section: "compendium",
    // },
    // {
    //   key: "itemCompendium",
    //   type: String,
    //   default: "none",
    //   scope: "world",
    //   choices: itemCompendiums,
    //   config: false,
    //   public: false,
    //   section: "compendium",
    // },
    // {
    //   key: "monsterCompendium",
    //   type: String,
    //   default: "none",
    //   scope: "world",
    //   choices: actorCompendiums,
    //   config: false,
    //   public: false,
    //   section: "compendium",
    // },

    // release notes
    {
      key: "release-notes-version",
      type: String,
      default: "1.0.0",
      scope: "world",
      config: false,
      public: false,
      section: "tutorial",
    },

    // at which step in the tutorial are we currently
    {
      key: "tutorial-step",
      type: Number,
      default: 0,
      scope: "world",
      choices: actorCompendiums,
      config: false,
      public: false,
      section: "tutorial",
    },
  ];

  // register all settings internally
  settings.forEach((setting, index) => {
    logger.debug(`Registering setting`, setting.name, setting);
    setting.order = index;
    game.settings.register(config.module.name, setting.key, setting);
  });

  /**
   * Buttons
   */
  const buttons = [];

  // show the un-hide button for the release notes, if they are currently hidden
  const unHideReleaseNotesButton = {
    key: "reset-release-notes",
    label: "Unhide Release Notes",
    callback: (event) => {
      event.preventDefault();
      game.settings.set(config.module.name, "release-notes-version", 0);
      window.vtta.ui.Notification.show(
        "Release notes un-hidden",
        `<p>On your next page refresh, the vtta-ddb release notes will be shown again.</p>`
      );
    },
  };

  let releaseNotesHidden = () => {
    const currentVersion = game.modules.get(config.module.name).data.version;
    let previousVersion = game.settings.get(
      config.module.name,
      "release-notes-version"
    );
    return semanticVersionCompare(currentVersion, previousVersion) === 0;
  };
  if (releaseNotesHidden()) {
    buttons.push(unHideReleaseNotesButton);
  }

  // answer to the call of the settings dialog
  window.addEventListener("vtta.configuration.query", () => {
    logger.debug("Event vtta.configuration.query received");
    const reply = new CustomEvent("vtta.configuration.submit", {
      detail: {
        name: config.module.name,
        label: config.module.label,
        settings: settings
          .filter((setting) => setting.public === true)
          .map((setting) =>
            Object.assign(setting, {
              label: game.i18n.localize(`SETTING.${setting.key}.label`),
              hint: game.i18n.localize(`SETTING.${setting.key}.hint`),
              value: game.settings.get(config.module.name, setting.key),
            })
          ),
        buttons: buttons,
      },
    });
    logger.debug("Sending reply to event vtta.configuration.query", reply);
    window.dispatchEvent(reply);
  });
}
