MORSE_TREE = "?ETIANMSURWDKGOHVF?L?PJBXCYZQ??54?3???2???????16???????7???8?91"
morseIndex = 0
command = "*"
LOUD=200
QUIET=100
DOT_MIN=100
DASH_MIN=300
LETTER_GAP=800
isLoud=False
mark=0
gap=0
goLoud=0
goQuiet=input.running_time()

def listen():
    global isLoud,goLoud,goQuiet,mark,gap 
    if isLoud: # (beeping)
        if input.sound_level()<QUIET:
            isLoud=False # beep just ended
            goQuiet=input.running_time()
            mark=goQuiet-goLoud
        # else beep lengthens
    else: # (not beeping)
        gap = input.running_time() - goQuiet # lengthen gap
        if input.sound_level()>LOUD:
            isLoud=True # new beep ends the gap
            goLoud=input.running_time()
        # else gap lengthens

def monitor_button(): 
# (same logic as listen(), but simulating sound with button_A)
    global isLoud,goLoud,goQuiet,mark,gap
    if isLoud: # (button down)
        if not input.button_is_pressed(Button.A):
            isLoud=False # button just released
            goQuiet=input.running_time()
            mark=goQuiet-goLoud
        # else simulated "beep" lengthens
    else: # (button up)
        gap = input.running_time() - goQuiet # lengthen gap
        if input.button_is_pressed(Button.A):
            isLoud=True # new press ends the gap
            goLoud=input.running_time()
        # else gap lengthens


def checkMorse():
    global morseIndex, mark, command
    if mark>0: # (just finished a beep)
        if mark>DOT_MIN:
            morseIndex += morseIndex
        
        if mark>DASH_MIN:
            morseIndex += 1
        if morseIndex > 63:
            morseIndex = 0 # ignore a six-beep letter!
        mark = 0
    else: 
        if gap>LETTER_GAP:
            command = MORSE_TREE[morseIndex]

def obey_command():
    global command
    basic.show_string(command)
    basic.pause(3000)
    command = "*"

def on_forever():
    global command
    #listen()
    monitor_button()
    checkMorse()
    if command == "*":
        pass
    else:
        obey_command()
    
basic.forever(on_forever)
