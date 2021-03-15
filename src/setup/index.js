import settings from "../modules/settings/index.js";
import registerAvailabilityHandler from "./registerAvailabilityHandler.js";
import registerExtensionHandler from "../modules/extension/index.js";
import loadTemplates from "./loadTemplates.js";

import registerCustomNoteLabels from "../modules/mapnotes/addCustomLabel.js";

import showReleaseNotes from "./showReleaseNotes.js";
import registerJournalDisplay from "../modules/journals/registerJournalDisplay.js";
// import initializeCache from "./initializeCache.js";

import Socket from "../modules/socket/index.js";

const setup = async () => {
  settings();
  registerAvailabilityHandler();
  registerExtensionHandler();

  registerCustomNoteLabels();

  await loadTemplates();

  // show the release notes
  await showReleaseNotes();

  registerJournalDisplay();

  Socket.listen();

  // const cache = await initializeCache();
  // console.log(cache.stats());
};

export default setup;
