const connectToFoundry = async () => {
  const EXIT_BUTTON = "Exit Tutorial";
  const NEXT_BUTTON = "Next";
  let result;
  /**
   * STEP 1
   */
  let text = `<h1>What is "Native App"?</h1>
    <p>You probably know that Foundry VTT consists of two components:</p>
      <ol>
          <li>A <b>server</b> that is managing all the data and handles</li>
          <li>one or multiple <b>clients</b>, which connect to the server in order to play together</li>
      </ol>
      <p>When you run Foundry VTT by clicking on the Foundry executable, you are starting both components at the same time. The server is running, invisible to you in the background and all you see is the user interface: A client in itself. This is what I call the <b>"Native App"</b>-mode.</p>
      <hr />`;
  // Welcome - hidden on "Next"
  result = await window.vtta.ui.Hint.show(text, {
    align: "CENTER",
    buttons: [EXIT_BUTTON, NEXT_BUTTON],
    width: window.innerWidth * 0.5,
  });

  if (result === EXIT_BUTTON) return;

  /**
   * STEP 2
   */
  text = `<h1>The Chrome extension</h1>
     <p><b>Bold Assumption</b>: You already visited the <a href="https://chrome.google.com/webstore/detail/vttassets-dd-beyond-found/mhbmahbbdgmmhbbfjbojneimkbkamoji" target="_blank">Chrome Webstore</a>
    to install the VTTAssets: D&D Beyond & Foundry VTT Bridge extension.</p>
    <p>Eager to import your first monsters and scenes, you quickly installed the extension and found the extension's popup menu which has a nice green button: <b>Connect to Foundry</b>. You click on it and nothing happens.</p>
    <h2>Why is that?</h2>
    <p>
      Foundry VTT's native app and Google Chrome are seperate apps and are therefore unable to communicate. Let's change that.</p>
    </p>
      <hr />`;
  // Welcome - hidden on "Next"
  result = await window.vtta.ui.Hint.show(text, {
    align: "CENTER",
    buttons: [EXIT_BUTTON, NEXT_BUTTON],
    width: window.innerWidth * 0.5,
  });

  if (result === EXIT_BUTTON) return;

  /**
   * STEP 5
   */
  text = `<h1>Creating common ground</h1>
  <p>Common ground is necessary for messages to succesfully flow from D&amp;D Beyond into Foundry VTT and back.</p>
  <ul>
      <li>You are viewing the D&amp;D Beyond website with Google Chrome</li>
      <li>The Chrome extension is installed inside Google Chrome</li>
      <li>Then <b>let's connect to Foundry VTT</b> with Chrome, too!</li>
    </ul>
    <p>
    <b>Note: </b> Learn a little more about the extension in <a href="https://slides.com/vtta/basics-extension">this 5 Minute presentation</a>.</p>
   <p>Four easy steps:</p>
   <ol>
      <li>Restart your server and launch your world
      <li>When you are presented with the User selection screen, <b>STOP!</b>. Do not log in.</li>
      <li>Open Chrome and head to <a href="${game.data.addresses.local}">${game.data.addresses.local}</a> (copy that link into your clipboard now)</li>
      <li>Login using your GM account: Your user interface is just the same as with the native app.</li>
      <li>With the tab pointing to your Foundry VTT server you can start communication by
        <ol>
          <li>opening the Chrome extension's popup menu by clicking at the tiny VTTA icon (<img style="position: relative; top: 9px; border: none" src="modules/vtta-ddb/img/vtta.io-s-128x128.png" width="24" height="24" />) in the top right.</li>
          <li>Click on the yellow <b>FVTT</b> button</li>
          <li>Enjoy your success</li>
        </ol>
      </li>
   </ol>
     <hr />`;

  // Welcome - hidden on "Next"
  result = await window.vtta.ui.Hint.show(text, {
    align: "CENTER",
    buttons: [EXIT_BUTTON, NEXT_BUTTON],
    width: window.innerWidth * 0.5,
  });

  /**
   * STEP 6
   */
  text = `<h1>Did you know?</h1>
    <p>
      You can find the Invitation Link I used in the previous panel by openening the <b><i class="fas fa-cogs"></i> Game Settings</b>. You will find the <b>Game Invitation Links</b> at the very bottom.
    </p>
    <p>Use the</p>
     <ul>
      <li><b>Local Network</b> link when you are connecting to yourself from the computer that runs the Foundry server</li>
      <li><b>Internet</b> link to send to your friends.</li>
    </ul>
      <p>You can find more information on that on the <a href="https://foundryvtt.com/article/installation/" target="_blank">official Foundry VTT knowledge base</a>.</p>
     <hr />`;
  // Welcome - hidden on "Next"
  result = await window.vtta.ui.Hint.show(text, {
    element: $("#sidebar"),
    align: "LEFT",
    buttons: [EXIT_BUTTON],
    width: window.innerWidth * 0.25,
  });
};

export default connectToFoundry;
