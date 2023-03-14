//  MORSE DE-CODER
//  Morse Code uses a pattern of "bleeps" (Dots or Dashes) for each letter.
//  This project does four things in turn:
//  a) it times our inputs to recognise Dots, Dashes or Gaps
//    (A Gap is a longer delay, marking the end of a letter)
//  b) on the 5 rows of LEDs it displays the morse-code we are building
//  c) it uses the Morse-Tree to decode it, bleep-by-bleep
//  d) it after a Gap, shows the decoded letter on the display.
//  Button_A is used to cycle through three "bleep" input modes:
//    [Button_B presses  - Light Flashes  -  Noises ]
//  For the last two, we will need to detect "significant" changes in level
//     rather than responding to every single variation.
//  The system only tells you when a button has been pressed and then released.
//  To time the button-press, we want to know when each of those things happened.
//  So for Button_B we need to use the low-level system command control.on_event() 
//  The Morse-Tree is a string of 63 characters.
//  We use an Index to count along it and select one.
//  At each stage, there are three possible inputs:
//     Dot, Dash, or Gap 
//  If it's a Gap, the latest Index just selects the letter.
//    (But note that not all Dot-Dash patterns are valid Morse codes!)
//  Otherwise, we need room to hold the two new possibilities...
//  We organise this by doubling the Index value for each "bleep", 
//  and then adding 1 to it if the input was a Dash.
//  By extending the ObeyCode() function, you could instead use Morse codes
//  to control attached hardware actions, or run other microbit routines...
//  First we define two general purpose Event handlers for timing the starts and ends of bleeps
//  Note that in Python a function can freely use ANY variables from your code,
//  but it it's going to CHANGE them they must be mentioned using "global"  
function onInputHigh() {
    
    if (active && !bleeping) {
        bleeping = true
        bleepStart = input.runningTime()
    }
    
}

function onInputLow() {
    
    if (active && bleeping) {
        bleeping = false
        bleepEnd = input.runningTime()
        newBleep = true
    }
    
}

//  gets set False once we've processed the bleep
//  Changes in light levels can't give us Events, so we'll need to check for ourselves twenty times a second.
function resetMorse() {
    
    //  prepare decoder for a new letter    
    morseIndex = 1
    basic.clearScreen()
    bleeps = -1
}

function updateMorse() {
    //  in response to new bleep, show the new Dot or Dash and update the morse-tree Index
    
    let length = bleepEnd - bleepStart
    if (length > DOT_MIN) {
        //  ignore really short bleeps
        bleeps += 1
        if (bleeps == 5) {
            //  ignore any six-bleep attempt!
            resetMorse()
        } else {
            //  it's a valid bleep
            morseIndex += morseIndex
            led.plot(0, bleeps)
            if (length > DASH_MIN) {
                morseIndex += 1
                led.plot(1, bleeps)
                led.plot(2, bleeps)
            }
            
        }
        
    }
    
    newBleep = false
}

function newLetter(): boolean {
    //  check for letter-end timeout (if it hasn't already happened)
    
    let length = input.runningTime() - bleepEnd
    if (bleeping || length < LETTER_GAP || bleeps < 0) {
        return false
    } else {
        active = false
        //  temporarily stop checking for new bleeps
        letter = MORSE_TREE[morseIndex]
        //  pick out the letter the index points at
        return true
    }
    
}

function obeyCode() {
    //  Could do all sorts of things, but for now, we'll just show the letter
    basic.pause(500)
    //  (first, allow a bit more time to see the last bleep)
    basic.clearScreen()
    basic.showString(letter)
    basic.pause(1000)
    basic.clearScreen()
}

function doNothing() {
    //  needed for when we want to switch off listening to an event
    
}

function switchModes() {
    //  respond to Button_A being pressed
    
    active = false
    //  depending on Mode, we must listen out for appropriate events (and ignore ones for other modes!)
    if (mode == USE_BUTTON) {
        //  switch to USE_LIGHT
        //  stop monitoring ups and downs of button B
        control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_DOWN, doNothing)
        control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_UP, doNothing)
        mode = USE_LIGHT
        //  prepare to switch to flashes
        //  set the low trigger a bit above the background lighting level
        LIGHT_LOW = input.lightLevel() + 10
        LIGHT_HIGH = LIGHT_LOW + 40
        //  we check for ourselves every 50ms, so we won't need to listen for any system events     
        basic.showLeds(`
        # . # . #
        . # # # .
        # # . # #
        . # # # .
        # . # . #
        `)
    } else if (mode == USE_LIGHT) {
        //  switch to USE_SOUND
        mode = USE_SOUND
        //  just changing the mode will disable our light_level_check()
        SOUND_LOW = input.soundLevel() + 10
        //  get the background noise level
        SOUND_HIGH = SOUND_LOW + 20
        input.setSoundThreshold(SoundThreshold.Quiet, SOUND_LOW)
        input.setSoundThreshold(SoundThreshold.Loud, SOUND_HIGH)
        //  get the system to start monitoring sounds for us instead
        input.onSound(DetectedSound.Loud, onInputHigh)
        input.onSound(DetectedSound.Quiet, onInputLow)
        mode = USE_SOUND
        basic.showLeds(`
        # . # . #
        . . # . #
        # # . . #
        . . . # .
        # # # . .
        `)
    } else {
        //  mode must be USE_SOUND: switch to USE_BUTTON
        //  stop the system monitoring sounds for us
        input.onSound(DetectedSound.Loud, doNothing)
        input.onSound(DetectedSound.Quiet, doNothing)
        //  get the system to start monitoring button B for us instead
        control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_DOWN, onInputHigh)
        control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_UP, onInputLow)
        mode = USE_BUTTON
        basic.showArrow(ArrowNames.East)
    }
    
    basic.pause(2000)
    basic.clearScreen()
    active = true
}

//  MAIN PROGRAM LOOP...
//  VALUES TO BE TUNED FOR BEST PERFORMANCE
let DOT_MIN = 20
let DASH_MIN = 250
let LETTER_GAP = 800
//  These trigger levels will be set automatically
let LIGHT_HIGH = 0
let LIGHT_LOW = 0
let SOUND_HIGH = 0
let SOUND_LOW = 0
//  MODES:
let USE_BUTTON = 0
let USE_LIGHT = 1
let USE_SOUND = 2
let MORSE_TREE = "@?ETIANMSURWDKGOHVF?L?PJBXCYZQ??54?3???2???????16???????7???8?90"
let morseIndex = 1
let bleeps = -1
let bleepStart = input.runningTime()
let bleepEnd = bleepStart
let letter = "*"
let active = false
let bleeping = false
let newBleep = false
let newGap = false
let zero = input.lightLevel()
//  BUG: always gives 0 the first time it's used!
//  kick off our background light checker (once started, this can't be stopped!)
loops.everyInterval(50, function checkLightLevel() {
    let level: number;
    //  Once these regular checks are started, using loops_every_interval(), there's no way of stopping them, 
    //  so for BUTTON and SOUND modes, this function gets called but does nothing!
    if (mode == USE_LIGHT) {
        level = input.lightLevel()
        if (bleeping) {
            if (level < LIGHT_LOW) {
                onInputLow()
            }
            
        } else if (level > LIGHT_HIGH) {
            onInputHigh()
        }
        
    }
    
})
//  tell system what to do when Button_A gets pressed
input.onButtonPressed(Button.A, switchModes)
//  EVERYTHING DEFINED: NOW START RUNNING
let mode = USE_SOUND
//  ... gets immediately changed to USE_BUTTON:
switchModes()
//  run once to ensure button mode displayed 
basic.forever(function mainLoop() {
    
    if (newBleep) {
        //  a Bleep has just ended...
        updateMorse()
    }
    
    if (newLetter()) {
        //  we've waited too long for another Bleep, so letter is complete
        obeyCode()
        //  ...as shown by global letter
        resetMorse()
        //  start checking for bleeps again
        active = true
    }
    
    basic.pause(20)
})
