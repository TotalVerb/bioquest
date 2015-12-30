// In-game dialogue.

define(['font', 'view', 'resources'], function(font, viewport, res) {
  "use strict";

  function displayDialogue(ctx, speech) {
    const speaker = speech.speaker;
    const words = speech.spoken;

    ctx.font = font.small;
    const text = speaker + ": " + words;
    const width = ctx.measureText(text).width;
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(
      viewport.WIDTH / 2 - width / 2 - 20,
      viewport.HEIGHT - 60,
      width + 40,
      45
    );
    ctx.fillStyle = "black";
    ctx.fillText(
      text,
      viewport.WIDTH / 2 - width / 2,
      viewport.HEIGHT - 30
      );

    if (res.portraits[speech.speaker] !== undefined) {
      ctx.drawImage(res.portraits[speech.speaker], 50, viewport.HEIGHT - 250);
    }
  }
  return { displayDialogue };
});
