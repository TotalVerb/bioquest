#######################################
# AI: Copied from VenomQuest          #
#######################################

class CharacterController:
    """Takes control of actions relating to a character. This interface will be called by the controller."""
    def __init__(self, character):
        self.character = character

    def managesp(self):
        """Spends XP."""
        pass
    
    def manage(self):
        """Manages the character."""
        # 1. Check SP
        if self.character.sp > 0:
            self.managesp()

class AI(CharacterController):
    """A basic AI. It will spend SP randomly."""
    def managesp(self):
        assert self.character.sp > 0
        while self.character.sp > 0:
            stat = random.choice(("con", "dex", "mag", "str"))
            self.character.spendsp(stat)
