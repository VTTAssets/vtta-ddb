const config = {
  module: {
    name: "vtta-ddb",
    label: "VTTA D&D Beyond Integration",
  },
  requirements: {
    extension: "2.0.0",
  },
  startupDelay: 2000,
  templates: {
    partials: {},
  },
  messaging: {
    core: {
      query: "vtta-core.query",
      response: "vtta-core.available",
      timeout: 200,
      retries: 20,
    },
    extension: {
      default: "CMD_SEND_FOUNDRY_MESSAGE",
      query: "vtta-ddb.query",
      response: "vtta-ddb.available",
    },
  },
  paths: {
    labels: "_labels",
  },
};

export default config;
