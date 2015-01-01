// Game-related variables and methods.
"use strict";

var Util = {
  uncoord: function(str) {
    return str.split(',').map(Number);
  },
  coord: function(arr) {
    return arr[0] + "," + arr[1];
  }
};

var Decoration = {
  create: function(image, x, y, expire) {
    return {
      image: image,
      x: x,
      y: y,
      expire: expire
    };
  }
};

var GameProto = {
  initialize: function() {
    // Water Locations
    this.water_locs = Set();
    for (var i = 0; i < 100; i++) {
      var x = Math.floor(Math.random() * Game.MAP_WIDTH);
      var y = Math.floor(Math.random() * Game.MAP_WIDTH);
      this.water_locs.add(Util.coord([x, y]));
    }
    // House Locs
    this.house_locs = Set();
    for (var i = 0; i < 15; i++) {
      var x = Math.floor(Math.random() * Game.MAP_WIDTH);
      var y = Math.floor(Math.random() * Game.MAP_WIDTH);
      var coord = Util.coord([x, y]);
      if (!this.water_locs.has(coord)) {
        this.house_locs.add(coord);
      }
    }
    // Tree Locs
    this.tree_locs = Set();
    for (var i = 0; i < 10; i++) {
      var x = Math.floor(Math.random() * Game.MAP_WIDTH);
      var y = Math.floor(Math.random() * Game.MAP_WIDTH);
      var coord = Util.coord([x, y]);
      if (!this.water_locs.has(coord) && !this.house_locs.has(coord)) {
        this.tree_locs.add(coord);
      }
    }
    // Protagonist
    this.protagonist = Character.create("fighter", this.START_LOCATION);
    
    // Generate enemies.
    this.enemies = [];
    for (var i = 0; i < 50; i++) {
      var x = Math.floor(Math.random() * this.MAP_WIDTH);
      var y = Math.floor(Math.random() * this.MAP_HEIGHT);
      if (this.passable(x, y)) {
        this.enemies.push(generate_creep(x, y));
      }
    }
    
    // Decorations.
    this.decorations = [];

    // Timer.
    this.tick = 0;
  },
  passable: function(x, y) {
    return (!this.house_locs.has(Util.coord([x, y])) &&
            !this.water_locs.has(Util.coord([x, y])) &&
            0 <= x && x < this.MAP_WIDTH &&
            0 <= y && y < this.MAP_HEIGHT);
  },
  decorate: function(image, x, y, expire) {
    this.decorations.push(
      Decoration.create(image, x, y, this.tick + expire)
      )
  },
  player_moved: function() {
    // The player has moved. This updates the game state to match.
    // Tick.
    this.tick += 1;

    // Remove expired decorations.
    this.decorations = this.decorations.filter(function(dec) {
      return dec.expire > this.tick;
    }.bind(this));

    // Move unkilled enemies.
    this.move_enemies()

    // Kill enemies!
    this.do_fights()
  },
  move_up: function() {
    // Moves the protagonist North. Returns false on failure.
    var player = this.protagonist;
    if (this.passable(player.x, player.y - 1)) {
      player.y -= 1;
      this.player_moved();
      return true;
    } else {
      return false;
    }
  },
  move_down: function() {
    // Moves the protagonist South. Returns false on failure.
    var player = this.protagonist;
    if (this.passable(player.x, player.y + 1)) {
      player.y += 1;
      this.player_moved();
      return true;
    } else {
      return false;
    }
  },
  move_left: function() {
    // Moves the protagonist West. Returns false on failure.
    var player = this.protagonist;
    if (this.passable(player.x - 1, player.y)) {
      player.x -= 1;
      this.player_moved();
      return true;
    } else {
      return false;
    }
  },
  move_right: function() {
    // Moves the protagonist East. Returns false on failure.
    var player = this.protagonist;
    if (this.passable(player.x + 1, player.y)) {
      player.x += 1;
      this.player_moved();
      return true;
    } else {
      return false;
    }
  },
  move_enemies: function() {
    // Moves all the enemies.
    this.enemies.forEach(function(enemy) {
      var delta_x = Math.random() > 0.5 ? 1 : -1;
      var delta_y = Math.random() > 0.5 ? 1 : -1;
      var newx = enemy.x + delta_x;
      var newy = enemy.y + delta_y;
      if (this.passable(newx, newy)) {
        enemy.x = newx;
        enemy.y = newy;
      }
    }.bind(this));
  },
  do_fights: function() {
    // Calculate the result of fights.
    var player = this.protagonist;

    // Kill enemies!
    this.enemies.forEach(function(creep) {
      // Fight with protagonist.
      if (Math.abs(player.x - creep.x) + Math.abs(player.y - creep.y) <= 1) {
        // Enemy dies.
        creep.alive = false;
        res.sfx.hit.play();
        Character.xp_gain(player, 30);
        this.decorate("corpse", creep.x, creep.y, 5);
      }
      // Fight with creeps if they haven't died.
      if (creep.alive) {
        this.enemies.forEach(function(creep2) {
          if (creep2.alive && creep != creep2 &&
              Math.abs(creep.x - creep2.x) + Math.abs(creep.y - creep2.y) <= 1) {
            if (Math.random() < 0.5) {
              creep.alive = false;
              Character.xp_gain(creep2, 30);
              this.decorate("corpse", creep.x, creep.y, 5);
            } else {
              creep2.alive = false;
              Character.xp_gain(creep, 30);
              this.decorate("corpse", creep2.x, creep2.y, 5)
            }
          }
        }.bind(this));
      }
    }.bind(this));
    this.enemies = this.enemies.filter(function(creep) {
      return creep.alive;
    });
  }
};

var Game = {
  MAP_WIDTH: 47,
  MAP_HEIGHT: 47,
  START_LOCATION: [23, 23],
  __proto__: GameProto
};
 /*

    def 



    def save(self):
        '''Saves the game to disk.'''
        with open('save/save.vqs', 'wb') as file:
            pickle.dump(self, file)

def load_game():
    '''Loads a game from the save file and returnes the loaded Game.'''
    with open('save/save.vqs', 'rb') as file:
        return pickle.load(file) */
