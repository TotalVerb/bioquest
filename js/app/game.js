// Game-related variables and methods.

define(
  ['character', 'enemy', 'resources', 'util', 'promise!sfx', "story"],
  function(Character, enemy, res, util, sfx, story) {
    "use strict";

    const Decoration = {
      create(image, x, y, expire, vx=0, vy=0) {
        return {
          image: image,
          x: x,
          y: y,
          vx: vx,
          vy: vy,
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
        this.clock = 0;
      },
      passable(x, y) {
        return (!this.house_locs.has(util.coord([x, y])) &&
                !this.water_locs.has(util.coord([x, y])) &&
                0 <= x && x < this.MAP_WIDTH &&
                0 <= y && y < this.MAP_HEIGHT);
      },
      decorate(image, x, y, expire, vx=0, vy=0) {
        this.decorations.push(
          Decoration.create(image, x, y, this.clock + expire, vx, vy)
        );
      },
      tick() {
        this.clock += 1;
        if (this.clock % 10 === 0) {
          // Move unkilled enemies.
          this.move_enemies();
        }
        // Remove expired decorations.
        this.decorations = this.decorations.filter(
            dec => dec.expire > this.clock);
        // Move decorations.
        this.decorations.forEach(dec => {
          dec.x += dec.vx;
          dec.y += dec.vy;
        });
        // Some decorations are destructive.
        var flames = this.decorations.filter(dec => dec.image === "flame");
        flames.forEach(flame => {
          var xs = [Math.floor(flame.x), Math.floor(flame.x) + 1];
          var ys = [Math.floor(flame.y), Math.floor(flame.y) + 1];
          xs.forEach(x =>
            ys.forEach(y => {
              ["tree", "house"].forEach(typ => {
                var locs = this[typ + "_locs"];
                // Burn the tree.
                if (locs.has(util.coord([x, y]))) {
                  locs.delete(util.coord([x, y]));
                  this.decorate("burning-" + typ, x, y, 100);
                }
                this.enemies.forEach(enemy => {
                  if (enemy.x === x && enemy.y === y) {
                    this.kill(this.protagonist, enemy);
                  }
                });
                this.resolveEnemies();
              });
            }));
        });
      },
      player_moved() {
        // The player has moved. This updates the game state to match.
        // Tick.
        for (var i = 0; i < 10; i++) this.tick();

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
          var delta = Math.random() > 0.5 ? 1 : -1;
          var dx = Math.random() > 0.5 ? 0 : 1;
          var dy = 1 - dx;
          var newx = enemy.x + delta * dx;
          var newy = enemy.y + delta * dy;
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
            sfx.hit.play();
            this.kill(player, creep);
          }
          // Fight with creeps if they haven't died.
          if (creep.alive) {
            this.enemies.forEach(creep2 => {
              if (creep2.alive && creep != creep2 &&
                  Math.abs(creep.x - creep2.x) + Math.abs(creep.y - creep2.y) <= 1) {
                if (Math.random() < 0.5) {
                  this.kill(creep2, creep);
                } else {
                  this.kill(creep, creep2);
                }
              }
            });
          }
        });
        this.resolveEnemies();
      },
      kill(killer, killed) {
        killed.alive = false;
        Character.xp_gain(killer, 30 * killed.level);
        this.decorate("corpse", killed.x, killed.y, 5);
      },
      resolveEnemies() {
        this.enemies = this.enemies.filter(creep => creep.alive);
      },
      save: function() {
        localStorage.vqsave = JSON.stringify(this);
        localStorage.vqsets = JSON.stringify({
          house_locs: Array.from(this.house_locs.values()),
          tree_locs: Array.from(this.tree_locs.values()),
          water_locs: Array.from(this.water_locs.values())
        });
      },
      getDialogue() {
        for (var i = 0; i < story[1].length; i++) {
          if (story[1][i].startsAtTick <= this.clock &&
            this.clock < story[1][i].endsAtTick) {
            return story[1][i];
          }
        }
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
