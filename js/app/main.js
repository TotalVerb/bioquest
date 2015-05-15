define(
  ['async', './game', './resources', './character'],
  function(async, game, res, character) {
    "use strict";

    var Game = game.Game;
    var Util = game.Util;
    var Character = character.Character;

    var GameView = {
      VERSION: "0.00.19.5",
      GAME_NAME: "Bio Quest",
      WIDTH: 704,
      HEIGHT: 576,
      VIEW_WIDTH: 11,
      VIEW_HEIGHT: 9,
      initialize: function(game) {
        this.game = game;
        this.view_centre = Game.START_LOCATION.slice();
      },
      recalculate_view_centre: function() {
        var player = this.game.protagonist;
        this.view_centre = [
          Math.max(GameView.MIN_VIEW_CENTRE_X,
                   Math.min(GameView.MAX_VIEW_CENTRE_X, player.x)),
          Math.max(GameView.MIN_VIEW_CENTRE_Y,
                   Math.min(GameView.MAX_VIEW_CENTRE_Y, player.y))
          ];
      },
      draw_databox: function() {
        var player = this.game.protagonist;
        this.context.font = res.font.small;
        var text = "Level: " + player.level + "  XP: " + Character.xp_display(player);
        var width = this.context.measureText(text).width;
        this.context.fillText(
          text,
          GameView.WIDTH / 2 - width / 2,
          GameView.HEIGHT - 20
          );
      },
      view_coordinates: function(coords) {
        var carr = Util.uncoord(coords);
        return this.view_coordinates_raw(carr[0], carr[1]);
      },
      view_coordinates_raw: function(x, y) {
        return [
          64 * (x - this.view_centre[0] + Math.floor(this.VIEW_WIDTH / 2)),
          64 * (y - this.view_centre[1] + Math.floor(this.VIEW_HEIGHT / 2))
          ];
      },
      draw_terrain: function() {
        // Draw terrain.
        var game = this.game;
        var self = this;
        // 1. Grass.
        for (var tiley = 0; tiley < this.VIEW_HEIGHT; tiley++) {
          for (var tilex = 0; tilex < this.VIEW_WIDTH; tilex++) {
            this.context.drawImage(res.image.grass, tilex*64, tiley*64);
          }
        }
        // 2. Water
        game.water_locs.forEach(function(coords) {
          var carr = self.view_coordinates(coords);
          self.context.drawImage(res.image.water, carr[0], carr[1]);
        });

        // 3. Trees.
        game.tree_locs.forEach(function(coords) {
          var carr = self.view_coordinates(coords);
          self.context.drawImage(res.image.tree, carr[0], carr[1]);
        });

        // 4. Houses.
        game.house_locs.forEach(function(coords) {
          var carr = self.view_coordinates(coords);
          self.context.drawImage(res.image.house, carr[0], carr[1]);
        });

        // 5. Draw decorations.
        game.decorations.forEach(function(decor) {
          var carr = self.view_coordinates_raw(decor.x, decor.y);
          self.context.drawImage(res.image[decor.image], carr[0], carr[1]);
        });
      },
      draw_characters: function() {
        // Draws characters.
        var game = this.game;
        var player = game.protagonist;
        var self = this;

        var carr = self.view_coordinates_raw(player.x, player.y);
        this.context.drawImage(
          res.creature[player.type][player.level],
          carr[0], carr[1]
          );

        game.enemies.forEach(function(creep) {
          var carr = self.view_coordinates_raw(creep.x, creep.y);
          self.context.drawImage(
            res.creature[creep.type][creep.level],
            carr[0], carr[1]
            );
        });
      }
    };

    GameView.SIZE = [GameView.WIDTH, GameView.HEIGHT];
    GameView.MAX_VIEW_CENTRE_X = Game.MAP_WIDTH - Math.floor(GameView.VIEW_WIDTH / 2) - 1;
    GameView.MIN_VIEW_CENTRE_X = Math.floor(GameView.VIEW_WIDTH / 2);
    GameView.MAX_VIEW_CENTRE_Y = Game.MAP_HEIGHT - Math.floor(GameView.VIEW_HEIGHT / 2) - 1;
    GameView.MIN_VIEW_CENTRE_Y = Math.floor(GameView.VIEW_HEIGHT / 2);

    document.title = GameView.GAME_NAME + " Version " + GameView.VERSION;

    function prepare() {
      // Prepares the game.
      GameView.context.font = res.font.large;
      var heading = GameView.GAME_NAME + " v. " + GameView.VERSION + " (Alpha)";
      var heading_width = GameView.context.measureText(heading).width;
      var heading_x = GameView.WIDTH / 2 - heading_width / 2;

      // Set up game.
      Game.initialize();
      GameView.initialize(Game);

      // Frame.
      function frame() {
        var cxt = GameView.context;
        cxt.clearRect(0, 0, GameView.WIDTH, GameView.HEIGHT);

        // Draw terrain, characters, databox, heading.
        GameView.recalculate_view_centre();
        GameView.draw_terrain();
        GameView.draw_characters();
        GameView.draw_databox();

        cxt.font = res.font.large;
        cxt.fillText(heading, heading_x, 50);
      }

      window.setInterval(frame, 1000 / 30);

      // Inventory loop.
      function update_windows() {
        res.param.protagonist_level.textContent = Game.protagonist.level;
        res.param.protagonist_xp.textContent = Character.xp_display(Game.protagonist);
      }
      window.setInterval(update_windows, 1000 / 5);
    }

    window.addEventListener("load", function() {
      GameView.canvas = document.getElementById("game");
      GameView.context = GameView.canvas.getContext("2d");
      res.load();
      prepare();
    }, false);

    document.addEventListener("keydown", function(event) {
      var key = String.fromCharCode(event.keyCode);
      // console.log("Event: " + key);
      switch(key) {
        case "W":
          Game.move_up();
          break;
        case "A":
          Game.move_left();
          break;
        case "S":
          Game.move_down();
          break;
        case "D":
          Game.move_right();
          break;
        case "B":
          Game.house_locs.add(Util.coord([Game.protagonist.x, Game.protagonist.y]));
          break;
        case "T":
          Game.tree_locs.add(Util.coord([Game.protagonist.x, Game.protagonist.y]));
          break;
        case "X":
          Character.xp_gain(Game.protagonist, 1);
          break;
        case "H":
          res.windows.help.open();
          break;
        case "P":
          res.windows.pause.open();
          break;
        case "I":
          res.windows.inventory.open();
          break;
        case "L":
          Character.level_up(Game.protagonist);
          break;
        case " ":
          Game.decorate("attack", Game.protagonist.x, Game.protagonist.y, 1);
          Character.xp_gain(Game.protagonist, 1);
          break;
      }
    }, false);
  }
  );
