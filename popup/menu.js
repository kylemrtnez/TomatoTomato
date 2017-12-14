'use strict';

var startBtn = document.getElementById('start');

// TODO check that multiple presses of this message does not reset timer
// prob check this on the background script
startBtn.addEventListener("click", workTimerMsg)

function workTimerMsg() {
    // TODO will need to check that a second press does not reset timer
    browser.runtime.sendMessage({timer: "work"});
}


/**********************************************************************
* Description: Sets up a listener for web requests and redirects sites on
*               list to blocked html page. 
* Parameters: None 
* Returns: None 
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

    publicAPI = {
        minutes: setMins,
        start: startTimer

    };

    return publicAPI;
}
