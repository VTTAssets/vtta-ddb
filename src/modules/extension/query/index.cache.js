// import CacheFactory from "../../cache/index.js";
// import getCompendiumConfig from "../utilities/compendium.js";
// import translateEntityType from "../utilities/translateEntityType.js";
// import { slugify } from "../../../util/string.js";
// import logger from "../../../util/logger.js";

// const filterByNames = (index, names) => {
//   return index.filter((e) => names.includes(slugify(e.name)));
// };

// const filterByVersionFlag = (entity) => {
//   return entity.flags && entity.flags.vtta && entity.flags.vtta.v;
// };

// export default async (message) => {
//   // REQUEST
//   // {
//   //   type: 'QUERY',
//   //   data: {
//   //       monster`: [{ name: 'slug-a', v: 1}, { name: 'slug-b', v: 2}, { name: 'slug-c', v: 1}],
//   //       spell?: [{ name: 'slug-a', v: 1}, { name: 'slug-b', v: 1}]
//   //       item?: [{ name: 'slug-a', v: 1}, { name: 'slug-b', v: 1}]
//   //   }
//   // }
//   const start = performance.now();
//   const cache = await CacheFactory.getInstance();
//   logger.info(
//     `[Extension:Query] ${performance.now() - start}ms to initialize cache`
//   );
//   const compendiumConfigurations = getCompendiumConfig();

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
