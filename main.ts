//  MORSE DE-CODER
//  Morse Code uses a pattern of "bleeps" (Dots or Dashes) for each letter.
//  This project does four things in turn:
//  a) it times our inputs to recognise Dots, Dashes or Gaps
//    (A Gap is a longer delay, marking the end of a letter)
//  b) on the 5 rows of LEDs it displays the morse-code we are building
//  c) it uses the Morse-Tree to decode it, bleep-by-bleep
//  d) it after a Gap, shows the decoded letter on the display.
//  Button_A is used to cycle through three "bleep" input modes:
//    [Button_B presses  - Light Flashes  -  Noise Levels ]
//  For the last two, we need to detect significant changes in level
//     rather than responding to every variation.
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
let MORSE_TREE = "@?ETIANMSURWDKGOHVF?L?PJBXCYZQ??54?3???2???????16???????7???8?90"
let morseIndex = 1
let command = "*"
let LOUD = 50
let QUIET = 30
let DOT_MIN = 30
let DASH_MIN = 300
let LETTER_GAP = 800
let BUTTON_TRIGGER = 90
let LIGHT_TRIGGER = 40
let SOUND_TRIGGER = 20
let bleeps = -1
let bleepStart = 0
let gapStart = input.runningTime()
bleepStart = gapStart + 1
let mode = 0
// (button)
let old = 0
let older = 0
let oldest = 0
let newBleep = false
command = "*"
let newCommand = false
function changeOf(new_: number): number {
    //  compares last two readings with the two before them
    //  (we use pairs to smooth out readings)
    
    //  (only need to mention any globals we're going to overwrite)
    let change = new_ + old - older - oldest
    oldest = older
    older = old
    old = new_
    return change
}

function checkInputs() {
    let change: number;
    let big: number;
    //  get the next input (depending on current mode)
    
    if (mode == 2) {
        //  using sound inputs
        change = changeOf(input.soundLevel())
        big = SOUND_TRIGGER
    } else if (mode == 1) {
        //  using light inputs
        change = changeOf(input.lightLevel())
        big = LIGHT_TRIGGER
    } else {
        //  using button inputs
        if (input.buttonIsPressed(Button.B)) {
            change = changeOf(100)
        } else {
            //  it can only ever be 100% pressed...
            change = changeOf(0)
        }
        
        //  ...or not at all!
        big = BUTTON_TRIGGER
    }
    
    //  new bleep or new completed letter?
    if (change > big) {
        //  a significant positive change means we're into a new bleep
        bleepStart = input.runningTime()
    }
    
    if (change < -big) {
        //  a significant negative change means we're into a new gap
        gapStart = input.runningTime()
    }
    
    //  compare timings...
    let length = gapStart - bleepStart
    //  negative length means we're in a bleep so just wait
    if (length > 0) {
        //  positive length means we're into a gap
        updateMorse(length)
        //  now check for letter-end timeout
        if (input.runningTime() - gapStart > LETTER_GAP) {
            showLetter()
        }
        
    }
    
}

function showLetter() {
    let morseIndex: number;
    let bleeps: number;
    
    if (bleeps >= 0) {
        //  assuming we have at least one bleep!
        command = MORSE_TREE[morseIndex]
        morseIndex = 1
        bleeps = -1
        pause(500)
        //  allow time to show last bleep
        basic.clearScreen()
    }
    
}

function updateMorse(length: number) {
    //  show the new Dot or Dash and update the morse-tree Index
    
    if (length > DOT_MIN) {
        //  ignore really short bleeps
        bleeps += 1
        if (bleeps == 5) {
            //  ignore any six-bleep attempt!
            morseIndex = 0
            basic.clearScreen()
            bleeps = -1
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

function obey_command(todo: string) {
    //  For now, just show the letter
    basic.showString(todo)
    basic.pause(500)
    basic.clearScreen()
}

input.onButtonPressed(Button.A, function on_button_pressed_a() {
    //  switch input modes
    
    if (mode == 0) {
        mode = 1
        //  change to light
        basic.showLeds(`
        # . # . #
        . # # # .
        # # . # #
        . # # # .
        # . # . #
        `)
    } else if (mode == 1) {
        mode = 2
        //  change to sound
        basic.showLeds(`
        # . # . #
        . . # . #
        # # . . #
        . . . # .
        # # # . .
        `)
    } else {
        mode = 0
        //  change to button
        basic.showLeds(`
        . . . . .
        . # # # .
        . # # # .
        # # # # #
        . . . . .
        `)
    }
    
    basic.pause(3000)
})
basic.forever(function on_forever() {
    
    checkInputs()
    if (newCommand) {
        obey_command(command)
        newCommand = false
    }
    
    basic.pause(10)
})
