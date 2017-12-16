'use strict';

var startBtn = document.getElementById('start');
var defaultWorkMins = 10;
var theCountdown = CountdownTimer();
theCountdown.dispFunc(updateDisplay);
updateDisplay(defaultWorkMins);

startBtn.addEventListener("click", ()=> {
    // set minutes, inside listener so minutes can be changed
    theCountdown.minutes(10); // TODO will be replaced with a variable
    // set function to call after timer is up
    theCountdown.cdFunc(function() { 
            return sendBackgroundMsg('unblock');
        });
   
    sendBackgroundMsg('block'); // TODO replace string with variable once alternating is solved
    theCountdown.start();
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
function updateDisplay(updatedMins) {
    var timerDisplay = document.getElementById('timer-display');

    timerDisplay.textContent = updatedMins;
}

/**********************************************************************
* CountdownTimer
* Description: Module representing a timer which counts down. 
* Interface: .minutes = sets minutes
* Parameters: 
* Returns: 
***********************************************************************/
function CountdownTimer() {
    const ONE_MIN = 60000;
    var countdownMins = 0; // how many minutes to countdown from
    var timeoutIds = [];   // stores timeoutIDs to be cancelled if paused
    var countdownFunc = null;
    var displayFunc = null;

    /**********************************************************************
    * setMins
    * Description: Sets minutes to be counted down from
    * Parameters: mins = number of minutes to set
    * Returns: None
    ***********************************************************************/
    function setMins(mins) {
        countdownMins = mins;
    }

    /**********************************************************************
    * setCountdownFunc
    * Description: Sets a function to be called at the end of the 
    *               countdown. Optional.
    * Parameters:  theFunc = the function to be called at end of countdown
    * Returns: None
    ***********************************************************************/
    function setCountdownFunc(theFunc) {
        countdownFunc = theFunc;
    }

    /**********************************************************************
    * setDisplayFunc
    * Description: Sets a function to be called with the intent of updating
    *               a display as the countdown progresses
    * Parameters: dFunc = the function provided to the timer 
    * Returns: None 
    ***********************************************************************/
    function setDisplayFunc(dFunc) {
        displayFunc = dFunc;
    }
    
    /**********************************************************************
    * startTimer
    * Description: Starts timer countdown. 
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function startTimer() {
        var locCountdownMins = countdownMins;
        var totalDelay = (locCountdownMins * 1000 + 1000);

        // recursively calls setTimeout for each minute to countdown from
        // needed to be recursive because loops don't wait for setTimeout
        // stores timeoutIDs in array
        (function oneMinAction(minsRemaining) {
            if (minsRemaining != 0) {
                timeoutIds.push(
                    window.setTimeout(()=> {
                        minsRemaining--;

                        if (displayFunc != null) {
                            displayFunc(minsRemaining);
                        }

                        console.log(minsRemaining); // test
                        oneMinAction(minsRemaining);
                    }, 1000)
                );
            }
        })(locCountdownMins);
        // call function at end of countdown if it exists
        window.setTimeout(()=> {
            if (countdownFunc != null) {
                countdownFunc();
            }
        }, totalDelay);
    }


    var publicAPI = {
        minutes: setMins,
        start: startTimer,
        cdFunc: setCountdownFunc,
        dispFunc: setDisplayFunc
    };

    return publicAPI;
}
