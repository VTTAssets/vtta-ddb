/**
 * Migration from 0.7.x to 0.8.x
 * Getting the ID of an entity
 */

const getId = (document) => {
  if (window.vtta.postEightZero && document.id) return document.id;
  if (document._id) return document._id;
  return null;
};

const setId = (document, id) => {
  if (window.vtta.postEightZero && document.id) {
    document.id = id;
  } else {
    document._id = id;
  }
  return document;
};

/**
 * Removes the ID from a document
 * Used when overwriting compendium entities
 * @param {entity} document
 */
const deleteId = (document) => {
  if (window.vtta.postEightZero && document.id) {
    delete document.id;
    return document;
  }
  if (document._id) {
    delete document._id;
    return document;
  }
  return document;
};

export default {
  get: getId,
  set: setId,
  delete: deleteId,
};
