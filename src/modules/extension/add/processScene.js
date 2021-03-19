import logger from "../../../util/logger.js";
import { slugify } from "../../../util/string.js";
import Label from "../utilities/label.js";
import { getFolder } from "../utilities/folder.js";

const upload = (url, path, filename, overwriteExisting = false) => {
  return new Promise(async (resolve, reject) => {
    const img = await window.vtta.image.download(url);

    const extension = url.toLowerCase().split(".").pop();

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(
      (blob) => {
        window.vtta.image
          .upload(path, filename, blob, overwriteExisting)
          .then((result) => resolve(result));
      },
      "image/" + extension,
      1
    );
  });
};

const getLabel = (str) => {
  const [id, text] = str.split(".");
  if (text === undefined) return null;
  const parts = id.match(/[a-z]+|\d+/gi);

  const isId = parts.reduce(
    (isId, part) =>
      part.toLowerCase().search(/^[a-z]+$/) !== -1 && part.length > 1
        ? false
        : true && isId,
    true
  );
  if (!isId) return null;

  return id;
};

const processScene = async (scene) => {
  const path = `${game.settings.get("vtta-ddb", "sceneImageDirectory")}/${
    scene.flags.vtta.code
  }`;

  const extension = scene.img.split(".").pop();
  const filename = slugify(scene.name) + "." + extension;

  // 1. Upload the scene image file
  const OVERWRITE_EXISTING = true;

  logger.info("Map Upload started");
  let result = await upload(scene.img, path, filename, OVERWRITE_EXISTING);
  if (result.status === "success") {
    scene.img = result.path;
  }
  // 2. Upload the scene banner
  let response = await fetch(scene.banner);
  let blob = await response.blob();
  result = await window.vtta.image.upload(
    path,
    slugify(scene.name) + "-banner.png",
    blob,
    OVERWRITE_EXISTING
  );
  if (result.status === "success") {
    scene.thumb = result.path;
  }
  window.vtta.ui.Notification.show(
    "Scene " + scene.name,
    `<p>Map and banner upload successful.</p>`
  );

  // 2. Find the references Journal Entries and
  //    1. Create/Upload the label images
  //    2. Position the labels referencing to the Journal Entries on the scene
  scene.notes = [];
  let journals = game.journal.filter(
    (j) => j.data.flags && j.data.flags.vtta && j.data.flags.vtta.id
  );

  // each note needs a position and a label. This is ensured by the processing instruction for each scene on the parser
  // let notes = scene.journals.filter(
  //   (note) => note.x !== undefined && note.y !== undefined && note.label
  // );

  const SCENE_PADDING = {
    left: Math.ceil((0.25 * scene.width) / scene.grid) * scene.grid,
    top: Math.ceil((0.25 * scene.height) / scene.grid) * scene.grid,
  };
  // adjust the size of the note
  const NOTE_ICON_SIZE = Math.ceil(scene.grid * 0.8);
  const NOTE_ICON_PADDING = Math.ceil((scene.grid - NOTE_ICON_SIZE) / 2);

  // create used labels, and place them if we got x/y coordinates for them
  let notes = scene.journals.map(async (note, index) => {
    return new Promise((resolve, reject) => {
      let journal = journals.find(
        (journal) => journal.data.flags.vtta.id === note.id
      );
      if (journal) {
        // upload the label for it
        Label.create("" + note.label).then((label) => {
          if (note.x === undefined || note.y === undefined) {
            // Put them in the upper left corner of the map
            note.x =
              SCENE_PADDING.left + index * scene.grid + NOTE_ICON_PADDING;
            note.y = SCENE_PADDING.top + NOTE_ICON_PADDING;
          }
          const data = {
            entryId: journal._id,
            icon: label,
            x: note.x,
            y: note.y,
            iconSize: NOTE_ICON_SIZE,
          };
          resolve(data);
        });
      } else {
        reject("No Journal Entry found");
      }
    });
  });

  let notesData = await Promise.allSettled(notes);
  scene.notes = notesData
    .filter((promise) => promise.status === "fulfilled")
    .map((promise) => promise.value);

  // 3. Adding monsters

  // clean up
  delete scene.banner;
  delete scene.journals;

  // 4. Create the Scene with the supplied data
  let tokens = [];
  scene.monsters.forEach((monster) => {
    const actor = game.actors.entities.find(
      (entity) =>
        entity.data.flags.vtta &&
        entity.data.flags.vtta.id &&
        entity.data.flags.vtta.id === monster.id
    );
    if (actor) {
      monster.positions.forEach((position) => {
        if (position.name) {
          tokens.push({
            ...actor.data.token,
            actorData: {
              name: position.name,
            },
            x: position.x,
            y: position.y,
            hidden: true,
          });
        } else {
          tokens.push({
            ...actor.data.token,
            x: position.x,
            y: position.y,
            hidden: true,
          });
        }
      });
    }
  });
  scene.tokens = tokens;

  const folder = await getFolder(scene);
  scene.folder = folder._id;

  // On re-import, we will rename the scene accordingly to avoid confusions
  if (
    game.scenes.entities.find((existing) => existing.name === scene.name) !==
    undefined
  ) {
    let index = 1;
    let existing;
    do {
      index++;
      existing = game.scenes.entities.find(
        (existing) => existing.name === `${scene.name} (${index})`
      );
    } while (existing !== undefined || index >= 10);

    scene.name = `${scene.name} (${index})`;
  }

  return Scene.create(scene);
};

export default processScene;
