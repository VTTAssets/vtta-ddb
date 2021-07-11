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
      
      <p><b>Private Beta</b> Thanks for participating in this private beta, exclusively for you wonderful Patreons. What are we testing in this first step? Stability!</p>
      <p>Mainly the stability of the server environment - there quite some changes been made to the modules, too, but the main work was done server-side and I need to make sure everything is working 
      as planned. Please focus your feedback on</p>
      <ul>
      <li><strong>Response times</strong> How long does it take to import a single monster? Does the response times from parsing a page and going to the next when batch-importing feels alright? <strong>Please note that bringing both browser tabs (D&amp;D Beyond and FVTT) into the foreground speeds up processing significantly!</strong>.</li>
      <li><strong>Functionality</strong> Does it work at all? If not, was is not working?</li>
      </ul>

      <p>Things currently not in focus are</p>
      <ul>
      <li><strong>Inconsistencies in the output</strong>, e.g. maps missing or incomplete, monsters being incorrectly parsed, Journal Entries missing...</li>
      <li><strong>The Forge is not working</strong> - <i>*shrug*</i> I aim for compatibility, but not at the very first step. Let's get vanilla Foundry working first</li>
      </ul>
      
      <h3>Features: New and/or improved</h3>
       <ul>
          <li><b>All Sourcebooks/ Adventures supported</b> - that's a milestone for sure</li>
          <li><b>Better Token generation</b> - If you have <strong>VTTA Tokens</strong> installed, you will see way better auto-generated tokens from now on. You will need to re-import to update the token images though.</li>
          <li><b>Easier (and more stable) FVTT connection</b> - Connect to FVTT just by clicking on the browser icon, it will automatically try to connect. <i>A click saved is a click saved</i></li>
          <li><b>Environment selection</b> - Mainly targetted to developers, but relevant to this beta, too: Select the parser environment from within the extension. While in this beta, the <strong>STAGING environment</strong> at <strong>vtta.dev</strong> will be used exclusively. If you are experiencing issues, change the setting to vtta.dev and reconnect to Foundry</li>
       </ul>

       <p>
       <strong>Have fun!</strong>
       </p>
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
