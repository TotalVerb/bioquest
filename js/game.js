"""Contains the Fluke engine: the game logic, but not the display."""

import os
import pickle
import collections
import random

import character
import enemy

# In the future attempt to remove display-related stuff from this file.
from resources import SFX_HIT

# INITIALIZATION
os.makedirs('save', exist_ok=True)

# Map size.
MAP_WIDTH = 47
MAP_HEIGHT = 47

# Character start location.
START_LOCATION = 23, 23

Decoration = collections.namedtuple(
    "Decoration", ['x', 'y', 'expire', 'image']
    )

class Game:
    '''A VenomQuest game, including the character and map.'''
    def __init__(self):
        # Generate map.
        self.water_locs = {
            (random.randrange(MAP_WIDTH), random.randrange(MAP_HEIGHT))
            for i in range(100)
            }

        self.house_locs = {
            (random.randrange(MAP_WIDTH), random.randrange(MAP_HEIGHT))
            for i in range(15)
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
        self.enemies = [
            enemy for enemy in self.enemies
            if self.passable(enemy.x, enemy.y)
            ]

        # List of decorations.
        self.decorations = []

        # Timer.
        self.tick = 0

    def passable(self, x, y):
        """Returns whether the player is allowed to be in its square."""
        return (x, y) not in self.house_locs \
               and (x, y) not in self.water_locs \
               and 0 <= x < MAP_WIDTH and 0 <= y < MAP_HEIGHT

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

    def decorate(self, image, x, y, expire):
        '''Adds a new decoration to the map.'''
        self.decorations.append(
            Decoration(x, y, self.tick + expire, image)
            )

    def do_fights(self):
        '''Calculate the result of fights.'''
        player = self.protagonist
        # Kill enemies!
        for creep in self.enemies:
            # Fight with protagonist.
            if abs(player.x - creep.x) + abs(player.y - creep.y) <= 1:
                # Enemy dies.
                creep.alive = False
                SFX_HIT.play()
                player.xp_gain(30)
                self.decorate("corpse", creep.x, creep.y, 5)
            # Fight with creeps if they haven't died.
            if creep.alive:
                for creep2 in self.enemies:
                    if (creep2.alive and
                        creep is not creep2 and
                        (abs(creep.x - creep2.x) +
                         abs(creep.y - creep2.y)) <= 1):
                        if random.random() < 0.5:
                            creep.alive = False
                            creep2.xp_gain(30)
                            self.decorate("corpse", creep.x, creep.y, 5)
                        else:
                            creep2.alive = False
                            creep.xp_gain(30)
                            self.decorate("corpse", creep2.x, creep2.y, 5)

        self.enemies = [creep for creep in self.enemies if creep.alive]

    def player_moved(self):
        '''The player has moved. This updates the game state to match.'''
        # Tick.
        self.tick += 1

        # Remove expired decorations.
        self.decorations = [dec for dec in self.decorations
                            if dec.expire > self.tick]

        # Move unkilled enemies.
        self.move_enemies()

        # Kill enemies!
        self.do_fights()

    def save(self):
        '''Saves the game to disk.'''
        with open('save/save.vqs', 'wb') as file:
            pickle.dump(self, file)

def load_game():
    '''Loads a game from the save file and returnes the loaded Game.'''
    with open('save/save.vqs', 'rb') as file:
        return pickle.load(file)
