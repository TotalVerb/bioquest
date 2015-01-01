// Generates enemy characters.
var CREEPS = ["steven", "sierra", "rabbit"];
function generate_creep(x, y) {
  var creep_type = CREEPS[Math.floor(CREEPS.length * Math.random())];
  return Character.create(creep_type, [x, y]);
}
