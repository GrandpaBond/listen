let MORSE_TREE = "?ETIANMSURWDKGOHVF?L?PJBXCYZQ??54?3???2???????16???????7???8?91"
let morseIndex = 0
let command = "*"
let LOUD = 200
let QUIET = 100
let DOT_MIN = 100
let DASH_MIN = 300
let LETTER_GAP = 800
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
        gap = input.runningTime() - goQuiet
        //  lengthen gap
        if (input.buttonIsPressed(Button.A)) {
            isLoud = true
            //  new press ends the gap
            goLoud = input.runningTime()
        }
        
    }
    
}

//  else gap lengthens
function checkMorse() {
    
    if (mark > 0) {
        //  (just finished a beep)
        if (mark > DOT_MIN) {
            morseIndex += morseIndex
        }
        
        if (mark > DASH_MIN) {
            morseIndex += 1
        }
        
        if (morseIndex > 63) {
            morseIndex = 0
        }
        
        //  ignore a six-beep letter!
        mark = 0
    } else if (gap > LETTER_GAP) {
        command = MORSE_TREE[morseIndex]
    }
    
}

function obey_command() {
    
    basic.showString(command)
    basic.pause(3000)
    command = "*"
}

basic.forever(function on_forever() {
    
    // listen()
    monitor_button()
    checkMorse()
    if (command == "*") {
        
    } else {
        obey_command()
    }
    
})
