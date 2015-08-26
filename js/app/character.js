// Character

define(['resources', 'sfx'], function(res, sfx) {
  "use strict";

  const Character = {
    create(type, start_location) {
      return {
        x: start_location[0],
        y: start_location[1],
        alive: true,
        level: 1,
        xp: 0,
        type: type
      };
    },
    max_level(character) {
      return res.creature[character.type].to;
    },
    xp_for_level_up(character) {
      return character.level * 50;
    },
    level_up(character, reset_xp) {
      if (reset_xp === undefined) {
        reset_xp = true;
      }
      const max = Character.max_level(character);
      if (character.level !== max) {
        character.level += 1;
        if (reset_xp) {
          character.xp = 0;
        }
        sfx.levelup.play();
      }
    },
    xp_display(character) {
      const max = Character.max_level(character);
      if (character.level === max) {
        return 'MAX';
      } else {
        return character.xp + "/" + Character.xp_for_level_up(character);
      }
    },
    xp_gain(character, amount) {
      const max = Character.max_level(character);
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

  return Character;
});
