import config from "../../../config/index.js";
import { slugify } from "../../../util/string.js";

/**
 * FILTER UTILITIES
 */
const filterByNames = (names) => {
  return (entry) => {
    return names.includes(slugify(entry.name));
  };
};

const filterByVersionFlag = (entry) => {
  return entry.flags && entry.flags.vtta && entry.flags.vtta.v;
};

/**
 * getCompendium
 */
export const getCompendium = (type) => {
  const COMPENDIA = [
    {
      collection: game.settings.get(config.module.name, "monsterCompendium"),
      types: ["monsters"],
    },
    {
      collection: game.settings.get(config.module.name, "itemCompendium"),
      types: ["item", "equipment", "magic-items"],
    },
    {
      collection: game.settings.get(config.module.name, "spellCompendium"),
      types: ["spells"],
    },
  ].filter((compendiumConfig) => compendiumConfig.collection !== "none");

  const compendiumConfig = COMPENDIA.find((compendiumConfig) =>
    compendiumConfig.types.includes(type)
  );
  if (compendiumConfig !== undefined) {
    return game.packs.get(compendiumConfig.collection);
  }
  return null;
};

/**
 * Returns a list of entities matching the slugs given
 * Filters the list version-flag availability
 * @param {Compendium} compendium Compendium to query
 * @param {string[]} slugs Slugs to search for within this compendium
 *
 * Note: I am filtering by slugified name instead of flags.vtta.id. It should be the same
 * but shit could happen
 */
export const queryCompendium = async (compendium, slugs) => {
  try {
    const index = await compendium.getIndex();
    // filter through all slugs
    const filteredIndices = index.filter(filterByNames(slugs));

    // retrieve all entities given by those _ids
    let entities = await Promise.all(
      filteredIndices.map((entry) => compendium.getEntry(entry._id))
    );
    console.log(entities);
    entities = entities.filter(
      (entry) => entry.flags && entry.flags.vtta && entry.flags.vtta.v
    );

    console.log(entities);
    return entities;
  } catch (error) {
    console.error(error);
    return [];
  }
};
