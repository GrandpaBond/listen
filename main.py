# MORSE DE-CODER
# This project does four things in turn:
# a) it times our inputs to recognise Dots, Dashes or Gaps
#   (A Gap is a longer delay, lengthing the end of a letter)
# b) it shows the morse-code we are building on the 5 rows of LEDs
# c) it uses the Morse-Tree to decode it, beep-by-beep
# d) it after a Gap, shows the decoded letter on the display.

# Button_A is used to cycle through three "beep" input modes:
#   [Button_B presses  - Light Flashes  -  Noise Levels ]
# For the last two, we need to detect rises and falls in the average level

# The Morse-Tree is a string of 63 characters.
# We use an Index to count along it and select one.
# At each stage, there are three possible inputs:
#    Dot, Dash, or Gap 
# If it's a Gap, the current Index just selects the letter.
#   (But not all Dot-Dash patterns are valid Morse codes!)
# Otherwise, we need room for two more possibilities...
# We organise this by doubling the Index value for each "beep", 
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
isHigh=False # the "beep" state
length = 0
beeps = -1
gap=0
goHigh=0
goLow=input.running_time()
mode = 0 #(button)
levels = [0,0,0,0,0,0,0,0]  # rolling average uses last 8 readings
SLOTS = 8 
slot = 0 
levelSum = 0

def changeIn(new): # 
    global levels, slot, levelSum
    levelSum += (new - levels[slot])
    levels[slot] = new
    slot = (slot+1) % SLOTS
    average =  # update rolling average
    return new - (levelSum / SLOTS)


def checkInput():
    global mode,isHigh,goHigh,goLow, length
    if mode == 0:   # button inputs
        if input.button_is_pressed(Button.B):
            new = 100 # it can only ever be 100% pressed...
        else:
            new = 0  # or not at all!
        change = changeIn(new)
    elif mode == 1: # light inputs
        change = changeIn(input.light_level())
    else:           # sound inputs
        change = changeIn(input.sound_level()) 

    if isHigh: # (beeping)
        if input.sound_level()<QUIET:
            isHigh=False # beep just ended
            goLow=input.running_time()
            length=goLow-goHigh
        # else beep lengthens
    else: # (not beeping)
        gap = input.running_time() - goLow # lengthen gap
        if input.sound_level()>LOUD:
            isHigh=True # new beep ends the gap
            goHigh=input.running_time()
        # else gap lengthens
        
def feel(): # simply monitor Button_B                                                          
    return 

def monitor_button(): 
# (same logic as listen(), but simulating sound with button_A)
    global isHigh,goHigh,goLow,length,gap
    if isHigh: # (button was down)
            isHigh=False # button just released
            goLow=input.running_time()
            length=goLow-goHigh
        # else simulated "beep" lengthens
    else: # (button was up)
        if input.button_is_pressed(Button.A):
            isHigh=True # new press ends the gap
            goHigh=input.running_time() 
        # lengthen gap, even without new button press
        gap = input.running_time() - goLow
            

def checkMorse():
    global morseIndex, length, command, beeps
    if length>0: # (just finished a beep)
        if length>DOT_MIN:
            beeps += 1
            if beeps == 5:  # ignore any six-beep attempt!      
                morseIndex = 0
                basic.clear_screen()
                beeps = -1
            else:            
                morseIndex += morseIndex
                led.plot(0, beeps)
                if length>DASH_MIN:   
                    morseIndex += 1
                    led.plot(1, beeps)
                    led.plot(2, beeps)
        length = 0 # length now dealt with (or too brief to count)
    elif beeps >= 0 and gap > LETTER_GAP:
        command = MORSE_TREE[morseIndex]
        morseIndex = 1
        beeps = -1
        pause(500)  # allow time to show last beep
        basic.clear_screen()

def obey_command(todo): # For now, just show the letter
    basic.show_string(todo)
    basic.pause(500)
    basic.clear_screen()

def on_button_pressed_a(): # switch input modes
    global mode
    mode = (mode + 1) % 3 # MOD function gives 0,1,2,0,1,2,0...
    
def on_forever():
    global command
    checkInput()
    checkMorse()
    if command != "*":
        obey_command(command)
        command = "*"
    basic.pause(10)
    
input.on_button_pressed(Button.A, on_button_pressed_a)
basic.forever(on_forever)
