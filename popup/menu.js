'use strict';

var startBtn = document.getElementById('start');
var theCountdown = CountdownTimer();

// TODO check that multiple presses of this message does not reset timer
// prob check this on the background script
startBtn.addEventListener("click", ()=> {
    console.log("i've been clicked");
    theCountdown.minutes(10); // TODO will be replaced with a variable

    sendBackgroundMsg('work'); // TODO replace string with variable once alternating is solved
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
    browser.runtime.sendMessage({timer: blockOrUnblock});
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
    * startTimer
    * Description: Starts timer countdown. 
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function startTimer() {
        var locCountdownMins = countdownMins;

        // recursively calls setTimeout for each minute to countdown from
        // needed to be recursive because loops don't wait for setTimeout
        // stores timeoutIDs in array
        (function oneMinAction(minsRemaining) {
            if (minsRemaining != 0) {
                console.log(timeoutIds); // test
                timeoutIds.push(
                    window.setTimeout(()=> {
                        minsRemaining--;
                        // TODO call update display here
                        console.log(minsRemaining); // test
                        oneMinAction(minsRemaining);
                    }, 1000)
                );
            }
        })(locCountdownMins);
    }

    var publicAPI = {
        minutes: setMins,
        start: startTimer
    };

    return publicAPI;
}
