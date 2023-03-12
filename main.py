# MORSE DE-CODER
# Morse Code uses a pattern of "bleeps" (Dots or Dashes) for each letter.

# This project does four things in turn:
# a) it times our inputs to recognise Dots, Dashes or Gaps
#   (A Gap is a longer delay, marking the end of a letter)
# b) on the 5 rows of LEDs it displays the morse-code we are building
# c) it uses the Morse-Tree to decode it, bleep-by-bleep
# d) it after a Gap, shows the decoded letter on the display.

# Button_A is used to cycle through three "bleep" input modes:
#   [Button_B presses  - Light Flashes  -  Noises ]
# For the last two, we will need to detect "significant" changes in level
#    rather than responding to every single variation.

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

# define two general purpose Event handlers for timing the starts and ends of bleeps
def onInputHigh():
    global bleeping,bleepStart
    if not bleeping:
        bleeping = True
        bleepStart = input.running_time()

def onInputLow():
    global bleeping,bleepEnd,newBleep
    if bleeping:
        bleeping = False
        bleepEnd = input.running_time()
        newBleep = True

# Changes in light levels can't give us Events, so we'll need to check for ourselves twenty times a second.

def checkLightLevel():
# Once these regular checks are started, using loops_every_interval(), there's no way of stopping them, 
# so for BUTTON and SOUND modes, this function gets called but does nothing!
    if mode == USE_LIGHT: 
        level = input.light_level()
        if bleeping:
            if level < LIGHT_LOW:
                onInputLow()
        else:
            if level > LIGHT_HIGH:
                onInputHigh()
           
def resetMorse():
# prepare decoder for a new letter    
    morseIndex = 1
    basic.clear_screen()
    bleeps = -1

def updateMorse():
# show the new Dot or Dash and update the morse-tree Index
    global  bleepStart,bleepEnd, morseIndex, bleeps
    length = bleepEnd - bleepStart
    if length > DOT_MIN: # ignore really short bleeps
        bleeps += 1
        if bleeps == 5:  # ignore any six-bleep attempt!
            resetMorse()
        else: # it's a valid bleep
            morseIndex += morseIndex
            led.plot(0, bleeps)
            if length > DASH_MIN:
                morseIndex += 1
                led.plot(1, bleeps)
                led.plot(2, bleeps)
    
def newLetter():
# check for letter-end timeout (if it han't already happened)
    global newBleep, morseIndex, letter, bleeps
    length = input.running_time() - bleepEnd
    if newBleep and (length > LETTER_GAP):
        newBleep = False # we only need to detect this once!   
        if bleeps >= 0: # assuming we have at least one bleep!
            letter = MORSE_TREE[morseIndex]
            resetMorse()
            return True
        else:
            return False
    else:
        return False

def obeyCode():
# Could do all sorts of things, but for now, we'll just show the letter
    basic.pause(500)  # (first allow a bit more time to see the last bleep)
    basic.clear_screen()
    basic.show_string(letter)
    basic.pause(1000)
    basic.clear_screen()

def switchModes():
# respond to Button_A being pressed
    global mode, bleeps
# depending on Mode, we must listen out for appropriate events (and ignore ones for other modes!)
    if mode == USE_BUTTON:
        # stop monitoring ups and downs of button B
        control.on_event(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_DOWN, None)
        control.on_event(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_UP, None)

        mode = USE_LIGHT # prepare to switch to flashes
        LIGHT_LOW = input.light_level()
        LIGHT_HIGH = LIGHT_LOW + 30
        resetMorse()
         # DIY, so we won't need to listen for any system events     
        basic.show_leds("""
        # . # . #
        . # # # .
        # # . # #
        . # # # .
        # . # . #
        """)
    elif mode == USE_LIGHT: 
        mode = USE_SOUND # change of mode will disable our light_level_check()
        SOUND_LOW = input.sound_level()
        SOUND_HIGH = SOUND_LOW + 15
        # start monitoring sounds instead
        input.on_sound(DetectedSound.LOUD, onInputHigh)
        input.on_sound(DetectedSound.QUIET, onInputLow)
        mode = USE_SOUND
        resetMorse()
        basic.show_leds("""
        # . # . #
        . . # . #
        # # . . #
        . . . # .
        # # # . .
        """)
    else: # mode must be USE_SOUND
        # stop monitoring sounds
        input.on_sound(DetectedSound.LOUD, None)
        input.on_sound(DetectedSound.QUIET, None)
        # start monitoring button B instead
        control.on_event(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_DOWN, onInputHigh)
        control.on_event(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_UP, onInputLow)
        mode = USE_BUTTON
        resetMorse()
        basic.show_arrow(ArrowNames.EAST)
    basic.pause(2000)
    basic.clear_screen()

# MAIN PROGRAM LOOP...
def mainLoop():
    if newBleep: # a Bleep has just ended...
        updateMorse()
    if newLetter(): # we've waited too long for another Bleep, so letter is complete
        obeyCode() # ...as shown by global letter
    basic.pause(20)

# VALUES TO BE TUNED FOR BEST PERFORMANCE
DOT_MIN=20
DASH_MIN=250
LETTER_GAP=500

# These trigger levels will be set automatically
LIGHT_HIGH = 0
LIGHT_LOW = 0
SOUND_HIGH = 0
SOUND_LOW = 0

# MODES:
USE_BUTTON = 0
USE_LIGHT = 1
USE_SOUND = 2

MORSE_TREE = "@?ETIANMSURWDKGOHVF?L?PJBXCYZQ??54?3???2???????16???????7???8?90"
morseIndex = 1
bleeps = -1
bleepStart = input.running_time()
bleepEnd = bleepStart
letter = "*"
bleeping = False
newBleep = False
zero = input.light_level() # BUG: always gives 0 the first time it's used!

# kick off our background light checker (once started, this can't be stopped!)
loops.every_interval(50, checkLightLevel)
# tell system what to do when Button_A gets pressed
input.on_button_pressed(Button.A, switchModes)

# EVERYTHING DEFINED: NOW START RUNNING
mode = USE_SOUND # ... immediately changed to USE_BUTTON:
switchModes() # run once to ensure button mode displayed 
basic.forever(mainLoop)