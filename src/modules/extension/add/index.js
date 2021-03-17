import { slugify, capitalize } from "../../../util/string.js";
import { queryCompendium, getCompendium } from "../utilities/compendium.js";
import { queryWorld } from "../utilities/world.js";
import { createFolders, getFolder } from "../utilities/folder.js";

import logger from "../../../util/logger.js";

import processScene from "./processScene.js";

const SKIP_COMPENDIUM_MAINTENANCE = true;

const getEntityClass = (entity) => {
  const ITEM_TYPES = Object.keys(CONFIG.Item.typeLabels);
  const ACTOR_TYPES = Object.keys(CONFIG.Actor.typeLabels);
  const SCENE_TYPES = ["scene"];
  const ROLLTABLE_TYPES = ["table"];
  const JOURNALENTRY_TYPES = ["journal"];

  if (ACTOR_TYPES.includes(entity.type)) {
    return Actor;
  }

  if (ITEM_TYPES.includes(entity.type)) {
    return Item;
  }

  if (SCENE_TYPES.includes(entity.type)) {
    return Scene;
  }

  if (ROLLTABLE_TYPES.includes(entity.type)) {
    return RollTable;
  }

  if (JOURNALENTRY_TYPES.includes(entity.type)) {
    return JournalEntry;
  }
};

export default async (message) => {
  console.log("Received Message");
  console.log(message);
  // REQUEST
  // {
  //   type: 'ADD',
  //   data: [entity]
  // }

  // collect all entities in this add batch
  const ids = message.data.map((entity) => entity.flags.vtta.id);
  const types = ids.reduce((all, current) => {
    const [type, slug] = current.split("/");
    if (all.find((t) => t === type) === undefined) all.push(type);
    return all;
  }, []);

  // Max 3 requests/second, one at a time
  const limiter = new Bottleneck({
    maxConcurrent: 10,
    minTime: 100,
  });
  // const limiter = new Bottleneck({
  //   maxConcurrent: 3,
  //   minTime: 200,
  // });

  const progressId = window.vtta.ui.ProgressBar.show(
    "Entities to process",
    0,
    message.data.length
  );

  limiter.on("error", (error) => {
    logger.error(error);
  });

  limiter.on("received", () => {
    window.vtta.ui.ProgressBar.addTarget(progressId, 1);
  });

  limiter.on("done", () => {
    window.vtta.ui.ProgressBar.addValue(progressId, 1);
  });

  for (let type of types) {
    // get all entities from this add message of this entity type
    const entities = message.data.filter(
      (entity) => entity.flags.vtta.id.indexOf(type) === 0
    );
    // extract all slugs for this kind of entity
    const slugs = entities.map((entity) => {
      const [type, slug] = entity.flags.vtta.id.split("/");
      return slug;
    });

    // get the compendium for this kind of entity
    // const compendium = getCompendium(type);

    // For now we are skipping updating the compendium because
    // a) I will need some user feedback on how they want to use the tools
    // Currently, I am leaning very heavily to use D&D Beyond as our compendium

    // b) I have an idea to Hook on the
    //     Hooks.on("create[Entity] and update[Entity] and to maintain sync there")
    // if (!SKIP_COMPENDIUM_MAINTENANCE && compendium) {
    //   compendium.locked = false;
    //   // get all existing entities matching the slugs
    //   let existing = await queryCompendium(compendium, slugs);

    //   // either update or create all entities in the message
    //   await Promise.all(
    //     entities.map((entity) => {
    //       // check if the one exists already
    //       const entry = existing.find(
    //         (e) => e.flags.vtta.id === entity.flags.vtta.id
    //       );
    //       if (entry !== undefined) {
    //         entity._id = entry._id;
    //         return limiter.schedule(() => compendium.updateEntity(entity));
    //       } else {
    //         return limiter.schedule(() => compendium.createEntity(entity));
    //       }
    //     })
    //   );
    // }

    // create the necessary folders
    await createFolders(message.data);

    // adding the entities to the world, too
    let existing = await queryWorld(type, slugs);
    await Promise.all(
      entities.map((entity) => {
        // remove the ID from the compendium import that might have happened prior to this call
        delete entity._id;

        console.log("----- PROCESSING ENTITY -------------------");
        console.log("Entity type: " + entity.type);
        console.log("Type: " + type);
        console.log("-------------------------------------------");

        // pre-process Scenes:
        if (entity.type === "scene") {
          return limiter.schedule(() => processScene(entity));
        } else {
          return new Promise((resolve, reject) => {
            // check if the one exists already
            const entry = existing.find(
              (e) => e.flags.vtta.id === entity.flags.vtta.id
            );
            if (entry !== undefined) {
              // check if we actually need to do an update
              // not everything is versioned'ed
              if (
                entry.flags &&
                entry.flags.vtta &&
                entry.flags.vtta.v &&
                entity.flags &&
                entity.flags.vtta &&
                entity.flags.vtta.v &&
                entry.flags.vtta.v === entity.flags.vtta.v
              ) {
                logger.info(
                  "Entity " +
                    entity.name +
                    " already up to date, skipping import",
                  entry.flags.vtta.id
                );
                return resolve(entry);
              }
              // updating an existing world entry
              entity._id = entry._id;

              // remove any image information from the actor to not overwrite that in future updates
              if (entity.img) delete entity.img;
              if (entity.token && entity.token.img) delete entity.token.img;

              resolve(
                limiter.schedule(() => getEntityClass(entity).update(entity))
              );
            } else {
              logger.info("Processing entity", entity);
              getFolder(entity)
                .then((folder) => {
                  entity.folder = folder._id;

                  switch (type) {
                    case "monsters":
                      if (!entity.img) entity.img = DEFAULT_TOKEN;
                      logger.info("Creating actor", entity);
                      limiter
                        .schedule(() => getEntityClass(entity).create(entity))
                        .then((actor) => {
                          resolve(actor);
                        });
                      break;
                    case "tables":
                      // We need a description since it's displayed when rolled, otherwise a nasty "undefined" is displayed
                      if (!entity.description) entity.description = entity.name;
                      // Default to the vtta.io dice img
                      entity.img =
                        "modules/vtta-ddb/img/vtta.io-dice-64x64.png";
                      resolve(
                        limiter.schedule(() =>
                          getEntityClass(entity).create(entity)
                        )
                      );
                      break;
                    default:
                      resolve(
                        limiter.schedule(() =>
                          getEntityClass(entity).create(entity)
                        )
                      );
                  }
                })
                .catch((error) => {
                  logger.error(
                    "Error getting the folder/ creating the entity",
                    entity
                  );
                  logger.error("Error Message", entity);
                });
            }
          });
        }
      })
    );
  }
  window.vtta.ui.ProgressBar.hide(progressId);

  return {
    type: "ADD_RESPONSE",
    data: message.data.length,
  };
};
