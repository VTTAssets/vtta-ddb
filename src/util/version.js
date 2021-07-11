const get = (entity) => {
  const version =
    entity.flags && entity.flags.vtta && entity.flags.vtta.v
      ? entity.flags.vtta.v
      : 0;
  return version;
};

export { get };
