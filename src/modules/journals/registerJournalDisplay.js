import Socket from "../socket/index.js";

export default () => {
  Hooks.on("renderJournalSheet", (app, html, options) => {
    if (!game.user.isGM) return;
    // mark all images
    $(html)
      .find('div[data-edit="content"] img, div[data-edit="content"] video')
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
