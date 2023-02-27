let LOUD = 200
let QUIET = 100
let DOTMIN = 100
let DASHMIN = 300
let LETTERGAP = 800
let isBusy = false
let isLoud = false
let mark = 0
let gap = 0
let goLoud = 0
let goQuiet = input.runningTime()
function listen() {
    
    if (isBusy) {
        //  building a letter 
        if (isLoud) {
            if (input.soundLevel() < QUIET) {
                isLoud = false
                goQuiet = input.runningTime()
                mark = goQuiet - goLoud
            }
            
        } else if (input.soundLevel() > LOUD) {
            isLoud = true
            goLoud = input.runningTime()
            gap = goLoud - goQuiet
        }
        
    } else if (input.soundLevel() > LOUD) {
        isLoud = true
        goLoud = input.runningTime()
        isBusy = true
    }
    
}

function checkMorse() {
    
}

basic.forever(function on_forever() {
    listen()
})
