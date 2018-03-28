'use strict';

var startBtn        = document.getElementById('start');
var stopBtn         = document.getElementById('stop');
var settingsBtn     = document.getElementById('settings');
var timerDisplay    = document.getElementById('timer-display');

// Set up listener for updates from background
browser.runtime.onMessage.addListener(function (message) {
    updateDisplay(message.timeLeft || 0);
    updateBackground(message.cycWorking);
    updateCycle(message.cycCount, message.cycWorking);
})

// Start the popup update requests
updatePopup();

// Start button listener
startBtn.addEventListener("click", ()=> {
    sendBackgroundMsg('block'); // TODO replace string with variable once alternating is solved
    stopBtn.style.display = 'block';
    startBtn.style.display = 'none';
})

// Stop button listener
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
* updatePopup
* Description: Sets up an interval for requesting an update from background on
*              the timer. 100ms seems to be roughly required to prevent
*              user-detectable lag. TODO is this too much CPU usage?
* Parameters: None
* Returns: None
***********************************************************************/
function updatePopup() {
    var intervalID = window.setInterval(()=> {
        sendBackgroundMsg('requestUpdate');
    },100)
}

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
* Returns: None
***********************************************************************/
function updateDisplay(timeLeft) {
    // Calculate mins/secs
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

/**********************************************************************
* updateBackground
* Description: Updates background color to correspond with cycle type
* Parameters: isWorkCycle = boolean on if work status
* Returns: None
***********************************************************************/
function updateBackground(isWorkCycle) {

    var backgrounds = document.getElementsByClassName('background');
    var restColor = '#c3e9ff';
    var workColor = '#ffefbb';

    if (isWorkCycle) {
        for (var i = 0; i < backgrounds.length; i++) {
            backgrounds[i].style.backgroundColor = workColor;
        }
    }
    else {
        for (var i = 0; i < backgrounds.length; i++) {
            backgrounds[i].style.backgroundColor = restColor;
        }
    }

}

/**********************************************************************
* updateCycleCount
* Description: Updates cycle count in menu to number of cycles
* Parameters: count = int of number of cycles
* Returns: None
***********************************************************************/
function updateCycle(count, workCycle) {
    // if count is 0 then we haven't started a cycle
    if (count == 0) {
        resetCycle();
        return;
    } 

    var cycleType = 'rest';
    if (workCycle) {
        cycleType = 'work';
    }

    var selectionString = 'cycle-' + cycleType + ' cycle-' + count;
    var curCycle = document.getElementsByClassName(selectionString);
    resetCycle();
    formatCurrent(curCycle[0]);
    formatPrevious(count, cycleType);


    
    function formatCurrent(domEle) {
        var hiliteColor = '#FF932D';
        domEle.style.border = '2px solid ' + hiliteColor;
    }

    function formatPrevious(num, cycle) {
        var finishedColor = '#0B61FF';

        var restClass = 'cycle-rest';
        var restCycles = document.getElementsByClassName(restClass);
        var workClass = 'cycle-work';
        var workCycles = document.getElementsByClassName(workClass);

        for (var i = 1; i < num; i++) {
            var idx = i - 1;
            workCycles[idx].style.border = 'solid 2px ' + finishedColor;
            restCycles[idx].style.border = 'solid 2px ' + finishedColor;
        }
        if (cycle == 'rest') {
            workCycles[num - 1].style.border = 'solid 2px ' + finishedColor;
        }
 
    }


    function resetCycle() {
        var restClass = 'cycle-rest';
        var restCycles = document.getElementsByClassName(restClass);
        var workClass = 'cycle-work';
        var workCycles = document.getElementsByClassName(workClass);

        var noBackground = '#FFFFFF';

        for (var i = 0; i < restCycles.length; i++) {
            restCycles[i].style.border = 'none';
            restCycles[i].style.backgroundColor = noBackground; 
        }

        for (var i = 0; i < workCycles.length; i++) {
            workCycles[i].style.border = 'none';
            workCycles[i].style.backgroundColor = noBackground; 
        }

    }
}

