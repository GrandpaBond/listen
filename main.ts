//  MORSE DE-CODER
//  This project does four things in turn:
//  a) it times our inputs to recognise Dots, Dashes or Gaps
//    (A Gap is a longer delay, lengthing the end of a letter)
//  b) it shows the morse-code we are building on the 5 rows of LEDs
//  c) it uses the Morse-Tree to decode it, beep-by-beep
//  d) it after a Gap, shows the decoded letter on the display.
//  Button_A is used to cycle through three "beep" input modes:
//    [Button_B presses  - Light Flashes  -  Noise Levels ]
//  For the last two, we need to detect rises and falls in the average level
//  The Morse-Tree is a string of 63 characters.
//  We use an Index to count along it and select one.
//  At each stage, there are three possible inputs:
//     Dot, Dash, or Gap 
//  If it's a Gap, the current Index just selects the letter.
//    (But not all Dot-Dash patterns are valid Morse codes!)
//  Otherwise, we need room for two more possibilities...
//  We organise this by doubling the Index value for each "beep", 
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
let isHigh = false
//  the "beep" state
let length = 0
let beeps = -1
let gap = 0
let goHigh = 0
let goLow = input.runningTime()
let mode = 0
// (button)
let levels = [0, 0, 0, 0, 0, 0, 0, 0]
//  rolling average uses last 8 readings
let SLOTS = 8
let slot = 0
let levelSum = 0
function changeIn(new_: number): number {
    //  
    
    levelSum += new_ - levels[slot]
    levels[slot] = new_
    slot = (slot + 1) % SLOTS
    let average = []
    //  update rolling average
    return new_ - levelSum / SLOTS
}

function checkInput() {
    let new_: number;
    let change: number;
    let gap: number;
    
    if (mode == 0) {
        //  button inputs
        if (input.buttonIsPressed(Button.B)) {
            new_ = 100
        } else {
            //  it can only ever be 100% pressed...
            new_ = 0
        }
        
        //  or not at all!
        change = changeIn(new_)
    } else if (mode == 1) {
        //  light inputs
        change = changeIn(input.lightLevel())
    } else {
        //  sound inputs
        change = changeIn(input.soundLevel())
    }
    
    if (isHigh) {
        //  (beeping)
        if (input.soundLevel() < QUIET) {
            isHigh = false
            //  beep just ended
            goLow = input.runningTime()
            length = goLow - goHigh
        }
        
    } else {
        //  else beep lengthens
        //  (not beeping)
        gap = input.runningTime() - goLow
        //  lengthen gap
        if (input.soundLevel() > LOUD) {
            isHigh = true
            //  new beep ends the gap
            goHigh = input.runningTime()
        }
        
    }
    
}

//  else gap lengthens
function feel() {
    //  simply monitor Button_B                                                          
    return
}

function monitor_button() {
    //  (same logic as listen(), but simulating sound with button_A)
    
    if (isHigh) {
        //  (button was down)
        isHigh = false
        //  button just released
        goLow = input.runningTime()
        length = goLow - goHigh
    } else {
        //  else simulated "beep" lengthens
        //  (button was up)
        if (input.buttonIsPressed(Button.A)) {
            isHigh = true
            //  new press ends the gap
            goHigh = input.runningTime()
        }
        
        //  lengthen gap, even without new button press
        gap = input.runningTime() - goLow
    }
    
}

function checkMorse() {
    
    if (length > 0) {
        //  (just finished a beep)
        if (length > DOT_MIN) {
            beeps += 1
            if (beeps == 5) {
                //  ignore any six-beep attempt!      
                morseIndex = 0
                basic.clearScreen()
                beeps = -1
            } else {
                morseIndex += morseIndex
                led.plot(0, beeps)
                if (length > DASH_MIN) {
                    morseIndex += 1
                    led.plot(1, beeps)
                    led.plot(2, beeps)
                }
                
            }
            
        }
        
        length = 0
    } else if (beeps >= 0 && gap > LETTER_GAP) {
        //  length now dealt with (or too brief to count)
        command = MORSE_TREE[morseIndex]
        morseIndex = 1
        beeps = -1
        pause(500)
        //  allow time to show last beep
        basic.clearScreen()
    }
    
}

function obey_command(todo: string) {
    //  For now, just show the letter
    basic.showString(todo)
    basic.pause(500)
    basic.clearScreen()
}

//  MOD function gives 0,1,2,0,1,2,0...
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    //  switch input modes
    
    mode = (mode + 1) % 3
})
basic.forever(function on_forever() {
    
    checkInput()
    checkMorse()
    if (command != "*") {
        obey_command(command)
        command = "*"
    }
    
    basic.pause(10)
})
