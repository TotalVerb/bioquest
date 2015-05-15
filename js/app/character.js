// Character

define(['./resources'], function(res) {
  "use strict";

  var Character = {
    create: function(type, start_location) {
      return {
        x: start_location[0],
        y: start_location[1],
        alive: true,
        level: 1,
        xp: 0,
        type: type
      };
    },
    max_level: function(character) {
      return res.creature[character.type].to;
    },
    xp_for_level_up: function(character) {
      return character.level * 50;
    },
    level_up: function(character, reset_xp) {
      if (reset_xp === undefined) reset_xp = true;
      var max = Character.max_level(character);
      if (character.level !== max) {
        character.level += 1;
        if (reset_xp) {
          character.xp = 0;
        }
        res.sfx.levelup.play();
      }
    },
    xp_display: function(character) {
      var max = Character.max_level(character);
      if (character.level === max) {
        return 'MAX';
      } else {
        return character.xp + "/" + Character.xp_for_level_up(character);
      }
    },
    xp_gain: function(character, amount) {
      var max = Character.max_level(character);
      if (character.level === max) {
        return;
      } else {
        character.xp += amount;
        var req = Character.xp_for_level_up(character);
        while (character.xp >= req) {
          character.xp -= req;
          Character.level_up(character, false);
          req = Character.xp_for_level_up(character);
        }
      }
    },
  };

  return {
    Character: Character
  };
});
