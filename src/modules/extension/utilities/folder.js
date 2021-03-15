const createFolder = (entityType, name, parent = null) => {
  const folder = game.folders.entities.find(
    (folder) =>
      folder.data.name === name &&
      folder.data.type === entityType &&
      folder.data.parent === (parent === null ? null : parent.data._id)
  );
  if (folder === undefined) {
    const folderData = {
      name: name,
      type: entityType,
      parent: parent === null ? parent : parent.data._id,
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
    // folders.push(firstLevel);
    const firstLevelFolder = await createFolder(entityType, firstLevel, null);

    const secondLevels = folderStructure.filter(
      (arr) => arr[0] === firstLevel && arr.length > 1
    );
    const unique = [...new Set(secondLevels.map((e) => e[1]))];

    for (let secondLevel of unique) {
      // folders.push(`${firstLevel}/${secondLevel}`);
      const secondLevelFolder = await createFolder(
        entityType,
        secondLevel,
        firstLevelFolder
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
          secondLevelFolder
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
          return [...entity.flags.vtta.folders].filter(
            (folder) => folder.trim().length && folder !== undefined
          );
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
  let folder = game.folders.entities.find(
    (folder) =>
      folder.data.name === name &&
      folder.data.type === entityType &&
      folder.data.parent === (parent === null ? null : parent.data._id)
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
    folderStructure = [...entity.flags.vtta.folders].filter(
      (folder) => folder.trim().length && folder !== undefined
    );
  }
  if (folderStructure.length) {
    return findFolder(getEntityType(entity), folderStructure);
  } else {
    return Promise.resolve({ _id: null });
  }
};
