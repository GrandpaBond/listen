LOUD=200
QUIET=100
DOTMIN=100
DASHMIN=300
LETTERGAP=800
isBusy=False
isLoud=False
mark=0
gap=0
goLoud=0
goQuiet=input.running_time()

def listen():
    global isBusy,isLoud,goLoud,goQuiet,mark,gap 
    if isBusy: # building a letter 
        if isLoud:
            if input.sound_level()<QUIET:
                isLoud=False
                goQuiet=input.running_time()
                mark=goQuiet-goLoud
            # else beep lengthens
        else:
            if input.sound_level()>LOUD:
                isLoud=True
                goLoud=input.running_time()
                gap=goLoud-goQuiet
            # else gap lengthens
    else: # between letters: wait for another 
        if input.sound_level()>LOUD:
            isLoud=True
            goLoud=input.running_time()
            isBusy=True 

def checkMorse(): 
    pass 





def on_forever():
    listen()
    
basic.forever(on_forever)
