'''A non-protagonist character.'''

import character
import random
import resources

# Image cache.
class Creep(character.Character):
    '''A creep that is not the protagonist.'''
    def __init__(self, creep_type, x, y):
        super().__init__(x, y)
        self.type = creep_type

def generate_creep(x, y):
    creep_type = random.choice(list(resources.ENEMY_IMAGES.keys()))
    return Creep(creep_type, x, y)
