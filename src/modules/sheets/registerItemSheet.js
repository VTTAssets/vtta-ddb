export default () => {
  Hooks.on("renderItemSheet", (app, html, options) => {
    if (
      options.entity.flags &&
      options.entity.flags.vtta &&
      options.entity.flags.vtta.id &&
      options.entity.flags.vtta.v
    ) {
      const link = $(
        `<span class="low">v${options.entity.flags.vtta.v}</span>`
      );
      $(link).on("click", () => {
        window.open(
          `https://www.dndbeyond.com/${options.entity.flags.vtta.id}`
        );
      });
      $(html).find(".window-title").append(link);
    }
  });
};
