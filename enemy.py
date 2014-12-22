'''A non-protagonist character.'''

import character
import pygame
import random

pygame.init()

# Image cache.
IMAGE_CACHE = {
    "steven": pygame.image.load("art/male-head.png"),
    "sierra": pygame.image.load("art/female-head.png"),
    "rabbit": pygame.image.load("art/rabbitside.png")
    }

class Creep(character.Character):
    '''A creep that is not the protagonist.'''
    def __init__(self, creep_type, x, y):
        super().__init__(x, y)
        self.type = creep_type

def generate_creep(x, y):
    creep_type = random.choice(list(IMAGE_CACHE.keys()))
    return Creep(creep_type, x, y)
