import config from "../config/index.js";
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
  let result = await window.vtta.ui.Hint.show(
    `<h1>Release Notes: ${game.modules.get(config.module.name).data.title} v${
      game.modules.get(config.module.name).data.version
    }</h1>
      <h2>Iteration #2: First release</h2>
      <p>Welcome to the all-new D&amp;D Beyond integration tool suite - make sure to follow the write-ups on  <a href="https://www.vtta.io">vtta.io</a>, the video instructions on the <a href="https://www.youtube.com">Youtube channel</a> for always updated information on </p>
      <ul>
      <li>the prerequisites (if you can read this you already read up on that, great!)</li>
      <li>changed workflows</li>
      <li>improvements by making the modules really work together</li>
      </ul>
      <hr />
         `,
    {
      element: null,
      align: "CENTER",
      hide: {
        selector: '#sidebar-tabs a[data-tab="compendium"]',
        event: "click",
      },
      buttons: ["Hide till updated", "Close"],
      width: window.innerWidth / 2,
    }
  );

  if (result !== "Close") {
    // set the version number for the popup to be shown to this version
    game.settings.set(
      config.module.name,
      "release-notes-version",
      game.modules.get(config.module.name).data.version
    );
    window.vtta.ui.Notification.show(
      "Release notes hidden",
      `<p>The release notes will be shown on the next update only. You can un-hide the message in the VTTA configuration.</p>`
    );
  }
  return result;
};
