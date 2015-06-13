// Generates enemy characters.

define(['./character'], function(character) {
  "use strict";

  const CREEPS = ["steven", "sierra", "rabbit", "cat"];
  function generate_creep(x, y) {
    const creep_type = CREEPS[Math.floor(CREEPS.length * Math.random())];
    return character.Character.create(creep_type, [x, y]);
  }

  return {generate_creep};
});
