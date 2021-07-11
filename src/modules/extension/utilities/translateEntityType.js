const translateEntityType = (type) => {
  // translate url to item type
  switch (type) {
    case "magic-items":
    case "equipment":
      return "item";

    case "spells":
      return "spell";

    case "monsters":
      return "monster";

    default:
      return "item";
  }
};

export default translateEntityType;
