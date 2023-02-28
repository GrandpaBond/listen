MORSE_TREE = "@?ETIANMSURWDKGOHVF?L?PJBXCYZQ??54?3???2???????16???????7???8?90"
morseIndex = 1
command = "*"
LOUD=50
QUIET=30
DOT_MIN=30
DASH_MIN=300
LETTER_GAP=800
isLoud=False
mark=0
beeps = -1
gap=0
goLoud=0
goQuiet=input.running_time()
mode = 0 #(button)

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
    if isLoud: # (button was down)
        if not input.button_is_pressed(Button.A):
            isLoud=False # button just released
            goQuiet=input.running_time()
            mark=goQuiet-goLoud
        # else simulated "beep" lengthens
    else: # (button was up)
        if input.button_is_pressed(Button.A):
            isLoud=True # new press ends the gap
            goLoud=input.running_time() 
        # lengthen gap, even without new button press
        gap = input.running_time() - goQuiet
            

def checkMorse():
    global morseIndex, mark, command, beeps
    if mark>0: # (just finished a beep)
        if mark>DOT_MIN:
            beeps += 1
            if beeps == 5:  # ignore any six-beep attempt!      
                morseIndex = 0
                basic.clear_screen()
                beeps = -1
            else:            
                morseIndex += morseIndex
                led.plot(0, beeps)
                if mark>DASH_MIN:   
                    morseIndex += 1
                    led.plot(1, beeps)
                    led.plot(2, beeps)
        mark = 0 # mark now dealt with (or too brief to count)
    elif beeps >= 0 and gap > LETTER_GAP:
        command = MORSE_TREE[morseIndex]
        morseIndex = 1
        beeps = -1
        pause(500)  # allow time to show last beep
        basic.clear_screen()

def obey_command(todo):
    basic.show_string(todo)
    basic.pause(500)
    basic.clear_screen()

def on_button_pressed_b():
    global mode
    mode = 1-mode
    
def on_forever():
    global command
    if mode == 0:
        monitor_button()
    else:
        listen()
    checkMorse()
    if command != "*":
        obey_command(command)
        command = "*"
    basic.pause(10)
    
input.on_button_pressed(Button.B, on_button_pressed_b)
basic.forever(on_forever)
