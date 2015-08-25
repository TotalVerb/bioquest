define(
  ['./game', './resources', './character', './util'],
  function(game, res, Character, util) {
    "use strict";

    const Game = game.Game;

    const GameView = {
      VERSION: "0.00.19.6",
      GAME_NAME: "Bio Quest",
      WIDTH: 704,
      HEIGHT: 576,
      VIEW_WIDTH: 11,
      VIEW_HEIGHT: 9,
      initialize(game) {
        this.game = game;
        this.view_centre = Game.START_LOCATION.slice();
      },
      recalculateViewCentre() {
        const player = this.game.protagonist;
        this.view_centre = [
          Math.max(GameView.MIN_VIEW_CENTRE_X,
                   Math.min(GameView.MAX_VIEW_CENTRE_X, player.x)),
          Math.max(GameView.MIN_VIEW_CENTRE_Y,
                   Math.min(GameView.MAX_VIEW_CENTRE_Y, player.y))
          ];
      },
      drawDatabox() {
        const player = this.game.protagonist;
        this.context.font = res.font.small;
        const text = "Level: " + player.level + "  XP: " + Character.xp_display(player);
        const width = this.context.measureText(text).width;
        this.context.fillText(
          text,
          GameView.WIDTH / 2 - width / 2,
          GameView.HEIGHT - 20
          );
      },
      viewCoordinates(coords) {
        const carr = util.uncoord(coords);
        return this.viewCoordinatesRaw(carr[0], carr[1]);
      },
      viewCoordinatesRaw(x, y) {
        return [
          64 * (x - this.view_centre[0] + Math.floor(this.VIEW_WIDTH / 2)),
          64 * (y - this.view_centre[1] + Math.floor(this.VIEW_HEIGHT / 2))
          ];
      },
      draw_terrain() {
        // Draw terrain.
        const game = this.game;

        // 1. Grass.
        for (var tiley = 0; tiley < this.VIEW_HEIGHT; tiley++) {
          for (var tilex = 0; tilex < this.VIEW_WIDTH; tilex++) {
            this.context.drawImage(res.image.grass, tilex*64, tiley*64);
          }
        }
        // 2. Water
        game.water_locs.forEach(coords => {
          const carr = this.viewCoordinates(coords);
          this.context.drawImage(res.image.water, carr[0], carr[1]);
        });

        // 3. Trees.
        game.tree_locs.forEach(coords => {
          const carr = this.viewCoordinates(coords);
          this.context.drawImage(res.image.tree, carr[0], carr[1]);
        });

        // 4. Houses.
        game.house_locs.forEach(coords => {
          const carr = this.viewCoordinates(coords);
          this.context.drawImage(res.image.house, carr[0], carr[1]);
        });

        // 5. Draw decorations.
        game.decorations.forEach(decor => {
          const carr = this.viewCoordinatesRaw(decor.x, decor.y);
          this.context.drawImage(res.image[decor.image], carr[0], carr[1]);
        });
      },
      draw_characters() {
        // Draws characters.
        const game = this.game;
        const player = game.protagonist;

        const carr = this.viewCoordinatesRaw(player.x, player.y);
        this.context.drawImage(
          res.creature[player.type][player.level],
          carr[0], carr[1]
          );

        game.enemies.forEach(creep => {
          const carr = this.viewCoordinatesRaw(creep.x, creep.y);
          this.context.drawImage(
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
        const cxt = GameView.context;
        cxt.clearRect(0, 0, GameView.WIDTH, GameView.HEIGHT);

        // Draw terrain, characters, databox, heading.
        GameView.recalculateViewCentre();
        GameView.draw_terrain();
        GameView.draw_characters();
        GameView.drawDatabox();

        cxt.font = res.font.large;
        cxt.fillText(heading, heading_x, 50);
      }

      window.setInterval(frame, 1000 / 30);

      // Inventory loop.
      function updateWindows() {
        res.param.protagonist_level.textContent = Game.protagonist.level;
        res.param.protagonist_xp.textContent = Character.xp_display(Game.protagonist);
      }
      window.setInterval(updateWindows, 1000 / 5);
    }

    window.addEventListener("load", function() {
      GameView.canvas = document.getElementById("game");
      GameView.context = GameView.canvas.getContext("2d");
      res.load();
      prepare();
    }, false);

    document.addEventListener("keydown", function(event) {
      const key = String.fromCharCode(event.keyCode);
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
          Game.house_locs.add(util.coord([Game.protagonist.x, Game.protagonist.y]));
          break;
        case "T":
          Game.tree_locs.add(util.coord([Game.protagonist.x, Game.protagonist.y]));
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
