import { capitalize } from "../../../util/string.js";

const postProcessJournals = async (entities) => {
  const replaceStringByString = (str, search, replace, index) => {
    const start = str.substring(0, index);
    const end = str.substring(index + search.length);
    return `${start}${replace}${end}`;
  };

  const postProcessJournal = async (journalId) => {
    const journalEntry = game.journal.entities.find(
      (journal) =>
        journal.data.flags &&
        journal.data.flags.vtta &&
        journal.data.flags.vtta.id &&
        journal.data.flags.vtta.id === journalId
    );
    if (!journalEntry) return;
    let isChanged = false;

    let content = `${journalEntry.data.content}`;

    const regex = /{{@(Item|Actor|JournalEntry|Scene|RollTable)\[([^\/\]]+\/[^\/\]]+)\](?:{([^}]+)})*}}/g;

    let matches;
    while ((matches = regex.exec(content))) {
      isChanged = true;

      const [full, entityClass, slug, text] = matches;
      const index = matches.index;

      // find the matching entity with these information
      let collection;
      switch (entityClass) {
        case "Actor":
          collection = game.actors.entities;
          break;
        case "Item":
          collection = game.items.entities;
          break;
        case "JournalEntry":
          collection = game.journal.entities;
          break;
        case "Scene":
          collection = game.scenes.entities;
          break;
        case "RollTable":
          collection = game.tables.entities;
          break;
      }

      const entity = collection.find(
        (entity) =>
          entity.data &&
          entity.data.flags &&
          entity.data.flags.vtta &&
          entity.data.flags.vtta.id &&
          entity.data.flags.vtta.id === slug
      );
      if (entity) {
        isChanged = true;
        const replacement = `@${entityClass}[${entity._id}]{${
          text ? text : entity.name
        }}`;
        try {
          content = replaceStringByString(content, full, replacement, index);
          regex.lastIndex -= full.length - replacement.length;
        } catch (error) {
          console.error(error);
        }
      } else {
        // if the occurence is not yet replaced, we will do it now
        const replacement = `${text}`;
        content = replaceStringByString(content, full, replacement, index);
        regex.lastIndex -= full.length - replacement.length;
      }
    }

    if (isChanged === true) {
      //journalEntry.data.content = content;
      return JournalEntry.update({ _id: journalEntry._id, content: content });
    }
  };

  const ids = entities
    .filter((entity) => entity.type === "journal")
    .map((entity) => entity.flags.vtta.id);

  if (ids.length === 0) return true;

  // Max 3 requests/second, one at a time
  const limiter = new Bottleneck({
    maxConcurrent: 10,
    minTime: 100,
  });
  const progressId = window.vtta.ui.ProgressBar.show(
    "Relinking Journal Entries",
    0,
    ids.length
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

  await Promise.all(
    ids.map((id) => limiter.schedule(() => postProcessJournal(id)))
  );

  window.vtta.ui.ProgressBar.addValue(progressId, 1);

  window.vtta.ui.ProgressBar.hide(progressId);
  return true;
};

export default postProcessJournals;
