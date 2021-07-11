import { slugify } from "../../../util/string.js";
import id from "../../../util/id.js";
import logger from "../../../util/logger.js";

const postProcessJournals = async (ids) => {
  const replaceStringByString = (str, search, replace, index) => {
    const start = str.substring(0, index);
    const end = str.substring(index + search.length);
    return `${start}${replace}${end}`;
  };

  const prepareSystemDictionary = async () => {
    const loadSystemCompendia = async () => {
      const dict = {
        monsters: game.packs.get("dnd5e.monsters"),
        spells: game.packs.get("dnd5e.spells"),
        items: game.packs.get("dnd5e.items"),
      };
      for (let prop in dict) {
        await dict[prop].getIndex();
      }

      return dict;
    };

    const dict = await loadSystemCompendia();
    //  @Compendium[dnd5e.classfeatures.kYJsED0rqqqUcgKz]{Additional Fighting Style}

    return {
      lookup: (slug) => {
        const [type, slugifiedName] = slug.split("/");

        if (dict[type] && dict[type].index) {
          const entry = dict[type].index.find(
            (entry) => slugify(entry.name) === slugifiedName
          );

          if (entry) {
            //const fallback = `@Compendium[${dict[type].collection}.${entry._id}]`;
            const fallback = `@Compendium[${dict[type].collection}.${id.get(
              entry
            )}]`;
            return { ref: fallback, name: entry.name };
          }
        }
        return null;
      },
    };
  };

  const postProcessJournal = async (journalId, dictionary) => {
    const journalEntry = (
      window.vtta.postEightZero ? game.journal.contents : game.journal.entities
    ).find(
      (journal) =>
        journal.data.flags &&
        journal.data.flags.vtta &&
        journal.data.flags.vtta.id &&
        journal.data.flags.vtta.id === journalId
    );
    if (!journalEntry) return;
    let isChanged = false;

    let content = `${journalEntry.data.content}`;

    const regex =
      /{{@(Item|Actor|JournalEntry|Scene|RollTable)\[([^\/\]]+\/[^\/\]]+)\](?:{([^}]+)})*}}/g;

    let matches;
    while ((matches = regex.exec(content))) {
      isChanged = true;

      const [full, entityClass, slug, text] = matches;
      const index = matches.index;

      // find the matching entity with these information
      let collection;
      switch (entityClass) {
        case "Actor":
          collection = window.vtta.postEightZero
            ? game.actors.contents
            : game.actors.entities;
          break;
        case "Item":
          collection = window.vtta.postEightZero
            ? game.items.contents
            : game.items.entities;
          break;
        case "JournalEntry":
          collection = window.vtta.postEightZero
            ? game.journal.contents
            : game.journal.entities;
          break;
        case "Scene":
          collection = window.vtta.postEightZero
            ? game.scenes.contents
            : game.scenes.entities;
          break;
        case "RollTable":
          collection = window.vtta.postEightZero
            ? game.tables.contents
            : game.tables.entities;
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
        // const replacement = `@${entityClass}[${entity._id}]{${
        //   text ? text : entity.name
        // }}`;
        const replacement = `@${entityClass}[${id.get(entity)}]{${
          text ? text : entity.name
        }}`;
        try {
          content = replaceStringByString(content, full, replacement, index);
          regex.lastIndex -= full.length - replacement.length;
        } catch (error) {
          console.error(error);
        }
      } else {
        // let's try the fallback
        const fallback = dictionary.lookup(slug);
        if (fallback !== null) {
          const replacement = `${fallback.ref}{${text ? text : fallback.name}}`;
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
    }

    if (isChanged === true) {
      //return JournalEntry.update({ _id: journalEntry._id, content: content });
      if (window.vtta.postEightZero) {
        const updateData = [
          { _id: journalEntry.id, content: content },
        ];
        logger.info("Update Data", updateData)
        return JournalEntry.updateDocuments(updateData);
      } else {
        return JournalEntry.update({ _id: journalEntry._id, content: content });
      }
    }
  };

  // const ids = entities
  //   .filter((entity) => entity.type === "journal")
  //   .map((entity) => entity.flags.vtta.id);

  if (ids.length === 0) return true;

  // Max 3 requests/second, one at a time
  const limiter = new Bottleneck({
    maxConcurrent: 10,
    minTime: 100,
  });
  const progressId = window.vtta.ui.ProgressBar.show(
    "Post-Processing Journal Entries",
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

  const dictionary = await prepareSystemDictionary();

  await Promise.all(
    ids.map((id) => limiter.schedule(() => postProcessJournal(id, dictionary)))
  );

  window.vtta.ui.ProgressBar.addValue(progressId, 1);

  window.vtta.ui.ProgressBar.hide(progressId);
  return true;
};

export default async (message) => {
  await postProcessJournals(message.data);
  return {
    type: "POSTPROCESS_RESPONSE",
    data: message.data.length,
  };
};
