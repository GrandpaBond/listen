let MORSE_TREE = "@?ETIANMSURWDKGOHVF?L?PJBXCYZQ??54?3???2???????16???????7???8?90"
let morseIndex = 1
let command = "*"
let LOUD = 50
let QUIET = 30
let DOT_MIN = 30
let DASH_MIN = 300
let LETTER_GAP = 800
let isLoud = false
let mark = 0
let beeps = -1
let gap = 0
let goLoud = 0
let goQuiet = input.runningTime()
let mode = 0
// (button)
function listen() {
    
    if (isLoud) {
        //  (beeping)
        if (input.soundLevel() < QUIET) {
            isLoud = false
            //  beep just ended
            goQuiet = input.runningTime()
            mark = goQuiet - goLoud
        }
        
    } else {
        //  else beep lengthens
        //  (not beeping)
        gap = input.runningTime() - goQuiet
        //  lengthen gap
        if (input.soundLevel() > LOUD) {
            isLoud = true
            //  new beep ends the gap
            goLoud = input.runningTime()
        }
        
    }
    
}

//  else gap lengthens
function monitor_button() {
    //  (same logic as listen(), but simulating sound with button_A)
    
    if (isLoud) {
        //  (button was down)
        if (!input.buttonIsPressed(Button.A)) {
            isLoud = false
            //  button just released
            goQuiet = input.runningTime()
            mark = goQuiet - goLoud
        }
        
    } else {
        //  else simulated "beep" lengthens
        //  (button was up)
        if (input.buttonIsPressed(Button.A)) {
            isLoud = true
            //  new press ends the gap
            goLoud = input.runningTime()
        }
        
        //  lengthen gap, even without new button press
        gap = input.runningTime() - goQuiet
    }
    
}

function checkMorse() {
    
    if (mark > 0) {
        //  (just finished a beep)
        if (mark > DOT_MIN) {
            beeps += 1
            if (beeps == 5) {
                //  ignore any six-beep attempt!      
                morseIndex = 0
                basic.clearScreen()
                beeps = -1
            } else {
                morseIndex += morseIndex
                led.plot(0, beeps)
                if (mark > DASH_MIN) {
                    morseIndex += 1
                    led.plot(1, beeps)
                    led.plot(2, beeps)
                }
                
            }
            
        }
        
        mark = 0
    } else if (beeps >= 0 && gap > LETTER_GAP) {
        //  mark now dealt with (or too brief to count)
        command = MORSE_TREE[morseIndex]
        morseIndex = 1
        beeps = -1
        pause(500)
        //  allow time to show last beep
        basic.clearScreen()
    }
    
}

function obey_command(todo: string) {
    basic.showString(todo)
    basic.pause(500)
    basic.clearScreen()
}

input.onButtonPressed(Button.B, function on_button_pressed_b() {
    
    mode = 1 - mode
})
basic.forever(function on_forever() {
    
    if (mode == 0) {
        monitor_button()
    } else {
        listen()
    }
    
    checkMorse()
    if (command != "*") {
        obey_command(command)
        command = "*"
    }
    
    basic.pause(10)
})
