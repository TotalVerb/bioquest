#######################################
# CHARACTER: Copied from VenomQuest   #
#######################################

import random
import math
import pygame

pygame.mixer.init()
LEVELUP = pygame.mixer.Sound("music/sfx/levelup.ogg")

MAX_LEVEL = 7

class Soul:
    """A generic character's body, but none of its worldly existance."""
    def __init__(self, name):
        # 1. The character's name
        self.name = name

        # 2. Vital stats. Don't roll them yet
        self.MAXHP  = 0
        self.MAXMP  = 0
        self.CON    = 0
        self.STR    = 0
        self.DEX    = 0
        self.MAG    = 0
        self.level  = 0
        self.xp     = 0
        self.sp     = 0

        self.hp = 0
        self.mp = 0

        # 3. Inventory
        self.weapon = None

        # 4. Buffs/debuffs
        self.buffs = []

    def __getattr__(self, attr):
        # 1. Deal with stats
        if attr == "str":
            return self.STR

        elif attr == "con":
            return self.CON

        elif attr == "dex":
            return self.DEX

        elif attr == "mag":
            return self.MAG

    def heal(self, amt):
        """Heals oneself."""

        assert amt >= 0

        self.hp += amt
        self.hp = min((self.hp, self.MAXHP))

    def healmp(self, amt):
        """Heals oneself."""

        assert amt >= 0

        self.mp += amt
        self.mp = min((self.hp, self.MAXMP))

    def harm(self, damage):
        """Takes some damage."""

        assert damage >= 0

        if damage >= self.hp:
            print("{} died.".format(self.name))
            self.hp = 0
            # TODO: game over?

            # return the level so XP can be earned
            return self.level

        else:
            print("Not dead though.")
            self.hp -= damage

            return 0

    def boost(self, stat, amt):
        # 1. Deal with stats
        if stat == "str":
            self.STR += amt

        elif stat == "con":
            self.CON += amt
            self.MAXHP += amt * 2
            self.heal(amt * 2)

        elif stat == "dex":
            self.DEX += amt

        elif stat == "mag":
            self.MAG += amt
            self.MAXMP += amt * 2
            self.healmp(amt * 2)

        else:
            assert False

    def spendsp(self, stat):
        # 1. Deal with stats
        if stat == "str":
            self.boost("str", 1)

        elif stat == "con":
            self.boost("con", 1)

        elif stat == "dex":
            self.boost("dex", 1)

        elif stat == "mag":
            self.boost("mag", 1)

        else:
            assert False

    def levelup(self):
        """Level up!"""

        print("{} leveled up!".format(self.name))

        self.level += 1
        self.sp += 1

    def earnxp(self, level):
        """Earn XP."""
        self.xp += level ** 3

        # XP needed to level: 5 * level ** 4
        while self.xp > 5 * self.level ** 4:
            self.xp -= 5 * self.level ** 4
            self.levelup()

    def attack(self, target):
        """Attacks the target with the basic weapon."""

        # 1. Have weapon?
        if self.weapon:
            # TODO: add weapon
            pass
        # 2. Nah...
        else:
            hit = (5 * random.random() - 2) ** 2 * math.sqrt(self.dex)
            if hit > target.dex:
                damage = round(self.str * random.random())
                xp = target.harm(damage)

                # Target died, so earn XP
                if xp:
                    self.earnxp(xp)
                    print("{} killed {}.".format(self.name, target.name))

                # Target did not die.
                else:
                    print("Hit! {} damage.".format(damage))
            else:
                print("{} missed {}.".format(self.name, target.name))

    def roll(self):
        """Rolls the character's stats for the first time. Override this method for prodigies, etc."""

        # 1. Roll three dice for CON
        self.CON = random.randint(1, 6) + random.randint(1, 6) + random.randint(1, 6)

        self.MAXHP = self.CON * 2
        self.hp = self.MAXHP

        # 2. Roll two dice for MAG
        self.MAG = random.randint(1, 6) + random.randint(1, 6)

        self.MAXMP = self.MAG * 2
        self.mp = self.MAXMP

        # 3. Roll one dice for STR and DEX
        self.STR = random.randint(1, 6)
        self.DEX = random.randint(1, 6)

        # 4. Level 1!
        self.level = 1

class Character:
    """A soul's worldly existance."""
    def __init__(self, x, y):
        # Basics
        self.x = x
        self.y = y
        self.alive = True

        # Move this to soul eventually.
        self.level = 1
        self.xp = 0
    def xp_for_level_up(self):
        '''Returns the amount of experience needed to level up.'''
        return self.level * 50
    def level_up(self, reset_xp=True):
        '''Levels the character up.'''
        if self.level != MAX_LEVEL:
            self.level += 1
            if reset_xp:
                self.xp = 0
            LEVELUP.play()
    def xp_display(self):
        '''Returns a string detailing the XP condition.'''
        if self.level == MAX_LEVEL:
            return 'MAX'
        else:
            return "{}/{}".format(self.xp, self.xp_for_level_up())
    def xp_gain(self, amount):
        '''Gains a certain amount of experience and levels up if necessary.'''
        if self.level == MAX_LEVEL:
            return
        else:
            self.xp += amount
            req = self.xp_for_level_up()
            while self.xp > req:
                self.xp -= req
                self.level_up(reset_xp=False)
                req = self.xp_for_level_up()

if __name__ == "__main__":

    print("This is testing characters.")

    def fight(a, b):
        while a.hp > 0 and b.hp > 0:
            a.attack(b)
            b.attack(a)

    characters = []
    while len(characters) < 2:
        nc = Soul("Character # " + str(random.randint(1, 100)))
        nc.roll()
        characters.append(nc)
        if len(characters) >= 2:
            fight(characters[0], characters[1])
        characters = [i for i in characters if i.hp > 0]
        for i in characters:
            i.heal(100)
