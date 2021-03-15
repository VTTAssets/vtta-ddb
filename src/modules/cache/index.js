import logger from "../../util/logger.js";
import config from "../../config/index.js";
import { slugify } from "../../util/string.js";
import version from "../../util/version.js";

let CacheFactory = (() => {
  let instance;

  const getCompendiumConfig = () => {
    const itemCompendium = game.settings.get(
      config.module.name,
      "itemCompendium"
    );

    return [
      {
        name: game.settings.get(config.module.name, "monsterCompendium"),
        type: "monsters",
      },
      {
        name: game.settings.get(config.module.name, "itemCompendium"),
        type: "items",
      },
      {
        name: game.settings.get(config.module.name, "spellCompendium"),
        type: "spells",
      },
    ].filter((config) => config.name !== "none");
  };

  class Cache {
    constructor() {
      this.compendia = [];
    }

    initialize() {
      const start = performance.now();
      logger.info("Initializing cache...");
      return this.load(getCompendiumConfig());
    }

    load(details) {
      return new Promise((resolve, reject) => {
        const results = details.map((detail) =>
          this._loadCompendium(detail.name, detail.type)
        );
        Promise.allSettled(results).then((results) => {
          this.compendia = results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);
          resolve(true);
        });
      });
    }

    stats() {
      return this.compendia.map((compendium) => {
        return {
          name: compendium.name,
          count: compendium.entities.length,
        };
      });
    }

    async _loadCompendium(name) {
      return new Promise((resolve, reject) => {
        const pack = game.packs.get(name);
        if (!pack) {
          reject();
        }
        // unlock this pack for GMs.
        logger.info("[Cache] Unlocking compendium " + name + " for later use");
        pack.locked = !game.user.isGM;

        pack
          .getContent()
          .then((contents) => {
            // we will update only vtta-imported entities. We simply do not care about other source of imports.
            // that's how we roll *puts sunglasses down*

            const entities = contents
              .filter((entity) => {
                return (
                  entity.data.flags && entity.data.flags.vtta !== undefined
                );
              })
              .map((entity) => ({
                _id: entity._id,
                name: entity.name,
                v: version.get(entity),
              }));
            logger.info(
              `[Cache:${name}] ${
                contents.length - entities.length
              } non-VTTA entities removed from consideration.`
            );
            resolve({ name: name, entities: entities });
          })
          .catch((error) => {
            console.log("Error getting the content of compendium " + name);
            console.log(error);
            reject(error);
          });
      });
    }

    async update() {
      const names = this.compendia.map((compendium) => compendium.name);
      return this.load(names);
    }

    /**
     *
     * @param {string} queryString entityType/slug
     * @param {*} type
     */
    query(queryString) {
      // magic-item/some-weapon
      let [type, slug] = queryString.split("/");

      // translate url to item type
      switch (type) {
        case "magic-items":
        case "equipment":
          type = "items";
          break;
        case "spells":
          type = "spells";
          break;
        case "monsters":
          type = "monsters";
          break;
      }

      console.log("[Query] name: " + slug + ", type: " + type);

      let searchOrder = getCompendiumConfig();
      if (type !== null) {
        searchOrder = searchOrder.filter((config) => config.type === type);
      }
      searchOrder = searchOrder.map((config) => config.name);

      let searchResults = searchOrder
        .reduce((results, compendiumName) => {
          const compendium = this.compendia.find(
            (compendium) => compendium.name === compendiumName
          );
          return results.concat(
            compendium.entities
              .filter((entity) => slugify(entity.name) === slug)
              .map((entity) => {
                entity.compendium = compendium.name;
                return entity;
              })
          );
        }, [])
        .sort((a, b) => {
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });
      if (searchResults.length === 0) {
        searchResults = [{ name: slug, v: -1 }];
      }
      return searchResults;
    }
  }

  return {
    getInstance: async () => {
      if (!instance) {
        const start = performance.now();
        instance = new Cache();
        await instance.initialize();
        logger.info(
          "Cache initialization took " + (performance.now() - start) + "ms."
        );
        instance.constructor = null;
        return instance;
      } else {
        return Promise.resolve(instance);
      }
    },
  };
})();

export default CacheFactory;
