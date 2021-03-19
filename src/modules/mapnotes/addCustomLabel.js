export default () => {
  Hooks.on("renderNoteConfig", (app, html, options) => {
    // check if the note config is working with an vtta-imported Note with a custom label
    if (
      options.entries.find(
        (entry) =>
          entry.data._id === options.entryId &&
          entry.data.flags &&
          entry.data.flags.vtta &&
          entry.data.flags.vtta.id
      )
    ) {
      // get the custom label
      const label = options.object.icon.split("/").pop().replace(".svg", "");

      // create the option to add
      const option = `<option selected value="${
        options.object.icon
      }">${game.i18n.localize("NOTE.VTTACustomLabel")}: ${label}</option>`;

      // add it to the select
      const select = $(html).find('select[name="icon"]');
      select.append(option);
    }
  });
};
