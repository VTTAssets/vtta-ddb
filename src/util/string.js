const slugify = (s) => {
  return s
    .replace(/[àáâãäå]/g, "a")
    .replace(/æ/g, "ae")
    .replace(/ç/g, "c")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/ñ/g, "n")
    .replace(/[òóôõö]/g, "o")
    .replace(/œ/g, "oe")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ýÿ]/g, "y")
    .replace(/[’']/g, "")
    .replace(/\W+/g, "-")
    .replace(/\-\-+/g, "-")
    .replace(/^\-/, "")
    .replace(/\-$/, "")
    .toLowerCase();
};

const capitalize = (str, seperator = " ") => {
  return str
    .split(seperator)
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .map((part) => part.substr(0, 1).toUpperCase() + part.substring(1))
    .join(" ");
};

const ucFirst = (str) => {
  return str.substr(0, 1).toUpperCase() + str.substring(1);
};

/**
 * Compares two version numbers and returns an indicator of
 * the first version number is higher, lower or equal to the second
 * version number.
 * @param {string} v1 First version number
 * @param {*} v2 Second version number
 * @param {*} options
 * @returns -1 if the first version number is lower than the second
 * @returns 0 if the version numbers are the same
 * @returns 1 if the first version number is higher than the second
 */
const semanticVersionCompare = (v1, v2, options) => {
  var lexicographical = options && options.lexicographical,
    zeroExtend = options && options.zeroExtend,
    v1parts = v1.split("."),
    v2parts = v2.split(".");

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) {
      return 1;
    }

    if (v1parts[i] > v2parts[i]) {
      return 1;
    }
    if (v1parts[i] < v2parts[i]) {
      return -1;
    }
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
};

export { slugify, capitalize, ucFirst, semanticVersionCompare };
