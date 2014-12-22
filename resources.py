'''Contains resources and Pygame objects needed for FLUKE RPG.'''

import pygame
from character import MAX_LEVEL

pygame.init()
pygame.mixer.init()
pygame.display.set_mode()

# Terrain images.
BEACH = pygame.image.load("art/beach.png").convert_alpha()
WATER = pygame.image.load("art/water.png").convert_alpha()
HOUSE = pygame.image.load("art/house2.png").convert_alpha()

# Decoration images.
DECORATIONS = {
    "attack": pygame.image.load("art/cat3.png").convert_alpha(),
    "corpse": pygame.image.load("art/corpse.png").convert_alpha()
    }

# Player images.
PLAYER = {}
for i in range(MAX_LEVEL):
    PLAYER[i+1] = pygame.image.load(
        "art/fighter{}.png".format(i+1)
        ).convert_alpha()

# Enemy images.
ENEMY_IMAGES = {
    "steven": pygame.image.load("art/male-head.png"),
    "sierra": pygame.image.load("art/female-head.png"),
    "rabbit": pygame.image.load("art/rabbitside.png")
    }

# Sound cache.
SOUNDTRACK = pygame.mixer.Sound("music/digging-for-riches.ogg")
SFX_HIT = pygame.mixer.Sound("music/sfx/hit.ogg")
