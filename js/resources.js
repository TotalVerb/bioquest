// Contains resources and Pygame objects needed for VenomQuest
var res = {};

res.loader = function() {
  function load_image(id) {
    return document.getElementById(id);
  }

  window.res = {
    image: {
      attack: load_image("im-attack"),
      beach: load_image("im-beach"),
      corpse: load_image("im-corpse"),
      house: load_image("im-house"),
      water: load_image("im-water"),
      tree: load_image("im-tree")
    },
    creature: {
      fighter: {
        to: 7
      },
      steven: {
        to: 1
      },
      sierra: {
        to: 1
      },
      rabbit: {
        to: 1
      }
    },
    sfx: {
      hit: document.getElementById("sfx-hit"),
      levelup: document.getElementById("sfx-levelup")
    },
    font: {
      small: "14pt sans-serif",
      large: "20pt sans-serif"
    }
  };

  // Load player images.
  for (var creature in res.creature) {
    for (var i = 1; i <= res.creature[creature].to; i++) {
      res.creature[creature][i] = document.getElementById(
        "ip-" + creature + "-" + i
        );
    }
  }
};
window.addEventListener("load", res.loader, false);
