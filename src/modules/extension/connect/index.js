export default async (message) => {
  const { user, extension } = message.data;

  window.vtta.ui.Notification.show(
    extension.name + " connected",
    `<p>You connected using <strong>v.${extension.version}</strong> of the extension.</p>`
  );

  // save the extension token
  game.settings.set("vtta-core", "access_token", user.token);

  return {
    type: "CONNECT_RESPONSE",
    data: {
      success: true,
    },
  };
};
