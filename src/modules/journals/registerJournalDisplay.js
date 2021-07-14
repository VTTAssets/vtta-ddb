import Socket from "../socket/index.js";

export default () => {
  Hooks.on("renderJournalSheet", (app, html, options) => {
    const content = $(html).find(`div[data-edit="content"]`);
    /**
     * Public adjustments
     */
    // Add a direct roll button into VTTA-imported rolltables
    $(content)
      .find("a.entity-link[data-entity='RollTable']")
      .each((_, link) => {
        const data = $(link).data();
        const table = game.tables.get(data.id);
        if (
          table &&
          table.data.flags &&
          table.data.flags.vtta &&
          table.data.flags.vtta.id
        ) {
          const button = $(
            `<a title="Click: Roll | Shift-Click: Self Roll" class="vtta roll"></a>`
          );
          $(link).after(button);
          $(button).on("click", async (event) => {
            event.preventDefault();
            const rollMode = event.shiftKey ? "selfroll" : "roll";

            // fix: Table description is undefined
            if (!table.data.description)
              table.data.description = table.data.name;

            const draw = table.roll();
            draw.results = draw.results.map((result) => {
              if (!result.img)
                result.img = "modules/vtta-ddb/img/vtta.io-dice-64x64.png";
              return result;
            });
            await table.toMessage(draw.results, {
              roll: draw.roll,
              messageOptions: {
                speaker: game.user.name,
                rollMode: rollMode,
              },
            });

            // // Draw a result, creates a chat message based on the currently set rollmode
            // table.draw({
            //   rollMode: rollMode,
            // });
          });
        }
      });

    /**
     * GM-only adjustments
     */
    if (!game.user.isGM) return;

    // mark all images
    $(content)
      .find("img,video")
      .each((index, element) => {
        const showPlayersButton = $(
          "<a class='vtta-button'><i class='fas fa-eye'></i>&nbsp;Show Players</a>"
        );
        $(showPlayersButton).on("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const src = $(element).attr("src");

          Socket.send("showImage", { src: src, type: element.nodeName });
        });

        $(element).wrap("<div class='vtta-image-container'></div>");
        // show the button on mouseenter of the image
        $(element)
          .parent()
          .mouseenter(function Hovering() {
            $(this).append(showPlayersButton);
            $(showPlayersButton).on("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              const src = $(element).attr("src");

              Socket.send("showImage", { src: src, type: element.nodeName });
            });
          });
        $(element)
          .parent()
          .mouseleave(function Unhovering() {
            $(this).find("a").remove();
          });
      });
  });
};
