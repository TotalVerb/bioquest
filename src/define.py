from tkinter import Tk, Label, Button, BOTTOM

def help():
    root = Tk()
    root.title('HELP')
    Label(text='-HELP-').pack(pady=15)
    Label(text='Well you know what. I only program').pack(pady=0)
    Label(text='2 hours a day you expect me to finish!').pack(pady=0)
    Button(text='X').pack(side=BOTTOM)
    root.mainloop()

def pause():
    root = Tk()
    root.title('PAUSE')
    Label(text='-PAUSE-').pack(pady=10)
    Label(text='Save, Quit, or continue').pack(pady=0)
    Button(text='SAVE').pack(side=BOTTOM)
    Button(text='QUIT').pack(side=BOTTOM)
    Button(text='CONTINUE').pack(side=BOTTOM)
    root.mainloop()

def inventory(game):
    root = Tk()
    root.title('Character')
    Label(text='------CHARACTER------').pack(pady=10)
    Label(text='==STATS==').pack(pady=0)
    Label(text='XP:{}'.format(game.protagonist.xp_display())).pack(pady=0)
    Label(text='Level:{}'.format(game.protagonist.level)).pack(pady=0)
    Label(text='==INVENTORY==').pack(pady=0)
    Label(text='_INCOMPLETE_').pack(pady=0)
    root.mainloop()

def save():
    root = Tk()
    root.title('Saved!')
    Label(text='Game is save').pack(pady=10)

def load():
    root = Tk()
    root.title('Loaded!')
    Label(text='Game has loaded to last save').pack(pady=10)

def levelup():
    root = Tk()
    root.title('LEVEL UP!')
    Label(text='-LEVELUP-').pack(pady=10)
    Label(text='Congrats you are now Level {}!'.format(level)).pack(pady=0)
    root.mainloop()
