// Contains page objects needed for BioQuest
define(['domReady!'], function(document) {
  "use strict";

  var res = {};

  function loader() {
    function load_image(id) {
      return document.getElementById(id);
    }

    res = {
      image: {
        attack: load_image("im-attack"),
        beach: load_image("im-beach"),
        grass: load_image("im-grass"),
        corpse: load_image("im-corpse"),
        house: load_image("im-house"),
        water: load_image("im-water"),
        tree: load_image("im-tree"),
        flame: load_image("im-flame"),
        "burning-tree": load_image("im-burning-tree")
      },
      creature: {
        fighter: {
          to: 8
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
    for (var creature in res.creature) {
      for (var i = 1; i <= res.creature[creature].to; i++) {
        res.creature[creature][i] = document.getElementById(
          "ip-" + creature + "-" + i
          );
      }
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
      res.active[acv].addEventListener('click', Active[acv]);
    }
  }

  loader();
  return res;
});
