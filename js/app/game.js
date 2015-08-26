// Game-related variables and methods.

define(
  ['character', 'enemy', 'resources', 'util', 'promise!sfx'],
  function(Character, enemy, res, util, sfx) {
    "use strict";

    const Decoration = {
      create(image, x, y, expire) {
        return {
          image: image,
          x: x,
          y: y,
          expire: expire
        };
      }
    };

    var GameProto = {
      _initialize_water() {
        // Water Locations
        this.water_locs = new Set();
        for (var i = 0; i < 100; i++) {
          const x = Math.floor(Math.random() * Game.MAP_WIDTH);
          const y = Math.floor(Math.random() * Game.MAP_WIDTH);
          this.water_locs.add(util.coord([x, y]));
        }
      },

      _initialize_house() {
        // House Locs
        this.house_locs = new Set();
        for (var i = 0; i < 15; i++) {
          const x = Math.floor(Math.random() * Game.MAP_WIDTH);
          const y = Math.floor(Math.random() * Game.MAP_WIDTH);
          const coord = util.coord([x, y]);
          if (!this.water_locs.has(coord)) {
            this.house_locs.add(coord);
          }
        }
      },

      _initialize_trees() {
        // Tree Locs
        this.tree_locs = new Set();
        for (var i = 0; i < 10; i++) {
          const x = Math.floor(Math.random() * Game.MAP_WIDTH);
          const y = Math.floor(Math.random() * Game.MAP_WIDTH);
          const coord = util.coord([x, y]);
          if (!this.water_locs.has(coord) && !this.house_locs.has(coord)) {
            this.tree_locs.add(coord);
          }
        }
      },

      initialize() {
        this._initialize_water();
        this._initialize_house();
        this._initialize_trees();

        // Protagonist
        this.protagonist = Character.create("fighter", this.START_LOCATION);

        // Generate enemies.
        this.enemies = [];
        for (var i = 0; i < 50; i++) {
          const x = Math.floor(Math.random() * this.MAP_WIDTH);
          const y = Math.floor(Math.random() * this.MAP_HEIGHT);
          if (this.passable(x, y)) {
            this.enemies.push(enemy.generate_creep(x, y));
          }
        }

        // Decorations.
        this.decorations = [];

        // Timer.
        this.tick = 0;
      },
      passable(x, y) {
        return (!this.house_locs.has(util.coord([x, y])) &&
                !this.water_locs.has(util.coord([x, y])) &&
                0 <= x && x < this.MAP_WIDTH &&
                0 <= y && y < this.MAP_HEIGHT);
      },
      decorate(image, x, y, expire) {
        this.decorations.push(
          Decoration.create(image, x, y, this.tick + expire)
        );
      },
      player_moved() {
        // The player has moved. This updates the game state to match.
        // Tick.
        this.tick += 1;

        // Remove expired decorations.
        this.decorations = this.decorations.filter(function(dec) {
          return dec.expire > this.tick;
        }.bind(this));

        // Move unkilled enemies.
        this.move_enemies();

        // Kill enemies!
        this.do_fights();
      },
      move_up() {
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
      move_down() {
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
      move_left() {
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
      move_right() {
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
      move_enemies() {
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
      do_fights() {
        // Calculate the result of fights.
        const player = this.protagonist;

        // Kill enemies!
        this.enemies.forEach(creep => {
          // Fight with protagonist.
          if (Math.abs(player.x - creep.x) + Math.abs(player.y - creep.y) <= 1) {
            // Enemy dies.
            creep.alive = false;
            sfx.hit.play();
            Character.xp_gain(player, 30);
            this.decorate("corpse", creep.x, creep.y, 5);
          }
          // Fight with creeps if they haven't died.
          if (creep.alive) {
            this.enemies.forEach(creep2 => {
              if (creep2.alive && creep != creep2 &&
                  Math.abs(creep.x - creep2.x) + Math.abs(creep.y - creep2.y) <= 1) {
                if (Math.random() < 0.5) {
                  creep.alive = false;
                  Character.xp_gain(creep2, 30);
                  this.decorate("corpse", creep.x, creep.y, 5);
                } else {
                  creep2.alive = false;
                  Character.xp_gain(creep, 30);
                  this.decorate("corpse", creep2.x, creep2.y, 5);
                }
              }
            });
          }
        });
        this.enemies = this.enemies.filter(creep => creep.alive);
      },
      save: function() {
        localStorage.vqsave = JSON.stringify(this);
        localStorage.vqsets = JSON.stringify({
          house_locs: Array.from(this.house_locs.values()),
          tree_locs: Array.from(this.tree_locs.values()),
          water_locs: Array.from(this.water_locs.values())
        });
      }
    };

    var Game = {
      MAP_WIDTH: 47,
      MAP_HEIGHT: 47,
      START_LOCATION: [23, 23],
      __proto__: GameProto
    };

    function load_game() {
      // Loads a game from the save file and returnes the loaded Game
      const game = JSON.parse(localStorage.vqsave);
      const sets = JSON.parse(localStorage.vqsets);
      for (var skey in sets) {
        Game[skey] = new Set(sets[skey]);
      }
      for (var gkey in game) {
        Game[gkey] = game[gkey];
      }
      GameView.initialize(Game);
    }

    return {Game};
  }
  );
