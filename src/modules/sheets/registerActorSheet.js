export default () => {
  Hooks.on("renderActorSheet5eNPC", (app, html, options) => {
    if (
      options.actor.flags &&
      options.actor.flags.vtta &&
      options.actor.flags.vtta.id &&
      options.actor.flags.vtta.v
    ) {
      const link = $(`<span class="low">v${options.actor.flags.vtta.v}</span>`);
      $(link).on("click", () => {
        window.open(`https://www.dndbeyond.com/${options.actor.flags.vtta.id}`);
      });
      $(html).find(".window-title").append(link);
    }
  });
};
