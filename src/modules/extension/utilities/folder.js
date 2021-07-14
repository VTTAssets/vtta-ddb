import id from "../../../util/id.js";

const FOLDER_COLORS = new Map();
FOLDER_COLORS.set("DEFAULT.LEVEL1", "#520000");
FOLDER_COLORS.set("DEFAULT.LEVEL2", "#750000");
FOLDER_COLORS.set("DEFAULT.LEVEL3", "#8f0000");
FOLDER_COLORS.set("SCENE.LEVEL1", "#000a2e");
FOLDER_COLORS.set("SCENE.LEVEL2", "#000f47");
FOLDER_COLORS.set("SCENE.LEVEL3", "#001666");
FOLDER_COLORS.set("FALLBACK", "#111111");

const createFolder = (entityType, name, parent = null, color) => {
  if (!color) color = FOLDER_COLORS.get("FALLBACK");

  const collection = window.vtta.postEightZero
    ? game.folders.contents
    : game.folders.entities;
  const folder = collection.find(
    (folder) =>
      folder.data.name === name &&
      folder.data.type === entityType &&
      folder.data.parent === (parent === null ? null : id.get(parent))
  );
  if (folder === undefined) {
    const folderData = {
      name: name,
      type: entityType,
      parent: parent === null ? parent : id.get(parent),
      color: color,
      sort: 30000,
    };
    return Folder.create(folderData, { displaySheet: false });
  } else {
    return folder;
  }
};

const traverse = async (entityType, folderStructure) => {
  // group the first level
  const firstLevels = folderStructure
    .map((e) => e[0])
    .filter((entry) => entry !== undefined);
  const unique = [...new Set(firstLevels)];

  for (let firstLevel of unique) {
    let folderType = "DEFAULT";
    if (firstLevel === "Scenes") {
      folderType = "SCENE";
    }
    // folders.push(firstLevel);
    const firstLevelFolder = await createFolder(
      entityType,
      firstLevel,
      null,
      FOLDER_COLORS.get(`${folderType}.LEVEL1`)
    );

    const secondLevels = folderStructure.filter(
      (arr) => arr[0] === firstLevel && arr.length > 1
    );
    const unique = [...new Set(secondLevels.map((e) => e[1]))];

    for (let secondLevel of unique) {
      // folders.push(`${firstLevel}/${secondLevel}`);
      const secondLevelFolder = await createFolder(
        entityType,
        secondLevel,
        firstLevelFolder,
        FOLDER_COLORS.get(`${folderType}.LEVEL2`)
      );

      const thirdLevels = folderStructure.filter(
        (arr) =>
          arr[0] === firstLevel && arr[1] === secondLevel && arr.length > 2
      );

      const unique = [...new Set(thirdLevels.map((e) => e[2]))];
      for (let thirdLevel of unique) {
        //folders.push(`${firstLevel}/${secondLevel}/${thirdLevel}`);
        const thirdLevelFolder = await createFolder(
          entityType,
          thirdLevel,
          secondLevelFolder,
          FOLDER_COLORS.get(`${folderType}.LEVEL3`)
        );
      }
    }
  }
  return true;
};

const getEntityType = (entity) => {
  const ITEM_TYPES = Object.keys(CONFIG.Item.typeLabels);
  const ACTOR_TYPES = Object.keys(CONFIG.Actor.typeLabels);
  const SCENE_TYPES = ["scene"];
  const ROLLTABLE_TYPES = ["table"];
  const JOURNALENTRY_TYPES = ["journal"];

  if (ACTOR_TYPES.includes(entity.type)) {
    return "Actor";
  }

  if (ITEM_TYPES.includes(entity.type)) {
    return "Item";
  }

  if (SCENE_TYPES.includes(entity.type)) {
    return "Scene";
  }

  if (ROLLTABLE_TYPES.includes(entity.type)) {
    return "RollTable";
  }

  if (JOURNALENTRY_TYPES.includes(entity.type)) {
    return "JournalEntry";
  }
};

const getStructure = (entity) => {
  const entityType = getEntityType(entity);
  const type = entity.type;
  let folders = entity.flags.vtta.folders.filter(
    (folder) =>
      folder !== undefined && typeof folder === "string" && folder.trim() !== ""
  );

  switch (entityType) {
    case "Item":
      folders = ["D&D Beyond Integration", ...folders];
      break;
    case "JournalEntry":
      break;
    default:
      folders = ["D&D Beyond Integration", ...folders];
  }
  folders = folders.slice(0, 3);
  return folders;
};

export const createFolders = async (entities) => {
  const ITEM_TYPES = Object.keys(CONFIG.Item.typeLabels);
  const ACTOR_TYPES = Object.keys(CONFIG.Actor.typeLabels);
  const SCENE_TYPES = ["scene"];
  const ROLLTABLE_TYPES = ["rolltable"];

  const collections = {
    Item: entities.filter((entity) => getEntityType(entity) === "Item"),
    Actor: entities.filter((entity) => getEntityType(entity) === "Actor"),
    Scene: entities.filter((entity) => getEntityType(entity) === "Scene"),
    RollTable: entities.filter(
      (entity) => getEntityType(entity) === "RollTable"
    ),
    JournalEntry: entities.filter(
      (entity) => getEntityType(entity) === "JournalEntry"
    ),
  };

  // create the folders per collection
  for (let entityType in collections) {
    const folderStructure = collections[entityType]
      .map((entity) => {
        if (entity.flags && entity.flags.vtta && entity.flags.vtta.folders) {
          let folderStructure = getStructure(entity);

          return folderStructure;
        } else {
          return undefined;
        }
      })
      .filter((entry) => entry !== undefined);

    await traverse(entityType, folderStructure);
  }
  return true;
};

const findFolder = async (entityType, structure, parent = null) => {
  const name = structure.shift();
  const collection = window.vtta.postEightZero
    ? game.folders.contents
    : game.folders.entities;
  let folder = collection.find(
    (folder) =>
      folder.data.name === name &&
      folder.data.type === entityType &&
      folder.data.parent === (parent === null ? null : id.get(parent))
  );
  if (!folder) {
    folder = await createFolder(entityType, name, parent);
  }
  if (structure.length === 0) {
    return folder;
  } else {
    return findFolder(entityType, structure, folder);
  }
};

export const getFolder = (entity) => {
  let folderStructure = [];
  if (entity.flags && entity.flags.vtta && entity.flags.vtta.folders) {
    folderStructure = getStructure(entity);
  }
  if (folderStructure.length) {
    return findFolder(getEntityType(entity), folderStructure);
  } else {
    let folder = id.set({}, null);
    Promise.resolve(folder);
    //return Promise.resolve({ id: null });
  }
};
