import { slugify } from "../../../util/string.js";

const getCollection = (type) => {
  let collection;
  switch (type) {
    case "monsters":
      collection = window.vtta.postEightZero
        ? game.actors.contents
        : game.actors.entities;
      collection = collection.filter((actor) => actor.data.type === "npc");
      break;
    case "item":
    case "equipment":
    case "magic-items":
      collection = window.vtta.postEightZero
        ? game.items.contents
        : game.items.entities;
      collection = collection.filter((item) => item.data.type !== "spell");
      break;
    case "spells":
      collection = window.vtta.postEightZero
        ? game.items.contents
        : game.items.entities;
      collection = collection.filter((item) => item.data.type === "spell");
      break;
    case "tables":
      collection = window.vtta.postEightZero
        ? game.tables.contents
        : game.tables.entities;
      break;
    case "journals":
      collection = window.vtta.postEightZero
        ? game.journal.contents
        : game.journal.entities;
      break;
    case "scenes":
      collection = window.vtta.postEightZero
        ? game.scenes.contents
        : game.scenes.entities;
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
  }
  return [];
};
