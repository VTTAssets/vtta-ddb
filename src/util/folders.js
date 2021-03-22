import { ucFirst } from "./string.js";

const create = (entityType, name, parent = null) => {
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

const traverse = async (entityType, entities) => {
  const folders = [];
  // group the first level
  const firstLevels = entities.map((e) => e[0]);
  const unique = [...new Set(firstLevels)];

  for (let firstLevel of unique) {
    // folders.push(firstLevel);
    const firstLevelFolder = await create(entityType, firstLevel, null);

    const secondLevels = entities.filter(
      (arr) => arr[0] === firstLevel && arr.length > 1
    );
    const unique = [...new Set(secondLevels.map((e) => e[1]))];

    for (let secondLevel of unique) {
      // folders.push(`${firstLevel}/${secondLevel}`);
      const secondLevelFolder = await create(
        entityType,
        secondLevel,
        firstLevelFolder
      );

      const thirdLevels = entities.filter(
        (arr) =>
          arr[0] === firstLevel && arr[1] === secondLevel && arr.length > 2
      );

      const unique = [...new Set(thirdLevels.map((e) => e[2]))];
      for (let thirdLevel of unique) {
        //folders.push(`${firstLevel}/${secondLevel}/${thirdLevel}`);
        const thirdLevelFolder = await create(
          entityType,
          thirdLevel,
          secondLevelFolder
        );
      }
    }
  }
  return true;
};

const createByEntities = async (entities) => {
  const ITEM_TYPES = Object.keys(CONFIG.Item.typeLabels);
  const ACTOR_TYPES = Object.keys(CONFIG.Actor.typeLabels);
  const SCENE_TYPES = ["scene"];
  const ROLLTABLE_TYPES = ["rolltable"];

  const collections = {
    Item: entities.filter((entity) => ITEM_TYPES.includes(entity.type)),
    Actor: entities.filter((entity) => ACTOR_TYPES.includes(entity.type)),
    Scene: entities.filter((entity) => SCENE_TYPES.includes(entity.type)),
    RollTable: entities.filter((entity) =>
      ROLLTABLE_TYPES.includes(entity.type)
    ),
  };

  // create the folders per collection
  for (let entityType in collections) {
    const structure = collections[entityType]
      .map((entity) => {
        if (
          entity.flags &&
          entity.flags.vtta &&
          entity.flags.vtta.ddb &&
          entity.flags.vtta.ddb.types
        ) {
          return entity.flags.vtta.ddb.types;
        } else {
          return undefined;
        }
      })
      .filter((entry) => entry !== undefined);
    await traverse(entityType, structure);
  }
  return true;
};

export { createByEntities, create };
