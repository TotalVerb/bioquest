define(
  ['domReady!', 'game', 'resources', 'character', 'util', 'font',
   'window', 'sfx', 'dialogue', 'view'],
  function(document, game, res, Character, util, font, windows, sfx, dialogue,
    viewport) {
    "use strict";

    const Game = game.Game;

    const GameView = {
      VERSION: "0.0.5",
      GAME_NAME: "Bio Quest",
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
        this.context.font = font.small;
        const text = "Level: " + player.level + "  XP: " + Character.xp_display(player);
        const width = this.context.measureText(text).width;
        this.context.fillText(
          text,
          viewport.WIDTH / 2 - width / 2,
          viewport.HEIGHT - 20
          );
      },
      drawDialogue() {
        var toSpeak = Game.getDialogue();
        if (toSpeak !== undefined) {
          dialogue.displayDialogue(this.context, toSpeak);
        }
      },
      viewCoordinates(coords) {
        const carr = util.uncoord(coords);
        return this.viewCoordinatesRaw(carr[0], carr[1]);
      },
      viewCoordinatesRaw(x, y) {
        return [
          64 * (x - this.view_centre[0] + Math.floor(viewport.VIEW_WIDTH / 2)),
          64 * (y - this.view_centre[1] + Math.floor(viewport.VIEW_HEIGHT / 2))
        ];
      },
      absoluteCoordinates(x, y) {
        return [
          Math.floor(x / 64) + this.view_centre[0] - Math.floor(viewport.VIEW_WIDTH / 2),
          Math.floor(y / 64) + this.view_centre[1] - Math.floor(viewport.VIEW_HEIGHT / 2)
        ];
      },
      clicked(x, y) {
        var player = this.game.protagonist;
        [player.x, player.y] = this.absoluteCoordinates(x, y);
      },
      draw_terrain() {
        // Draw terrain.
        const game = this.game;

        // 1. Grass.
        for (var tiley = 0; tiley < viewport.VIEW_HEIGHT; tiley++) {
          for (var tilex = 0; tilex < viewport.VIEW_WIDTH; tilex++) {
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

    GameView.canvas = document.getElementById("game");
    GameView.context = GameView.canvas.getContext("2d");
    prepare();

    GameView.SIZE = [viewport.WIDTH, viewport.HEIGHT];
    GameView.MAX_VIEW_CENTRE_X = Game.MAP_WIDTH - Math.floor(viewport.VIEW_WIDTH / 2) - 1;
    GameView.MIN_VIEW_CENTRE_X = Math.floor(viewport.VIEW_WIDTH / 2);
    GameView.MAX_VIEW_CENTRE_Y = Game.MAP_HEIGHT - Math.floor(viewport.VIEW_HEIGHT / 2) - 1;
    GameView.MIN_VIEW_CENTRE_Y = Math.floor(viewport.VIEW_HEIGHT / 2);

    document.title = GameView.GAME_NAME + " Version " + GameView.VERSION;

    function prepare() {
      // Prepares the game.
      GameView.context.font = font.large;
      var heading = GameView.GAME_NAME + " v. " + GameView.VERSION + " (Alpha)";
      var heading_width = GameView.context.measureText(heading).width;
      var heading_x = viewport.WIDTH / 2 - heading_width / 2;

      // Set up game.
      Game.initialize();
      GameView.initialize(Game);

      // Frame.
      function frame() {
        const cxt = GameView.context;
        cxt.clearRect(0, 0, viewport.WIDTH, viewport.HEIGHT);

        // Draw terrain, characters, databox, heading.
        GameView.recalculateViewCentre();
        GameView.draw_terrain();
        GameView.draw_characters();
        GameView.drawDatabox();
        GameView.drawDialogue();

        cxt.font = font.large;
        cxt.fillText(heading, heading_x, 50);
      }

      setInterval(frame, 1000 / 30);

      // Inventory loop.
      function updateWindows() {
        res.param.protagonist_level.textContent = Game.protagonist.level;
        res.param.protagonist_xp.textContent = Character.xp_display(Game.protagonist);
      }
      setInterval(updateWindows, 1000 / 5);
    }

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
        case "F":
          var rand = Math.random() * Math.PI * 2;
          for (var i = 0; i < 5; i++) {
            var θ = 2 * Math.PI * i / 5 + rand;
            Game.decorate("flame", Game.protagonist.x, Game.protagonist.y, 100,
              0.05 * Math.cos(θ), 0.05 * Math.sin(θ));
          }
          sfx.fire.play();
          break;
        case "T":
          Game.tree_locs.add(util.coord([Game.protagonist.x, Game.protagonist.y]));
          break;
        case "X":
          Character.xp_gain(Game.protagonist, 1);
          break;
        case "H":
          windows.help.open();
          break;
        case "P":
          windows.pause.open();
          break;
        case "I":
          windows.inventory.open();
          break;
        case "L":
          Character.level_up(Game.protagonist);
          break;
        case " ":
          Game.decorate("attack", Game.protagonist.x, Game.protagonist.y, 1);
          Character.xp_gain(Game.protagonist, 1);
          break;
      }
      turn_on_interval_if_not_already_on();
    }, false);

    var game_tick = null;
    function turn_on_interval_if_not_already_on() {
      if (game_tick === null) {
        game_tick = setInterval(Game.tick.bind(Game), 100);
      }
    }

    GameView.canvas.addEventListener("click", function(event) {
      GameView.clicked(event.offsetX, event.offsetY);
    });
  }
  );
