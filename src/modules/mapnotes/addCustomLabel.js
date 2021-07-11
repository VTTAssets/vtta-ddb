import Label from "../extension/utilities/label.js";

export default () => {
  Hooks.on("renderNoteConfig", (app, html, options) => {
    // check if the note config is working with an vtta-imported Note with a custom label
    console.log(options.object);
    console.log(options.entries);
    const note = game.journal.get(options.entryId);

    if (note.data.flags && note.data.flags.vtta && note.data.flags.vtta.id) {
      const id = note.data.flags.vtta.id;
      const label = id.split("-").pop();

      Label.create(label).then((path) => {
        // create the option to add
        const option = `<option selected value="${path}">${game.i18n.localize(
          "NOTE.VTTACustomLabel"
        )}: ${label}</option>`;

        // add it to the select
        const select = $(html).find('select[name="icon"]');
        select.append(option);

        // adjust the icon size
        const NOTE_ICON_SIZE = Math.ceil(game.scenes.viewed.data.grid * 0.8);
        $(html).find("input[name='iconSize']").val(NOTE_ICON_SIZE);
      });
    }
  });
};
