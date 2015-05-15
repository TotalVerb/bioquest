// Contains resources and Pygame objects needed for VenomQuest
define(function() {
  "use strict";

  var loader = function() {
    function load_image(id) {
      return document.getElementById(id);
    }

    var loaded = {
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
    var make_hide_function = function(element) {
      return function() {
        element.style.display = "none";
      };
    };

    var WindowPrototype = {
      open: function() {
        for (var win2 in res.windows) {
          loaded.windows[win2].close();
        }
        this.element.style.display = "block";
      },
      close: function() {
        this.element.style.display = "none";
      }
    };

    var make_window_object = function(element) {
      var close_button = document.getElementById("xwin-" + win + "-close");
      close_button.addEventListener(
        'click', make_hide_function(element), false
        );
      return Object.create(WindowPrototype, {
        element: {
          writeable: false,
          configurable: false,
          value: element
        },
        close_button: {
          writeable: false,
          configurable: false,
          value: close_button
        }
      });
    };

    for (var win in loaded.windows) {
      var element = document.getElementById("xwin-" + win);
      loaded.windows[win] = make_window_object(element);
    }

    // Button commands.
    var Active = {
      save: function() {
        requirejs('game').Game.save();
      },
      load: function() {
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
  };

  var res = {
    ready: false,
    load: loader
  };

  return res;
});
