// Generates enemy characters.

define(['./character'], function(character) {
  "use strict";

  var CREEPS = ["steven", "sierra", "rabbit"];
  function generate_creep(x, y) {
    var creep_type = CREEPS[Math.floor(CREEPS.length * Math.random())];
    return character.Character.create(creep_type, [x, y]);
  }

  return {
    generate_creep: generate_creep
  };
});
