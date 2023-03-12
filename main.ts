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
//  define two general purpose Event handlers for timing the starts and ends of bleeps
function onInputHigh() {
    
    if (!bleeping) {
        bleeping = true
        bleepStart = input.runningTime()
    }
    
}

function onInputLow() {
    
    if (bleeping) {
        bleeping = false
        bleepEnd = input.runningTime()
        newBleep = true
    }
    
}

//  Changes in light levels can't give us Events, so we'll need to check for ourselves twenty times a second.
function resetMorse() {
    //  prepare decoder for a new letter    
    let morseIndex = 1
    basic.clearScreen()
    let bleeps = -1
}

function updateMorse() {
    //  show the new Dot or Dash and update the morse-tree Index
    
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
    
}

function newLetter(): boolean {
    //  check for letter-end timeout (if it han't already happened)
    
    let length = input.runningTime() - bleepEnd
    if (newBleep && length > LETTER_GAP) {
        newBleep = false
        //  we only need to detect this once!   
        if (bleeps >= 0) {
            //  assuming we have at least one bleep!
            letter = MORSE_TREE[morseIndex]
            resetMorse()
            return true
        } else {
            return false
        }
        
    } else {
        return false
    }
    
}

function obeyCode() {
    //  Could do all sorts of things, but for now, we'll just show the letter
    basic.pause(500)
    //  (first allow a bit more time to see the last bleep)
    basic.clearScreen()
    basic.showString(letter)
    basic.pause(1000)
    basic.clearScreen()
}

function doNothing() {
    //  needed when we want to switch off listening to an event
    
}

function switchModes() {
    let LIGHT_LOW: number;
    let LIGHT_HIGH: any;
    let SOUND_LOW: number;
    let SOUND_HIGH: any;
    //  respond to Button_A being pressed
    
    //  depending on Mode, we must listen out for appropriate events (and ignore ones for other modes!)
    if (mode == USE_BUTTON) {
        //  stop monitoring ups and downs of button B
        control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_DOWN, doNothing)
        control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_UP, doNothing)
        mode = USE_LIGHT
        //  prepare to switch to flashes
        LIGHT_LOW = input.lightLevel()
        LIGHT_HIGH = LIGHT_LOW + 30
        resetMorse()
        //  DIY, so we won't need to listen for any system events     
        basic.showLeds(`
        # . # . #
        . # # # .
        # # . # #
        . # # # .
        # . # . #
        `)
    } else if (mode == USE_LIGHT) {
        mode = USE_SOUND
        //  change of mode will disable our light_level_check()
        SOUND_LOW = input.soundLevel()
        SOUND_HIGH = SOUND_LOW + 15
        //  start monitoring sounds instead
        input.onSound(DetectedSound.Loud, onInputHigh)
        input.onSound(DetectedSound.Quiet, onInputLow)
        mode = USE_SOUND
        resetMorse()
        basic.showLeds(`
        # . # . #
        . . # . #
        # # . . #
        . . . # .
        # # # . .
        `)
    } else {
        //  mode must be USE_SOUND
        //  stop monitoring sounds
        input.onSound(DetectedSound.Loud, doNothing)
        input.onSound(DetectedSound.Quiet, doNothing)
        //  start monitoring button B instead
        control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_DOWN, onInputHigh)
        control.onEvent(EventBusSource.MICROBIT_ID_BUTTON_B, EventBusValue.MICROBIT_BUTTON_EVT_UP, onInputLow)
        mode = USE_BUTTON
        resetMorse()
        basic.showArrow(ArrowNames.East)
    }
    
    basic.pause(2000)
    basic.clearScreen()
}

//  MAIN PROGRAM LOOP...
//  VALUES TO BE TUNED FOR BEST PERFORMANCE
let DOT_MIN = 20
let DASH_MIN = 250
let LETTER_GAP = 500
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
let bleeping = false
let newBleep = false
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
//  ... immediately changed to USE_BUTTON:
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
    }
    
    //  ...as shown by global letter
    basic.pause(20)
})
