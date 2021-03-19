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
      
      <p><b>Welcome to the all-new D&amp;D Beyond integration tool suite!</b> To learn about using the tools and the differences to the last iterations of tools please refer to the 
      written documentation on <a href="https://www.vtta.io">vtta.io</a> . If you prefer videos over text, you can always head to 
      my <a href="https://www.youtube.com/channel/UCtiINH3_xh7-k0IN1kLA83Q">YouTube channel</a>. Videos will be added regularly with even more thorough information - perfect for newer users.</p>

      <h3>Features</h3>
       <ul>
          <li><b>Versions everywhere</b> - automatically received updated versions of monsters, spells and items just by browsing D&amp;D Beyond with a connected Foundry VTT server running in the background</li>
          <li><b>Enhanced source and adventure book import</b> - server-side parsing increases the quality of the result within Foundry VTT significantly</li>
          <li><b>Cross- and back-referenced journal entries</b> - the imported journal entries will reference known entities found within Foundry VTT with internal links while the original links to D&amp;D Beyond will be retained, too. All the information, readily available, everywhere.</li>
          <li><b>Automated token creation</b> - an installed <b>vtta-tokens</b> will make session prep even more easy</li>
       </ul>

       <h3>Bugs</h3>
       <p>You are using a brand-new set of tools. Many moving parts enable you to quickly prepare your sessions in the future. <b>There will definitely be bugs</b> if a massive amount of users will start using the tools in contrast to me 
       testing everything with four test accounts on my development environment.</p>
       <h4>How to report bugs</h4>
       <p>Use the <b>Bug Reporter</b> only, please. It can be found by going to <b>Game Settings</b> &gt; <b>Configure Settings</b> &gt; <b>Module Settings</b> in the <b>VTTA Core</b> section. 
       If you don't see a big, red button:</p>
       <ul>
        <li>Connect your Discord account to your VTTA.io account: <a href="https://www.vtta.io">vtta.io</a></li>
        <li>(Re-)connect the extension to vtta-ddb, then reload Foundry with <b>CTRL-R</b></li>
        <li>Head back to the Bug Reporter, the button will now be visible</li>
       </ul>
       <p><b>Note:</b> In order to avoid being overwhelmed with reports, the use of the Bug Reporter is a <b>Patreon-only feature in the initial phase of the relaunch</b>. Thank you for your understanding.</p>
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
