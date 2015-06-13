// Contains resources and Pygame objects needed for VenomQuest
define(['./window'], function(windows) {
  "use strict";

  function loader() {
    function load_image(id) {
      return document.getElementById(id);
    }

    const loaded = {
      ready: true,
      image: {
        attack: load_image("im-attack"),
        beach: load_image("im-beach"),
        grass: load_image("im-grass"),
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
        },
        cat: {
          to: 5
        }
      },
      sfx: {
        hit: document.getElementById("sfx-hit"),
        levelup: document.getElementById("sfx-levelup")
      },
      font: {
        small: "14pt sans-serif",
        large: "20pt sans-serif"
      },
      windows: {
        help: {},
        pause: {},
        inventory: {}
      },
      param: {
        protagonist_level: document.getElementById("param-protagonist-level"),
        protagonist_xp: document.getElementById("param-protagonist-xp"),
      },
      active: {
        save: document.getElementById("active-save"),
        load: document.getElementById("active-load")
      }
    };

    // Load player images.
    for (var creature in loaded.creature) {
      for (var i = 1; i <= loaded.creature[creature].to; i++) {
        loaded.creature[creature][i] = document.getElementById(
          "ip-" + creature + "-" + i
          );
      }
    }

    // Load windows.
    for (var win in loaded.windows) {
      const element = document.getElementById("xwin-" + win);
      loaded.windows[win] = windows.make_window_object(element);
    }

    // Button commands.
    var Active = {
      save() {
        requirejs('game').Game.save();
      },
      load() {
        load_game();
      }
    };

    // Activate buttons.
    for (var acv in res.active) {
      loaded.active[acv].addEventListener('click', Active[acv]);
    }

    // Load into resources.
    for (var key in loaded) {
      res[key] = loaded[key];
    }
    delete res.load;
  }

  const res = {
    ready: false,
    load: loader
  };

  return res;
});
