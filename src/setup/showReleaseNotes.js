import config from "../config/index.js";
import Tutorial from "../modules/tutorial/index.js";

import { semanticVersionCompare } from "../util/string.js";

export default async () => {
  const currentVersion = game.modules.get(config.module.name).data.version;
  let previousVersion = game.settings.get(
    config.module.name,
    "release-notes-version"
  );

  let showPopup = semanticVersionCompare(currentVersion, previousVersion) === 1;
  if (!showPopup) {
    return true;
  }

  // display the popup for this release
  const BTN_HIDE_TILL_UPDATED = "Hide till updated";
  const BTN_SHOW_TUTORIAL = "Start Tutorial";
  const BTN_CLOSE = "Close";

  let result = await window.vtta.ui.Hint.show(
    `<h1>Release Notes: ${game.modules.get(config.module.name).data.title} v${
      game.modules.get(config.module.name).data.version
    }</h1>
      <h2>Notable Changes</h2>
      <ul>
        <li>Microsoft Edge will have the extension available on it's own store once Microsoft's review completes</li>
        <li>Fixed the Reload bug from the Chrome extension by rewriting most of the underlying code.</li>
        <li>Six spellcaster are now receiving all of their spells and not only their cantrips, e.g. the <a href="https://www.dndbeyond.com/monsters/evil-mage">Evil Mage</a></li>
        <li>Improved output on D&amp;D Beyond pages, especially when importing adventures and sourcebooks</li>
        <li>Monster Manual is now importable and redirects to importing all monsters contained in the Monster Manual</li>
        <li><a href="https://www.vtta.io/articles/getting-started">Getting Started</a> Guide is available.</li>
        <li><a href="https://www.vtta.dev/status">Always updated Status</a> page is available.</p>
      </ul>

      <p>With the major roadblocks out of the way, the module that enables you to share your adjustments easily will be released next and a coordinated effort to heavily improve the data will follow.</p>
      
      <hr />
         `,
    {
      element: null,
      align: "CENTER",
      hide: {
        selector: '#sidebar-tabs a[data-tab="compendium"]',
        event: "click",
      },
      buttons: [BTN_SHOW_TUTORIAL, BTN_HIDE_TILL_UPDATED, BTN_CLOSE],
      width: window.innerWidth / 2,
    }
  );

  switch (result) {
    case BTN_CLOSE:
      break;
    case BTN_HIDE_TILL_UPDATED:
      game.settings.set(
        config.module.name,
        "release-notes-version",
        game.modules.get(config.module.name).data.version
      );
      window.vtta.ui.Notification.show(
        "Release notes hidden",
        `<p>The release notes will be shown on the next update only. You can un-hide the message in the VTTA configuration.</p>`
      );
      break;
    case BTN_SHOW_TUTORIAL:
      return Tutorial.setup();
  }

  return result;
};
