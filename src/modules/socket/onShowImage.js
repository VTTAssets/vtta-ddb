const onShowImage = (data) => {
  const src = data.src;
  const type = data.type.toLowerCase();

  // check for an existing popout with that source
  let isDisplayed = false;
  $(`div.vtta-image-popout ${type}`).each((index, element) => {
    if ($(element).attr("src") === src) isDisplayed = true;
  });
  if (isDisplayed) return;

  // create the image popup
  const popout = $(
    `<div class="vtta-image-popout"><${type} src="${src}" ${
      type === "video" ? ' "preload="auto" autoplay="autoplay" loop="loop"' : ""
    }/></div>`
  );
  popout.on("click", () => {
    $(popout).hide(400, () => {
      $(popout).remove();
    });
  });
  $("body").prepend(popout);
  $(popout).show(400);
};

export default onShowImage;
