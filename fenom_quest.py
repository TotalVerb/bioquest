#!/usr/bin/python3
#############################
# FENOM-QUEST               #
#############################

"""Main Fenom-Quest GUI."""

import sys
import random
import pygame
import character

VERSION = "0.00.16.9"
GAME_NAME = "Fenom-Quest"

# INITIALIZATION
pygame.init()
pygame.mixer.init()

WIDTH = 704
HEIGHT = 704
SIZE = (WIDTH, HEIGHT)

BACKGROUND = (255, 0, 0)

SCREEN = pygame.display.set_mode(SIZE) # main display surface
pygame.display.set_caption("{} Version {}".format(GAME_NAME, VERSION))

# Image cache.
BEACH = pygame.image.load("art/beach.png").convert_alpha()
WATER = pygame.image.load("art/water.png").convert_alpha()
HOUSE = pygame.image.load("art/house2.png").convert_alpha()

# GFX
PLAYER = {}
for i in range(character.MAX_LEVEL):
    PLAYER[i+1] = pygame.image.load(
        "art/cat{}.png".format(i+1)
        ).convert_alpha()

# Sound cache.
LEVELUP = pygame.mixer.Sound("music/sfx/levelup.ogg")
SOUNDTRACK = pygame.mixer.Sound("music/digging-for-riches.ogg")

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

class Game:
    '''A Fenom Quest game, including the character and map.'''
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

        # Generate player.
        self.protagonist = character.Character(*START_LOCATION)

        # Game view.
        self.view_centre = START_LOCATION

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

        # 3. Draw the houses.
        for housex, housey in self.house_locs:
            SCREEN.blit(HOUSE, self.view_coordinates(housex, housey))

    def draw_characters(self):
        """Draws characters."""
        player = self.protagonist
        SCREEN.blit(
            PLAYER[player.level],
            self.view_coordinates(player.x, player.y)
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

    def move_up(self):
        """Moves the protagonist North. Returns false on failure."""
        player = self.protagonist
        if self.passable(player.x, player.y - 1):
            player.y -= 1
            self.recalculate_view_centre()
            return True
        else:
            return False

    def move_down(self):
        """Moves the protagonist South. Returns false on failure."""
        player = self.protagonist
        if self.passable(player.x, player.y + 1):
            player.y += 1
            self.recalculate_view_centre()
            return True
        else:
            return False

    def move_left(self):
        """Moves the protagonist West. Returns false on failure."""
        player = self.protagonist
        if self.passable(player.x - 1, player.y):
            player.x -= 1
            self.recalculate_view_centre()
            return True
        else:
            return False

    def move_right(self):
        """Moves the protagonist East. Returns false on failure."""
        player = self.protagonist
        if self.passable(player.x + 1, player.y):
            player.x += 1
            self.recalculate_view_centre()
            return True
        else:
            return False

def mainloop():
    """Runs the main game loop."""
    # SFX
    SOUNDTRACK.play(loops=-1)

    # FONT
    font = pygame.font.Font(None, 20)
    t_heading = font.render(
        "{} v. {} (Alpha)".format(GAME_NAME, VERSION), 1, (80, 0, 0))
    t_heading_pos = t_heading.get_rect(centerx=WIDTH//2)

    # Set up game.
    game = Game()

    while True: #infinite loop
        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                sys.exit() # Exit if QUIT detected
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_w:
                    game.move_up()
                elif event.key == pygame.K_s:
                    game.move_down()
                elif event.key == pygame.K_a:
                    game.move_left()
                elif event.key == pygame.K_d:
                    game.move_right()
                elif event.key == pygame.K_l:
                    if game.protagonist.level < character.MAX_LEVEL:
                        game.protagonist.level += 1
                        LEVELUP.play()

        # DRAW
        SCREEN.fill(BACKGROUND) # Clear

        # 1. Draw the terrain
        game.draw_terrain()

        # 2. Draw the player
        game.draw_characters()

        # 3. Draw the text
        SCREEN.blit(t_heading, t_heading_pos)

        pygame.display.flip() #unbuffer

if __name__ == "__main__":
    mainloop()
