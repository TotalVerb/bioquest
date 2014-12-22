#!/usr/bin/python3
#############################
# VENOMQUEST                #
#############################
'''VenomQuest, a deadly quest.'''

import os
import pickle
import sys
import random
import pygame
import collections
import character
import enemy
from tkinter import *
from resources import (
    BEACH, WATER, HOUSE, TREE, DECORATIONS, PLAYER, ENEMY_IMAGES,
    SOUNDTRACK, SFX_HIT
    )
from define import (
    help, inventory, levelup, initialization
    )

VERSION = "0.00.19.2"
GAME_NAME = "VenomQuest"


# INITIALIZATION
os.makedirs('save', exist_ok=True)

pygame.init()

WIDTH = 704
HEIGHT = 704
SIZE = (WIDTH, HEIGHT)
kills = 0

BACKGROUND = (255, 0, 0)

SCREEN = pygame.display.set_mode(SIZE) # main display surface
pygame.display.set_caption("{} Version {}".format(GAME_NAME, VERSION))

# Map and screen size.
MAP_WIDTH = 23
MAP_HEIGHT = 23
VIEW_WIDTH = 11 # Only odd screen widths/heights supported!
VIEW_HEIGHT = 11
MAX_VIEW_CENTRE_X = MAP_WIDTH - VIEW_WIDTH // 2 - 1
MIN_VIEW_CENTRE_X = VIEW_WIDTH // 2
MAX_VIEW_CENTRE_Y = MAP_HEIGHT - VIEW_HEIGHT // 2 - 1
MIN_VIEW_CENTRE_Y = VIEW_HEIGHT // 2

# Character start location.
START_LOCATION = 11, 11

Decoration = collections.namedtuple(
    "Decoration", ['x', 'y', 'expire', 'image']
    )

class Game:
    '''A VenomQuest game, including the character and map.'''
    def __init__(self):
        # Generate map.
        self.water_locs = {
            (random.randrange(MAP_WIDTH), random.randrange(MAP_HEIGHT))
            for i in range(25)
            }

        self.house_locs = {
            (random.randrange(MAP_WIDTH), random.randrange(MAP_HEIGHT))
            for i in range(5)
            } - self.water_locs

        self.tree_locs = {
            (random.randrange(MAP_WIDTH), random.randrange(MAP_HEIGHT))
            for i in range(10)
            } - self.water_locs - self.house_locs

        # Generate player.
        self.protagonist = character.Character(*START_LOCATION)

        # Generate enemies.
        self.enemies = [
            enemy.generate_creep(
                random.randrange(MAP_WIDTH),
                random.randrange(MAP_HEIGHT)
                ) for i in range(50)
            ]

        # List of decorations.
        self.decorations = []

        # Game view.
        self.view_centre = START_LOCATION

        # Timer.
        self.tick = 0

    def view_coordinates(self, actual_x, actual_y):
        """Given actual coordinates, calculate coordinates after shifting for
           the view and multiplying by screen size."""
        return (64 * (actual_x - self.view_centre[0] + VIEW_WIDTH // 2),
                64 * (actual_y - self.view_centre[1] + VIEW_HEIGHT // 2))

    def draw_terrain(self):
        """Draws background."""
        # 1. Beach.
        for tiley in range(VIEW_HEIGHT):
            for tilex in range(VIEW_WIDTH):
                SCREEN.blit(BEACH, (tilex*64, tiley*64))

        # 2. Water.
        for waterx, watery in self.water_locs:
            SCREEN.blit(WATER, self.view_coordinates(waterx, watery))

        # 3. Trees.
        for treex, treey in self.tree_locs:
            SCREEN.blit(TREE, self.view_coordinates(treex, treey))

        # 4. Draw the houses.
        for housex, housey in self.house_locs:
            SCREEN.blit(HOUSE, self.view_coordinates(housex, housey))
        # 4. Draw decorations.
        for decx, decy, _, image in self.decorations:
            SCREEN.blit(DECORATIONS[image],
                        self.view_coordinates(decx, decy))

    def draw_characters(self):
        """Draws characters."""
        player = self.protagonist
        SCREEN.blit(
            PLAYER[player.level],
            self.view_coordinates(player.x, player.y)
            )


        for creep in self.enemies:
            SCREEN.blit(
                ENEMY_IMAGES[creep.type],
                self.view_coordinates(creep.x, creep.y)
                )

    def passable(self, x, y):
        """Returns whether the player is allowed to be in its square."""
        return (x, y) not in self.house_locs \
               and (x, y) not in self.water_locs \
               and 0 <= x < MAP_WIDTH and 0 <= y < MAP_HEIGHT

    def recalculate_view_centre(self):
        """Recalculates the optimal centre of the screen for viewing."""
        player = self.protagonist
        self.view_centre = (
            max(MIN_VIEW_CENTRE_X, min(MAX_VIEW_CENTRE_X, player.x)),
            max(MIN_VIEW_CENTRE_Y, min(MAX_VIEW_CENTRE_Y, player.y))
            )

    def draw_databox(self):
        '''Draws the protagonist's vital statistics.'''
        player = self.protagonist
        font = pygame.font.Font(None, 14)
        t_xp = font.render(
            "Level: {}  XP: {}".format(
                player.level, player.xp_display()
                ), 1, (0, 0, 0))
        t_xp_pos = t_xp.get_rect(centerx=WIDTH//2)
        t_xp_pos.centery = HEIGHT - 20
        SCREEN.blit(t_xp, t_xp_pos)

    def move_up(self):
        """Moves the protagonist North. Returns false on failure."""
        player = self.protagonist
        if self.passable(player.x, player.y - 1):
            player.y -= 1
            self.player_moved()
            return True
        else:
            return False

    def move_down(self):
        """Moves the protagonist South. Returns false on failure."""
        player = self.protagonist
        if self.passable(player.x, player.y + 1):
            player.y += 1
            self.player_moved()
            return True
        else:
            return False

    def move_left(self):
        """Moves the protagonist West. Returns false on failure."""
        player = self.protagonist
        if self.passable(player.x - 1, player.y):
            player.x -= 1
            self.player_moved()
            return True
        else:
            return False

    def move_right(self):
        """Moves the protagonist East. Returns false on failure."""
        player = self.protagonist
        if self.passable(player.x + 1, player.y):
            player.x += 1
            self.player_moved()
            return True
        else:
            return False

    def move_enemies(self):
        '''Moves all the enemies.'''
        for creep in self.enemies:
            delta = random.choice((
                (0, 1),
                (0, -1),
                (1, 0),
                (-1, 0),
                ))
            newx, newy = creep.x + delta[0], creep.y + delta[1]
            if self.passable(newx, newy):
                creep.x = newx
                creep.y = newy

    def player_moved(self):
        '''The player has moved. This updates the game state to match.'''
        self.recalculate_view_centre()

        # Tick.
        self.tick += 1

        # Remove expired decorations.
        self.decorations = [dec for dec in self.decorations
                            if dec.expire > self.tick]

        # Kill enemies!
        for creep in self.enemies:
            if (abs(self.protagonist.x - creep.x) +
                abs(self.protagonist.y - creep.y)) <= 1:
                # Enemy dies.
                creep.alive = False
                SFX_HIT.play()
                self.protagonist.xp_gain(30)
                self.decorations.append(
                    Decoration(creep.x, creep.y, self.tick + 5, "corpse")
                    )
        self.enemies = [creep for creep in self.enemies if creep.alive]

        # Move unkilled enemies.
        self.move_enemies()

    def save(self):
        '''Saves the game to disk.'''
        with open('save/save.VQS', 'wb') as file:
            pickle.dump(self, file)

def load_game():
    with open('save/save.VQS', 'rb') as file:
        return pickle.load(file)

def mainloop():
    """Runs the main game loop."""
    def gui_save():
        game.save()
    def gui_load():
        nonlocal game
        game = load_game()
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
    font = pygame.font.Font(None, 20)
    t_heading = font.render(
        "{} v. {} (Alpha)".format(GAME_NAME, VERSION), 1, (80, 0, 0))
    t_heading_pos = t_heading.get_rect(centerx=WIDTH//2)

    # Set up game.
    game = Game()

    tick = 0
    while True: #infinite loop
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
                        load()
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

        # 1. Draw the terrain
        game.draw_terrain()

        # 2. Draw the player
        game.draw_characters()
        game.draw_databox()

        # 3. Draw the text
        SCREEN.blit(t_heading, t_heading_pos)

        pygame.display.flip() #unbuffer

if __name__ == "__main__":
    mainloop()
