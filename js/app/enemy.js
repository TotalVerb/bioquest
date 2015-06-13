// Generates enemy characters.

define(['./character'], function(Character) {
  "use strict";

  const CREEPS = ["steven", "sierra", "rabbit", "cat"];
  function generate_creep(x, y) {
    const creep_type = CREEPS[Math.floor(CREEPS.length * Math.random())];
    return Character.create(creep_type, [x, y]);
  }

  return {generate_creep};
});
