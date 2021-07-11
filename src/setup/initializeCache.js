import CacheFactory from "../modules/cache/index.js";

export default async () => {
  const cache = await CacheFactory.getInstance();
  return cache;
};
