/*
import pickle
import sys

import pygame
from tkinter import *
from resources import (
    BEACH, WATER, HOUSE, TREE, DECORATIONS, PLAYER, ENEMY_IMAGES,
    SOUNDTRACK,
    SMALL_FONT, LARGE_FONT
    )
from game import (
    Game, load_game,
    MAP_WIDTH, MAP_HEIGHT, START_LOCATION
    )
from define import (
    help, inventory, levelup, initialization
    )
*/

var GameView = {
  VERSION: "0.00.19.2",
  GAME_NAME: "VenomQuest",
  WIDTH: 704,
  HEIGHT: 704,
  BACKGROUND: "#FF0000",
  VIEW_WIDTH: 11,
  VIEW_HEIGHT: 11
};

GameView.SIZE = [GameView.WIDTH, GameView.HEIGHT];
GameView.MAX_VIEW_CENTRE_X = Game.MAP_WIDTH - Math.floor(GameView.VIEW_WIDTH / 2) - 1;
GameView.MIN_VIEW_CENTRE_X = Math.floor(GameView.VIEW_WIDTH / 2);
GameView.MAX_VIEW_CENTRE_Y = Game.MAP_HEIGHT - Math.floor(GameView.VIEW_HEIGHT / 2) - 1;
GameView.MIN_VIEW_CENTRE_Y = Math.floor(GameView.VIEW_HEIGHT / 2);

window.addEventListener("load", function() {
  GameView.canvas = document.getElementById("game");
  GameView.context = GameView.canvas.getContext("2d");
}, false);

document.title = GameView.GAME_NAME + " Version " + GameView.VERSION;

/*

class GameView:
    '''A viewer for a game of Fluke.'''
    def __init__(self, game):
        self.game = game

        # Game view.
        self.view_centre = START_LOCATION

    def recalculate_view_centre(self):
        """Recalculates the optimal centre of the screen for viewing."""
        player = self.game.protagonist
        self.view_centre = (
            max(MIN_VIEW_CENTRE_X, min(MAX_VIEW_CENTRE_X, player.x)),
            max(MIN_VIEW_CENTRE_Y, min(MAX_VIEW_CENTRE_Y, player.y))
            )

    def draw_databox(self):
        '''Draws the protagonist's vital statistics.'''
        player = self.game.protagonist
        t_xp = SMALL_FONT.render(
            "Level: {}  XP: {}".format(
                player.level, player.xp_display()
                ), 1, (0, 0, 0))
        t_xp_pos = t_xp.get_rect(centerx=WIDTH//2)
        t_xp_pos.centery = HEIGHT - 20
        SCREEN.blit(t_xp, t_xp_pos)

    def view_coordinates(self, actual_x, actual_y):
        """Given actual coordinates, calculate coordinates after shifting for
           the view and multiplying by screen size."""
        return (64 * (actual_x - self.view_centre[0] + VIEW_WIDTH // 2),
                64 * (actual_y - self.view_centre[1] + VIEW_HEIGHT // 2))

    def draw_terrain(self):
        """Draws background."""
        game = self.game

        # 1. Beach.
        for tiley in range(VIEW_HEIGHT):
            for tilex in range(VIEW_WIDTH):
                SCREEN.blit(BEACH, (tilex*64, tiley*64))

        # 2. Water.
        for waterx, watery in game.water_locs:
            SCREEN.blit(WATER, self.view_coordinates(waterx, watery))

        # 3. Trees.
        for treex, treey in game.tree_locs:
            SCREEN.blit(TREE, self.view_coordinates(treex, treey))

        # 4. Draw the houses.
        for housex, housey in game.house_locs:
            SCREEN.blit(HOUSE, self.view_coordinates(housex, housey))

        # 5. Draw decorations.
        for decx, decy, _, image in game.decorations:
            SCREEN.blit(DECORATIONS[image],
                        self.view_coordinates(decx, decy))

    def draw_characters(self):
        """Draws characters."""
        game = self.game
        player = game.protagonist

        SCREEN.blit(
            PLAYER[player.level],
            self.view_coordinates(player.x, player.y)
            )

        for creep in game.enemies:
            SCREEN.blit(
                ENEMY_IMAGES[creep.type],
                self.view_coordinates(creep.x, creep.y)
                )

def mainloop():
    """Runs the main game loop."""
    def gui_save():
        game.save()
    def gui_load():
        nonlocal game, gview
        game = load_game()
        gview = GameView(game)
    def pause():
        root = Tk()
        root.title('PAUSE')
        Label(text='-PAUSE-').pack(pady=10)
        Label(text='Save, Quit, or continue').pack(pady=0)
        Button(text='SAVE', command=gui_save).pack(side=BOTTOM)
        Button(text='Load', command=gui_load).pack(side=BOTTOM)
        Button(text='CONTINUE',command=root.destroy).pack(side=BOTTOM)
        root.mainloop()
    # SFX
    SOUNDTRACK.play(loops=-1)

    # FONT
    t_heading = LARGE_FONT.render(
        "{} v. {} (Alpha)".format(GAME_NAME, VERSION), 1, (80, 0, 0))
    t_heading_pos = t_heading.get_rect(centerx=WIDTH//2)

    # Set up game.
    game = Game()
    gview = GameView(game)

    tick = 0
    while True: # infinite loop
        tick += 1
        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit() # Exit if QUIT detected
            elif event.type == pygame.KEYDOWN:
                mods = pygame.key.get_mods()
                if event.key == pygame.K_w:
                    game.move_up()
                elif event.key == pygame.K_s:
                    if mods & pygame.KMOD_CTRL:
                        game.save()
                        save()
                    else:
                        game.move_down()
                elif event.key == pygame.K_a:
                    game.move_left()
                elif event.key == pygame.K_d:
                    game.move_right()
                elif event.key == pygame.K_l:
                    if mods & pygame.KMOD_CTRL:
                        game=load_game()
                        gview = GameView(game)
                    elif mods & pygame.KMOD_ALT:
                        game.protagonist.level_up()
                        levelup()
                elif event.key == pygame.K_b:
                    game.house_locs.add((game.protagonist.x, game.protagonist.y))
                elif event.key == pygame.K_t:
                    game.tree_locs.add((game.protagonist.x, game.protagonist.y))
                elif event.key == pygame.K_h:
                    help()
                elif event.key == pygame.K_p:
                    pause()
                elif event.key == pygame.K_i:
                    inventory(game)
                elif event.key == pygame.K_SPACE:
                    game.decorations.append(
                        Decoration(
                            game.protagonist.x,
                            game.protagonist.y,
                            game.tick+1,
                            "attack"
                            )
                        )
                    game.protagonist.xp_gain(1)
                elif event.key == pygame.K_x:
                    game.protagonist.xp_gain(1)

        # DRAW
        SCREEN.fill(BACKGROUND) # Clear

        # 1. Recalculate view camera.
        gview.recalculate_view_centre()

        # 2. Draw the terrain
        gview.draw_terrain()

        # 3. Draw the player
        gview.draw_characters()
        gview.draw_databox()

        # 4. Draw the text
        SCREEN.blit(t_heading, t_heading_pos)

        pygame.display.flip() #unbuffer

if __name__ == "__main__":
    mainloop()
*/
