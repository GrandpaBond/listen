# MORSE DE-CODER
# Morse Code uses a pattern of "bleeps" (Dots or Dashes) for each letter.

# This project does four things in turn:
# a) it times our inputs to recognise Dots, Dashes or Gaps
#   (A Gap is a longer delay, marking the end of a letter)
# b) on the 5 rows of LEDs it displays the morse-code we are building
# c) it uses the Morse-Tree to decode it, bleep-by-bleep
# d) it after a Gap, shows the decoded letter on the display.

# Button_A is used to cycle through three "bleep" input modes:
#   [Button_B presses  - Light Flashes  -  Noise Levels ]
# For the last two, we need to detect significant changes in level
#    rather than responding to every variation.

# The Morse-Tree is a string of 63 characters.
# We use an Index to count along it and select one.
# At each stage, there are three possible inputs:
#    Dot, Dash, or Gap 
# If it's a Gap, the latest Index just selects the letter.
#   (But note that not all Dot-Dash patterns are valid Morse codes!)
# Otherwise, we need room to hold the two new possibilities...
# We organise this by doubling the Index value for each "bleep", 
# and then adding 1 to it if the input was a Dash.

# By extending the ObeyCode() function, you could instead use Morse codes
# to control attached hardware actions, or run other microbit routines...

MORSE_TREE = "@?ETIANMSURWDKGOHVF?L?PJBXCYZQ??54?3???2???????16???????7???8?90"
morseIndex = 1
command = "*"
LOUD=50
QUIET=30
DOT_MIN=30
DASH_MIN=300
LETTER_GAP=800
BUTTON_TRIGGER = 90
LIGHT_TRIGGER = 40
SOUND_TRIGGER = 20

bleeps = -1
bleepStart=0
gapStart = input.running_time()
bleepStart = gapStart+1
mode = 0 #(button)
old = 0
older = 0
oldest = 0
newBleep = False
command = "*"
newCommand = False

def changeOf(new): 
# compares last two readings with the two before them
# (we use pairs to smooth out readings)
    global old,older,oldest
    # (only need to mention any globals we're going to overwrite)
    change = new + old - older - oldest
    oldest = older
    older = old
    old = new
    return change

def checkInputs():
# get the next input (depending on current mode)
    global bleepStart,gapStart
    if mode == 2:  # using sound inputs
        change = changeOf(input.sound_level())
        big = SOUND_TRIGGER  
    elif mode == 1: # using light inputs
        change = changeOf(input.light_level())
        big = LIGHT_TRIGGER
    else:           # using button inputs
        if input.button_is_pressed(Button.B):
            change = changeOf(100) # it can only ever be 100% pressed...
        else:
            change = changeOf(0)  # ...or not at all!
        big = BUTTON_TRIGGER
# new bleep or new completed letter?
    if change > big: 
    # a significant positive change means we're into a new bleep
        bleepStart = input.running_time()   
    if change < -big:
     # a significant negative change means we're into a new gap
        gapStart = input.running_time()
# compare timings...
    length = gapStart - bleepStart
    # negative length means we're in a bleep so just wait
    if length > 0: # positive length means we're into a gap
        updateMorse(length)
        # now check for letter-end timeout
        if(input.running_time() - gapStart) > LETTER_GAP:
            showLetter() 

def showLetter():
    global command, newCommand
    if bleeps >= 0: # assuming we have at least one bleep!
        command = MORSE_TREE[morseIndex]
        morseIndex = 1
        bleeps = -1
        pause(500)  # allow time to show last bleep
        basic.clear_screen()

def updateMorse(length):
# show the new Dot or Dash and update the morse-tree Index
    global morseIndex, bleeps
    if length > DOT_MIN: # ignore really short bleeps
        bleeps += 1
        if bleeps == 5:  # ignore any six-bleep attempt!
            morseIndex = 0
            basic.clear_screen()
            bleeps = -1
        else: # it's a valid bleep
            morseIndex += morseIndex
            led.plot(0, bleeps)
            if length>DASH_MIN:
                morseIndex += 1
                led.plot(1, bleeps)
                led.plot(2, bleeps)

def obey_command(todo): # For now, just show the letter
    basic.show_string(todo)
    basic.pause(500)
    basic.clear_screen()

def on_button_pressed_a(): # switch input modes
    global mode
    if mode == 0:
        mode = 1 # change to light
        basic.show_leds("""
        # . # . #
        . # # # .
        # # . # #
        . # # # .
        # . # . #
        """)
    elif mode == 1: 
        mode = 2 # change to sound
        basic.show_leds("""
        # . # . #
        . . # . #
        # # . . #
        . . . # .
        # # # . .
        """)
    else:
        mode = 0 # change to button
        basic.show_leds("""
        . . . . .
        . # # # .
        . # # # .
        # # # # #
        . . . . .
        """)
    basic.pause(3000)
    
def on_forever():
    global newCommand
    checkInputs()
    if newCommand:
        obey_command(command)
        newCommand = False
    basic.pause(10)
    
input.on_button_pressed(Button.A, on_button_pressed_a)
basic.forever(on_forever)
