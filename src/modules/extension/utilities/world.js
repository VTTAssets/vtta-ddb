import { slugify } from "../../../util/string.js";

const getCollection = (type) => {
  let collection;
  switch (type) {
    case "monsters":
      collection = game.actors.entities.filter(
        (actor) => actor.data.type === "npc"
      );
      break;
    case "item":
    case "equipment":
    case "magic-items":
      collection = game.items.entities.filter(
        (item) => item.data.type !== "spell"
      );
      break;
    case "spells":
      collection = game.items.entities.filter(
        (item) => item.data.type === "spell"
      );
      break;
    case "tables":
      collection = game.tables.entities;
      break;
    case "journals":
      collection = game.journal.entities;
      break;
  }
  if (collection) collection = collection.map((entry) => entry.data);
  return collection;
};

const filterByNames = (names) => {
  return (entry) => {
    return names.includes(slugify(entry.name));
  };
};

export const queryWorld = (type, slugs) => {
  const collection = getCollection(type);
  if (collection) {
    const ids = slugs.map((slug) => `${type}/${slug}`);

    return collection.filter(
      (entry) =>
        entry.flags &&
        entry.flags.vtta &&
        entry.flags.vtta.id &&
        ids.includes(entry.flags.vtta.id)
    );
    // const byName = collection.filter(filterByNames(slugs));
    // console.log(byName);
    // const byVersion = byName.filter(
    //   (entry) =>
    //     entry.flags && entry.flags.vtta && entry.flags.vtta.v !== undefined
    // );
    // console.log(byVersion);
    // return byVersion;
  }
  return [];
};
