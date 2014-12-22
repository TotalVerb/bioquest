import os
import time
import tkinter
from tkinter import *

img = 'art/VQ.png'

root = Tk()
root.title('Stranger...')
Label(text='What is your name?').pack(side=TOP,padx=10,pady=10)

entry = Entry(root, width=30)
entry.pack(side=TOP,padx=10,pady=10)
disname = None

def initialization():
    root = Tk()
    root.title('Welcome To VenomQuest')
    myName = Label(text='Welcome To VenomQuest {}.'.format(disname)).pack(pady=10)
    Label(text='Once You Begin Use.').pack(pady=0)
    Label(text='W, A, S, D to move.').pack(pady=0)
    Label(text='Kill all the monsters good luck!').pack(pady=0)
    Button(text='IM READY!',command=root.destroy).pack(side=BOTTOM)
    root.mainloop()

def onOkay():
    global disname
    disname = str(entry.get())
    myName = Label(text='Welcome To This World Adventurer {}.'.format(disname)).pack(side=BOTTOM,padx=15,pady=10)

def onClose():
    root.destroy()
    initialization()

Button(root, text='OK', command=onOkay).pack(side=LEFT,padx=5,pady=5)
Button(root, text='BEGIN', command=onClose).pack(side=RIGHT,padx=5,pady=5)

root.mainloop()

def help():
    root.title('HELP')
    Label(text='-HELP-').pack(pady=15)
    Label(text='Well you know what. I only program').pack(pady=0)
    Label(text='2 hours a day you expect me to finish!').pack(pady=0)
    Button(text='X',command=root.destroy).pack(side=BOTTOM)
    root.mainloop()

def inventory(game):
    root.title('Character')
    Label(text='------CHARACTER------').pack(pady=10)
    Label(text='==STATS==').pack(pady=0)
    Label(text='XP:{}'.format(game.protagonist.xp_display())).pack(pady=0)
    Label(text='Level:{}'.format(game.protagonist.level)).pack(pady=0)
    Label(text='==INVENTORY==').pack(pady=0)
    Label(text='_INCOMPLETE_').pack(pady=0)
    root.mainloop()

def save_entry():
    root.title('Saved!')
    Label(text='Game is save').pack(pady=10)

def load_entry():
    root.title('Loaded!')
    Label(text='Game has loaded to last save').pack(pady=10)

def levelup():
    root.title('LEVEL UP!')
    Label(text='-LEVELUP-').pack(pady=10)
    Label(text='Congrats you are now Level {}!'.format(level)).pack(pady=0)
    root.mainloop()
