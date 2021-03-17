import config from "../../../config/index.js";
import connectToFoundry from "./connectToFoundry.js";

const nextStep = () => {
  let step = game.settings.get(config.module.name, "tutorial-step");
  game.settings.set(config.module.name, "tutorial-step", ++step);
  return step;
};

const getStep = () => {
  return game.settings.get(config.module.name, "tutorial-step");
};

const waitForElement = (selector, retries = 10, timeout = 200) => {
  let element;
  return new Promise((resolve, reject) => {
    let tries = 0;
    let interval = setInterval(() => {
      tries++;

      // search for the element
      element = $("body").find(selector);

      // Found it!
      if (element.length > 0) {
        clearInterval(interval);
        resolve(element);
      } else {
        // Nah, not yet
        if (tries > retries) {
          clearInterval(interval);
          reject("Element not found");
        }
      }
    }, timeout);
  });
};

const setup = async () => {
  let hint;
  const BTN_NEXT = "Next";
  const BTN_EXIT = "Exit Tutorial";
  const BTN_NO = "No";
  const BTN_YES = "Yes";

  /**
   * Check if the electron app is used right now
   */
  if (/Mozilla/i.test(navigator.userAgent)) {
    // if (/electron/i.test(navigator.userAgent)) {
    let text = `<h1>First things first</h1>
    <p>It seems that you are connected to your Foundry server by logging in into the <b>native application</b>. In order to use the D&amp;D Beyond bridge and to follow this tutorial until the end, you will need to <b>connect 
    to your Foundry server with Google Chrome</b> instead.</p>
    <p>I can show you how to do that. Do you want to know more?</p>`;

    hint = await window.vtta.ui.Hint.show(text, {
      align: "CENTER",
      next: true,
      width: window.innerWidth * 0.5,
      buttons: [BTN_YES, BTN_NO, BTN_EXIT],
    });

    switch (hint) {
      case BTN_YES:
        return connectToFoundry();
      case BTN_EXIT:
        return true;
    }
  }

  game.settings.set(config.module.name, "tutorial-step", 0);

  // see if we should actually run the tutorial
  let tutorialStep = 0; // getStep();

  // Do not play the tutorial if it was completed already
  if (tutorialStep === -1) return;

  /**
   * Step through the tutorial
   */
  if (tutorialStep === 0) {
    window.vtta.ui.Notification.show("Tutorial Step " + tutorialStep);
    let gms = game.users.entities
      .filter((user) => user.isGM && user.active)
      .map((user) => ({ _id: user.data._id, name: user.data.name }));

    let text = `<h1>Welcome to VTTA!</h1>
    <p>In this small tutorial, you will learn a little bit about Foundry and will be guided through the steps that are necessary to make the most out of the <b>VTTA D&amp;D Beyond Integration</b>.</p>
    <p>The tutorial is built from hints as the one you are reading right now. In the upper part you will find (hopefully helpful) information and in the lower part you will find a pointer on how to continue. Sometimes, continuing is as easy as clicking a <b>Next</b> button, sometimes you have to identify a specific control of the Foundry VTT user interface.</p>
    <p>I tried spicing it up with some general information about Foundry VTT while going through Foundry's user interface. If you know all or most of it, sorry! But perhaps you will learn a tiny bit of information along the way. <b>Feedback is appreciated!</b></p>
    <hr />
    <p>Click <b>Next</b> to continue.</p>`;

    hint = await window.vtta.ui.Hint.show(text, {
      align: "CENTER",
      next: true,
      width: window.innerWidth * 0.5,
      buttons: [BTN_NEXT, BTN_EXIT],
    });

    if (hint === BTN_EXIT) return;

    tutorialStep = nextStep();
  }

  if (tutorialStep === 1) {
    window.vtta.ui.Notification.show("Tutorial Step " + tutorialStep);
    // Sidebar - hidden when Compendium is clicked.
    hint = await window.vtta.ui.Hint.show(
      `<h1>Sidebar</h1>
       <p>This sidebar is your main administrational area. Along with <b style="white-space: nowrap"><i class="fas fa-comments"></i> Chat Log</b> and
         <b style="white-space: nowrap"><i class="fas fa-fist-raised"></i> Combat Tracker</b>, you will find the content-related sections you will be using
         quite a bit as the Gamemaster, especially with: </p>
      <ul>
      <li><b><i class="fas fa-map"></i> Scenes Directory</b>: Battlemaps</li>
      <li><b><i class="fas fa-users"></i> Actors Directory</b>: Monsters, NPCs and Player characters</li>
      <li><b><i class="fas fa-suitcase"></i> Items Directory</b>: Items like Equipment, but also
        Spells, Tools, Weapons. Items is a very broad category in Foundry VTT</li>
      <li><b><i class="fas fa-book-open"></i> Journal Entries</b>: Descriptions, Session logs, everything text and images </li>
      <li><b><i class="fas fa-th-list"></i> Rollable Tables</b>: Spice up your games by adding a pint of randomness into it</li>
      <li><b><i class="fas fa-atlas"></i> Compendium Packs</b>: Think of those as large dictionaries. You can store the items above in these</li>
      <li><b><i class="fas fa-cogs"></i> Game Settings</b></li>
      </ul>
      <hr />
      <p>Let's head over to the Game Settings first. Click on the cog wheel icon <b><i class="fas fa-cogs"></i> Game Settings</b> in the sidebar to continue.</p>
     `,
      {
        element: $("#sidebar"),
        align: "LEFT",
        hide: {
          selector: '#sidebar-tabs a[data-tab="settings"]',
          event: "click",
        },
        width: 400,
      }
    );
    tutorialStep = nextStep();
  }
  if (tutorialStep === 2) {
    window.vtta.ui.Notification.show("Tutorial Step " + tutorialStep);
    // next step is triggered when the sidebar compendium entry is clicked
    hint = await window.vtta.ui.Hint.show(
      `<h1>Game Settings</h1>
      <p>This sidebar houses all <b>Game Settings</b> related to your currently running world (versus 
        the general setup you do before starting a world), some <b>Help and Documentation</b> links 
        and last but not least: The <b>Invitation Links</b> that you can send to your players to allow them to connect
        to your Foundry VTT server.
      </p>
      <p>We are mainly interested in the <b>Game Settings</b>. As you probably know, using a new Foundry module requires three basic steps:</p>
      <ol>
        <li>Download and install the module</li>
        <li>Enable the module in <b>Manage Modules</b></li>
        <li>Configure the module in <b>Configure Settings</b></li>
      </ol>
      <p><b>Disclaimer:</b> Yes, not all modules require configuration, but most of them do.</p>
      <p>Since you are seeing this tutorial, you successfully completed the first two steps, so let's look at the configuration.</p>
      <hr />
      <p>Click on the <b><i class="fas fa-cogs"></i> Configure Settings button</b> in the sidebar to continue.</p>
         `,
      {
        element: $("#sidebar"),
        align: "LEFT",
        hide: {
          selector: "#sidebar #settings #settings-game > button:nth-child(1)",
          event: "click",
        },
        width: 400,
      }
    );
    tutorialStep = nextStep();
  }

  if (tutorialStep === 3) {
    window.vtta.ui.Notification.show("Tutorial Step " + tutorialStep);

    let dialog = await waitForElement("#client-settings");

    const modulesInstalled = [...game.modules]
      .map((moduleInfo) => moduleInfo.pop())
      .filter((mod) => mod.active).length;
    let moduleCountReaction = "";
    if (modulesInstalled < 5) {
      moduleCountReaction = `I can see you have ${modulesInstalled} modules enabled, which seems like a fine selection of necessary modules`;
    } else {
      if (modulesInstalled > 5 && modulesInstalled < 10) {
        moduleCountReaction = `with ${modulesInstalled} enabled modules you should be there quickly`;
      } else {
        if (modulesInstalled > 10 && modulesInstalled < 15) {
          moduleCountReaction = `alright, ${modulesInstalled} modules enabled. I know who to ask if I am looking for something advice regaring good modules ;)`;
        } else {
          moduleCountReaction = `${modulesInstalled} modules enabled! You will need a new mousewheel when you finally reached the VTTA section ;)`;
        }
      }
    }

    const activeTab = $(dialog).find("nav.tabs a.active").text().trim();

    hint = await window.vtta.ui.Hint.show(
      `<h1>Configuring Game Settings</h1>
      <p>The settings are divided in three main categories: <b>Core Settings</b>, <b>System Settings</b> 
      and <b>Module Settings</b>, with <b>${activeTab}</b> being currently displayed. ${
        activeTab !== "Module Settings"
          ? "Click on <b>Module Settings</b> do bring that tab into the foreground now. "
          : ""
      }.</p>
      <p>Scroll down until the section titled <b>VTTA Core</b> is visible (${moduleCountReaction}).</p>
      <p>Since all modules are working very closely together, I decided to create a centralized settings panel for them. You can open this panel by clicking on the <b>Open Configuration</b> button in the <b>VTTA Core</b> section to the right.</p>
      <p>Oh, and if you are already a couple of steps ahead of this tutorial, you will see the button that opens the <b>Bug Reporter</b> in this section, too! Keep that in mind for later.</p>
      <hr />
      <p>Open the VTTA configuration by clicking on the <b>Open Configuration</b> button to continue.</p>`,
      {
        element: dialog,
        align: "LEFT",
        hide: {
          selector: $('#client-settings button[data-key="vtta-core.settings"]'),
          event: "click",
        },
      }
    );
    tutorialStep = nextStep();
  }

  if (tutorialStep === 4) {
    window.vtta.ui.Notification.show("Tutorial Step " + tutorialStep);

    let dialog = await waitForElement("div.app.vtta.ui.settings");

    const vttaTokens = game.modules.get("vtta-tokens");
    const isTokensInstalled = vttaTokens && vttaTokens.active;

    hint = await window.vtta.ui.Hint.show(
      `<h1>Configuration (1)</h1>
      ${
        isTokensInstalled
          ? `<p>With both <b>vtta-ddb</b> and <b>vtta-tokens</b> installed, you will see two sections in the configuration screen: <b>Image Settings</b> and <b>Token Settings</b></p>
      <p>This centralized approach breaks with the clear seperation of settings per module, since e.g. the <b>Target directory for actor-related images</b> is used by both 
      modules to store images related to actors. The idea was to have a more concise and less cluttered configuration panel.</p>`
          : `<p>With only <b>vtta-ddb</b> installed and <b>vtta-tokens</b> missing (it is a great companion to vtta-ddb, perhaps check it out?!) you will see just one setting section: <b>Image Settings</b>. 
          Still, the setting <b>Target directory for actor-related images</b> would be used by both modules to store their actor-related images. The idea was to have a more concise and less cluttered configuration panel.</p>`
      }
            <p>Another VTTA-specialty are controls specific to select files (<i>"Which token frame image should we use?"</i>) or directories (<i>"Where should we save monster images to?"</i>), e.g. in the <b>Default border frame image for Player characters</b>. You cannot type in a new value in the input textfield, but you need to choose the location
      by opening the file picker by clicking on the <b><i class="fas fa-file-import fa-fw"></i></b> button right next to the input textfield.</p>
      <hr />
      <p>Click <b>Next</b> to continue.</p>`,
      {
        element: dialog,
        align: "LEFT",
        buttons: [BTN_NEXT],
      }
    );
    tutorialStep = nextStep();
  }

  if (tutorialStep === 5) {
    window.vtta.ui.Notification.show("Tutorial Step " + tutorialStep);

    const isUsingForge =
      document.URL.toLowerCase().indexOf("forge-vtt.com") !== -1;
    const isS3Available =
      game.data.files.s3 &&
      game.data.files.s3.endpoint &&
      game.data.files.s3.endpoint.host;

    let dialog = await waitForElement("div.app.vtta.ui.settings");
    hint = await window.vtta.ui.Hint.show(
      `<h1>Configuration (2)</h1>
      <p>Adjust the settings to your liking. If you just want to give it a go, the default values should work great already.</p>
      ${
        isUsingForge
          ? "<p><b>Just one recommendation</b> You seem to use <b>The Forge</b>. I recommend to configure the target directories for images to be located on your <b>Asset Library</b>. It makes sense to use the same storage for all your worlds to save disk space.</p>"
          : ""
      }
      ${
        isS3Available
          ? "<p><b>Just one recommendation</b> You seem to use <b>S3 storage</b>. I recommend to configure the target directories for images to be located on your <b>S3 storage</b>. It makes sense to use the same storage for all your worlds to save disk space.</p>"
          : ""
      }
      <p>You are now ready to install the Chrome extension begin the next step: Installing the Chrome extension and connecting both tools in order to work together.</p>
      <hr />
      <p>Click <b>Next</b> to continue.</p>`,
      {
        element: dialog,
        align: "LEFT",
        buttons: [BTN_NEXT],
      }
    );
    tutorialStep = nextStep();
  }

  if (tutorialStep === 5) {
    window.vtta.ui.Notification.show("Tutorial Step " + tutorialStep);

    let dialog = await waitForElement("div.app.vtta.ui.settings");
    hint = await window.vtta.ui.Hint.show(
      `<h1>Configuration (2)</h1>
      <p>Adjust the settings to your liking. If you just want to give it a go, the default values should work great already. Just one recommendation: 
      If you are using <b>S3 storage</b> (or are hosted on <b>The Forge</b> and can use the Asset Library, which is basically S3), then configure the target directories to use those storage areas. It makes sense in the long run.</p>
      <hr />
      <p>You are now ready to install the Chrome extension begin the next step: Installing the Chrome extension and connecting both tools in order to work together.</p>
      <hr />
      <p>Click <b>Next</b> to continue.</p>`,
      {
        element: dialog,
        align: "LEFT",
        buttons: [BTN_NEXT],
      }
    );
    tutorialStep = nextStep();
  }

  if (tutorialStep === 5) {
    window.vtta.ui.Notification.show("Tutorial Step " + tutorialStep);

    const isElectronApp = /electron/i.test(navigator.userAgent);

    hint = await window.vtta.ui.Hint.show(
      `<h1>Chrome extension</h1>
      <p>In order to retrieve content from D&amp;D Beyond into your Foundry server, you will need a bridge that messages can take from one end to the other. The Chrome extension is that bridge. </p>
      ${
        isElectronApp
          ? "<p><b>Note:</b> You seem to be curently logged in into the native Foundry application instead of using Google Chrome to administer your server.  It is not possible to use Chrome extensions from within the native application."
          : ""
      }
      <hr />
      <p>Click <b>Next</b> to continue.</p>`,
      {
        element: dialog,
        align: "LEFT",
        buttons: [BTN_NEXT],
      }
    );
    tutorialStep = nextStep();
  }
};

export default setup;
