import logger from "../../../util/logger.js";
import { slugify } from "../../../util/string.js";
import Label from "../utilities/label.js";
import { getFolder } from "../utilities/folder.js";
import id from "../../../util/id.js";

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

const processScene = async (scene, sceneUpdatePolicy) => {
  const path = `${game.settings.get("vtta-ddb", "sceneImageDirectory")}/${
    scene.flags.vtta.code
  }`;

  const extension = scene.img.split(".").pop();
  const filename = slugify(scene.name) + "." + extension;

  // 1. Upload the scene image file
  const OVERWRITE_EXISTING = true;

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
  scene.notes = [];
  let noteIndex = 0;
  for (let note in scene.journals) {
    const journalEntry = (
      window.vtta.postEightZero ? game.journal.contents : game.journal.entities
    ).find(
      (entity) =>
        entity.data.flags.vtta &&
        entity.data.flags.vtta.id &&
        entity.data.flags.vtta.id === note.id
    );

    if (journalEntry) {
      noteIndex++;
      const positions = note.positions;
      const { label, name } = journalEntry.data.flags.vtta;

      const iconPath = await Label.create("" + label);
      let data = {
        //entryId: journalEntry._id,
        entryId: id.get(journalEntry),
        icon: iconPath,
        iconSize: NOTE_ICON_SIZE,
      };
      if (positions.length === 0) {
        const data = {
          //entryId: journalEntry._id,
          entryId: id.get(journalEntry),
          icon: iconPath,
          iconSize: NOTE_ICON_SIZE,
          x: SCENE_PADDING.left + noteIndex * scene.grid + NOTE_ICON_PADDING,
          y: SCENE_PADDING.top + NOTE_ICON_PADDING,
        };
        scene.notes.push(data);
      } else {
        scene.notes = [
          ...scene.notes,
          positions.map((position) => {
            return {
              //entryId: journalEntry._id,
              entryId: id.get(journalEntry),
              icon: iconPath,
              iconSize: NOTE_ICON_SIZE,
              ...position,
            };
          }),
        ];
      }
    }
  }
  // clean up
  delete scene.banner;
  delete scene.journals;

  // 4. Create the Scene with the supplied data
  let tokens = [];

  for (let monster in scene.monsters) {
    const actor = (
      window.vtta.postEightZero ? game.actors.contents : game.actors.entities
    ).find(
      (entity) =>
        entity.data.flags.vtta &&
        entity.data.flags.vtta.id &&
        entity.data.flags.vtta.id === monster.id
    );

    if (actor) {
      for (let position of monster.positions) {
        if (position.x && position.y) {
          const tokenData = {
            ...actor.data.token,
            ...position,
            hidden: true,
          };
          tokens.push(tokenData);
        }
      }
    }
  }
  scene.tokens = tokens;

  const folder = await getFolder(scene);
  //scene.folder = folder._id;
  scene.folder = id.get(folder);

  // On re-import, we will rename the scene accordingly to avoid confusions
  const existingScene = (
    window.vtta.postEightZero ? game.scenes.contents : game.scenes.entities
  ).find(
    (existing) =>
      existing.data.flags &&
      existing.data.flags.vtta &&
      existing.data.flags.vtta.id &&
      existing.data.flags.vtta.id === scene.flags.vtta.id &&
      existing.name === scene.name
  );
  if (existingScene !== undefined) {
    switch (sceneUpdatePolicy) {
      case "SCENE_UPDATE_POLICY:UPDATE":
        //scene._id = existingScene._id;
        scene = id.set(scene, id.get(existingScene));
        logger.info("Updating scene " + scene.name, scene);

        if (window.vtta.postEightZero) {
          return Scene.updateDocuments([scene]);
        } else {
          return Scene.update(scene);
        }
        break;
      case "SCENE_UPDATE_POLICY:CLONE":
        let index = 1;
        let existing;
        do {
          index++;
          existing = (
            window.vtta.postEightZero
              ? game.scenes.contents
              : game.scenes.entities
          ).find((existing) => existing.name === `${scene.name} (${index})`);
        } while (existing !== undefined || index >= 10);

        scene.name = `${scene.name} (${index})`;
        break;
    }
  }

  logger.info("Creating scene " + scene.name, scene);
  return Scene.create(scene);
};

export default processScene;
