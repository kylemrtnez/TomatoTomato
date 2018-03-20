'use strict';

var startBtn = document.getElementById('start');
var stopBtn = document.getElementById('stop');
var settingsBtn = document.getElementById('settings');

// message listener
browser.runtime.onMessage.addListener(function (message) {
    console.log('received msg. updating display')
    updateDisplay(message.timeLeft || 0);
    updateBackground(message.cycWorking);
    updateCycleCount(message.cycCount);
})

updatePopup();

function updatePopup() {
    console.log('update popup')
    var intervalID = window.setInterval(()=> {
        console.log('requesting update')
        sendBackgroundMsg('requestUpdate')
    },1000)
    //sendBackgroundMsg('requestUpdate');
}

// update minutes when menu is opened
sendBackgroundMsg('requestUpdate');

// start button
startBtn.addEventListener("click", ()=> {
    sendBackgroundMsg('block'); // TODO replace string with variable once alternating is solved
    stopBtn.style.display = 'block';
    startBtn.style.display = 'none';
})

// stop button
stopBtn.addEventListener("click", ()=> {
    sendBackgroundMsg('unblock');
    stopBtn.style.display = 'none';
    startBtn.style.display = 'block';
})

// Open options extension options page when settings button is clicked
settingsBtn.addEventListener("click", ()=> {
    var opening = browser.runtime.openOptionsPage();
})

/**********************************************************************
* sendBackgroundMsg
* Description: Sends a message to the background script telling it
                whether to listen/block web requests or not.
* Parameters: blockOrUnblock = a string saying "block" or "unblock" 
* Returns: None
***********************************************************************/
function sendBackgroundMsg(blockOrUnblock) {
    browser.runtime.sendMessage({action: blockOrUnblock});
}

/**********************************************************************
* updateDisplay
* Description: Updates timer display with minutes remaining in menu
* Parameters: updatedMins = integer to change display 
* Returns: 
***********************************************************************/
function updateDisplay(timeLeft) {
    var timerDisplay = document.getElementById('timer-display');

    var minsLeft = Math.floor(timeLeft / 60);
    var secsLeft = Math.floor(timeLeft - minsLeft*60);

    // Display time left in MM:SS
    timerDisplay.textContent = leftPad(minsLeft,2) + ":" + leftPad(secsLeft,2);

    // Pad minutes / seconds so that always show at least two digits
    function leftPad(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }

    // Choose what button to display
    if (minsLeft == 0 && secsLeft == 0) { 
        stopBtn.style.display = 'none';
        startBtn.style.display = 'block';
    } else {
        stopBtn.style.display = 'block';
        startBtn.style.display = 'none';
    }
}

function updateBackground(working) {

    var background = document.getElementById('background');
    var restColor = '#c3e9ff';
    var workColor = '#ffefbb';

    if (working) {
        background.style.backgroundColor = workColor;
    }
    else {
        background.style.backgroundColor = restColor;
    }

}

function updateCycleCount(count) {
    var cycleHtml = document.getElementById('cycle-count');
    cycleHtml.textContent = "Cycle: " + count;
}

