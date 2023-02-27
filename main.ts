let MORSE_TREE = "?ETIANMSURWDKGOHVF?L?PJBXCYZQ??54?3???2???????16???????7???8?91"
let morseIndex = 0
let command = "?"
let LOUD = 200
let QUIET = 100
let DOT_MIN = 20
let DASH_MIN = 300
let LETTER_GAP = 600
let isLoud = false
let mark = 0
let gap = 0
let goLoud = 0
let goQuiet = input.runningTime()
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
        //  (button down)
        if (!input.buttonIsPressed(Button.A)) {
            isLoud = false
            //  button just released
            goQuiet = input.runningTime()
            mark = goQuiet - goLoud
        }
        
    } else {
        //  else simulated "beep" lengthens
        //  (button up)
        if (input.buttonIsPressed(Button.A)) {
            isLoud = true
            //  new press ends the gap
            goLoud = input.runningTime()
        }
        
        gap = input.runningTime() - goQuiet
    }
    
}

//  lengthen gap
function checkMorse() {
    
    if (mark > 0) {
        //  (just finished a beep)      
        if (mark > DASH_MIN) {
            morseIndex += morseIndex + 1
        } else if (mark > DOT_MIN) {
            //  basic.show_icon(IconNames.YES)
            morseIndex += morseIndex
        }
        
        //  basic.show_icon(IconNames.NO)
        //  else:
        //  basic.show_icon(IconNames.SQUARE) 
        if (morseIndex > 63) {
            morseIndex = 0
        }
        
        //  ignore any six-beep attempt!
        mark = 0
    } else if (gap > LETTER_GAP) {
        //  mark now dealt with
        command = MORSE_TREE[morseIndex]
        morseIndex = 0
    }
    
}

function obey_command() {
    
    for (let i = 0; i < 3; i++) {
        basic.showString(command)
        basic.pause(100)
        basic.clearScreen()
        basic.pause(100)
    }
    command = "?"
}

//  basic.pause(10)
basic.forever(function on_forever() {
    
    // listen()
    monitor_button()
    checkMorse()
    if (command == "?") {
        
    } else {
        obey_command()
    }
    
})
