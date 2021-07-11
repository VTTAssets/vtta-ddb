import { slugify } from "../../../util/string.js";
import { queryCompendium, getCompendium } from "../utilities/compendium.js";
import { queryWorld } from "../utilities/world.js";
import logger from "../../../util/logger.js";
export default async (message) => {
  // REQUEST
  // {
  //   type: "QUERY",
  //   data: [{id: "monsters/the-demogorgon"}]
  // }

  const types = [
    ...new Set(
      message.data
        .map((query) => query.id)
        .map((slug) => slug.split("/").shift())
    ),
  ].sort();

  let results = [];
  for (let type of types) {
    const slugs = message.data
      .map((query) => query.id)
      .filter((slug) => slug.indexOf(type) === 0)
      .map((slug) => slug.split("/").pop());

    // load the world
    results = results.concat(
      queryWorld(type, slugs).map((entry) => {
        const { id, v } = entry.flags.vtta;
        return {
          id,
          v,
        };
      })
    );

    // // load the compendium, if any
    // const compendium = getCompendium(type);
    // if (compendium !== null) {
    //   let entities = await queryCompendium(compendium, slugs);
    //   entities = entities.map((entry) => {
    //     return {
    //       name: `${type}/${slugify(entry.name)}`,
    //       v: entry.flags.vtta.v,
    //     };
    //   });
    //   console.log("Adding " + entities.length + " entities");
    //   results = results.concat(entities);
    //   console.log("Now having " + results.length + " found entities");
    // }
  }

  // reduce all found entities to appear only once with their lowest version number found
  results = results.reduce((all, current) => {
    const lowest = all.find((entry) => entry.name === current.name);
    if (lowest !== undefined) {
      if (lowest.v > current.v) {
        lowest.v = current.v;
      }
    } else {
      all.push(current);
    }
    return all;
  }, []);

  const response = {
    type: "QUERY_RESPONSE",
    data: results,
  };

  logger.info("Sending response to query", response);
  return response;
};

//   const start = performance.now();
//   const compendiumConfigurations = getCompendiumConfig();

//   let compendiums = [];

//   for (let query of message.data) {
//     const [type, slug] = query.split("/");
//     const entityType = translateEntityType(type);

//     /**
//      * Compendium entries for this slug
//      */
//     if (compendiums[entityType] === undefined) {
//       let config = compendiumConfigurations.find((c) => c.types.includes(type));
//       if (config !== undefined) {
//         const index = await compendium.getIndex();
//         compendiums[entityType] = {
//           c: game.packs.get(config.collection),
//           index: index,
//         };
//       }
//     }
//     // get a list of possible entity names matching the slug
//     // query the index for the slug
//     const entities = await Promise.all(
//       compendiums[entityType].index
//         .filter((entity) => slugify(entity.name) === slug)
//         .filter(
//           (entity) =>
//             entity.data.flags &&
//             entity.data.flags.vtta &&
//             entity.data.flags.vtta.v
//         )
//         .map((entry) => compendiums[entityType].getEntry(entry._id))
//     );

//     return {
//       c: entities.map((entity) => ({
//         collection: compendiums[entityType].c.collection,
//         _id: entity._id,
//       })),
//       w: getCollection(type).filter((entity) => slugify(entity.name) === slug),
//     };

//     /**
//      * World entries for this slug
//      */
//     getCollection(type)
//       .filter((entity) => slugify(entity.name) === slug)
//       .map((entry) => compendiums[entityType].getEntry(entry._id));
//   }

//   // the entity types are property names of the data part of the message, e.g. monster, item, spell...
//   const entityTypes = Object.keys(message.data);

//   for (let entityType of entityTypes) {
//     let config = compendiumConfigurations.find((c) => c.type === entityType);
//     // get a list of possible entiy names matching the slug
//     if (config !== undefined) {
//       const compendium = game.packs.get(config.name);
//       let index = await compendium.getIndex();

//       // filter the index by a list of given entity slugs
//       const slugs = message.data[entityType].map((entry) => entry.name);
//       index = index.filter((entry) => slugs.includes(slugify(entry.name)));

//       // load all entities that survived that filter and check for the existence of the version flag
//       const compendiumEntities = (
//         await Promise.all(index.map((_id) => compendium.getEntry(_id)))
//       )
//         .filter(
//           (data) =>
//             data.flags && data.flags.vtta && data.flags.vtta.v !== undefined
//         )
//         .map((entity) => {
//           return {
//             name: entity.name,
//             v: data.flags.vtta.v,
//           };
//         });

//       // now remove all sucessful query entities that have a version number equal to the requested one
//       message.data[entityType] = message.data[entityType]
//         .map((entity) => {
//           const existing = compendiumEntities.find(
//             (compendiumEntity) =>
//               slugify(compendiumEntity.name) == entity.name &&
//               compendiumEntity.v < entity.v
//           );

//           if (existing !== undefined) {
//             return {
//               name: entity.name,
//               v: existing.v,
//             };
//           } else {
//             return undefined;
//           }
//         })
//         .filter((entity) => entity !== undefined);
//     }
//   }

//   message.type = "QUERY_RESPONSE";
//   return message;
// };
