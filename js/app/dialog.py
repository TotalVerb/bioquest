'''Class that simulates a dialog with pygame drawing.'''

import pygame
import 
pygame.init()

class Dialog:
    '''Simulates a dialog window, allowing drawing to pygame screen.'''
    def __init__(self, text):
        self.text = text
    def draw(self, screen):
        '''Draws this dialog onto the given screen.'''
        dialog_rect = pygame.Rect(252, 252, 200, 200)
        screen.fill((100, 100, 100), dialog_rect)
        pygame.draw.rect(screen, (100, 100, 100),
                         dialog_rect, width=1)
