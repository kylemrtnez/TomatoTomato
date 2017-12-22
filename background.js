'use strict';

const patternDefault = ["*://www.reddit.com/*", "*://www.facebook.com/*"];
const workLengthDefault = 25;
var restLengthDefault = 5;
var longRestLengthDefault = 25;

var original = BgReceiver();
// Listener for message from popup. 
browser.runtime.onMessage.addListener(original.decipher);

function onError(error) {
    console.log(`Error: ${error}`);
}

/**********************************************************************
* sendMenuMsg
* Description: Sends a message to the popup menu telling it
                whether to listen/block web requests or not.
* Parameters: minutes = number to display in popup menu
* Returns: None
***********************************************************************/
function sendMenuMsg(minutes) {
    browser.runtime.sendMessage({uMinutes: minutes});
}

/**********************************************************************
* Description: Sets up a listener for web requests and redirects sites on
*               list to blocked html page. 
* Parameters: None 
* Returns: None 
***********************************************************************/
function BgReceiver() {
    var myCountdown = null;
    var cycleTracker = CycleManager();

    /**********************************************************************
    * decode
    * Description: Checks what message is received and routes to correct
    *               action
    * Parameters: The message object from onMessage listener
    * Returns: None
    ***********************************************************************/
    function decode(message) {
        switch (message.action) {
            case 'block':
                cycleTracker.toggle();

                if (!browser.webRequest.onBeforeRequest.hasListener(redirect)) {
                    // Get the stored block patterns and work session length and start blocking
                    browser.storage.local.get(["blockPattern", "workLength"]).then( (item) => {
                        blockPages( item.blockPattern || patternDefault );
                        myCountdown = createTimer(item.workLength || workLengthDefault);
                        myCountdown.start();
                    },onError); // TODO: Stop timer if there's an error. Would the timer have started if we reach this error callback?
                }
                break;

            case 'unblock':
                myCountdown.stop();
                unblockPages();
                break;
        
            case 'requestCurTimeRemaining':
                if (myCountdown == null) {
                    sendMenuMsg(null);
                } 
                else {
                    sendMenuMsg(myCountdown.getCdMins());
                }
                break;

            default:

                break;
        }
    }

    /**********************************************************************
    * blockPages
    * Description: Sets up a listener for web requests and redirects sites
    *               on list to an extension html page.
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function blockPages(pattern) {
        console.log(pattern);

        browser.webRequest.onBeforeRequest.addListener(
            redirect,
            {urls: pattern}, 
            ["blocking"]
        );
    }

    /**********************************************************************
    * Description: Provides new URL to redirect requests to
    * Parameters: Request details object
    * Returns: Object with new URL
    ***********************************************************************/
    function redirect(reqDetails) {
        return {redirectUrl: browser.extension.getURL("redirect/blocked.html")};
    }

    /**********************************************************************
    * unblockPages
    * Description: Removes listener from web requests
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function unblockPages() {
        browser.webRequest.onBeforeRequest.removeListener(redirect);
    }

    /**********************************************************************
    * endOfTimer 
    * Description: This function is provided to the Countdown Timer to be 
    *               run at the conclusion of the countdown. It figures out
    *               what the next Pomodoro cycle needs to be and starts
    *               a new countdown.
    * Parameters: None 
    * Returns: None 
    ***********************************************************************/
    function endOfTimer() {
        // check if on break, if not, start break timer and flip onBreak
        if (cycleTracker.isWorking()) {
            // switching to break cycle
            cycleTracker.toggle();
            // if long break, get long break minutes            
            if (cycleTracker.isLongBreak()) {
                console.log('long break reached');
                browser.storage.local.get("longRestLength").then( (item) => {
                    unblockPages();
                    myCountdown = createTimer(item.longRestLength || longRestLengthDefault); 
                    myCountdown.start();
                },onError);
 
            } else {
                browser.storage.local.get("restLength").then( (item) => {
                    unblockPages();
                    myCountdown = createTimer(item.restLength || restLengthDefault); 
                    myCountdown.start();
                },onError);
            }
        } else {
            // switching to working cycle
            cycleTracker.toggle();
            browser.storage.local.get(["blockPattern", "workLength"]).then( (item) => {
                blockPages( item.blockPattern || patternDefault );
                myCountdown = createTimer(item.workLength || workLengthDefault);
                myCountdown.start();
            },onError);
        }

    }
    

    /**********************************************************************
    * createTimer
    * Description: Creates a countdown timer
    * Parameters: length
    * Returns: A countdown timer object 
    ***********************************************************************/
    function createTimer(length) {
        var theCountdown = CountdownTimer();
        theCountdown.minutes(length);     
        theCountdown.cdFunc(endOfTimer);
        theCountdown.dispFunc(sendMenuMsg);

        return theCountdown;
    }
    

    var publicAPI = {
        decipher: decode
    };

    return publicAPI;
}

/**********************************************************************
* CountdownTimer
* Description: Module representing a timer which counts down. 
* Interface: .minutes = sets minutes
*            .start = starts countdown
*            .cdFunc = assigns a function to be called when countdown
*                       ends
*            .dispFunc = assigns a function to be called at each tick
*                         of the countdown
* Parameters: None 
* Returns: Public interface to interact with CountdownTimer object 
***********************************************************************/
function CountdownTimer() {
    const MINUTES = 60000;
    var countdownMins = null; // how many minutes to countdown from
    var timeoutIds = [];   // stores timeoutIDs to be cancelled if paused
    var countdownFunc = null;
    var displayFunc = null;
    var intervalID = null;

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
    * getMins
    * Description: Gets minutes on the countdown
    * Parameters: None
    * Returns: countdownMins
    ***********************************************************************/
    function getMins() {
        return countdownMins;
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
        var locCountdownMins = countdownMins || 0;
        var totalDelay = (locCountdownMins * 1000 + 1000);

        // timer
        if (displayFunc != null) {
            displayFunc(locCountdownMins);
        }
        intervalID = window.setInterval(()=> {
            locCountdownMins--;

            setMins(locCountdownMins);

            if (displayFunc != null) {
                displayFunc(locCountdownMins);
            }

            if (locCountdownMins == 0) {
                stopTimer();

                if (countdownFunc != null) {
                    countdownFunc();
                }   
            }
        }, 1000);
    }

    /**********************************************************************
    * stopTimer
    * Description: Stops the timer if there is one currently running
    * Parameters: None
    * Returns: None 
    ***********************************************************************/
    function stopTimer() {
        displayFunc(null);
        if (intervalID) {
            window.clearInterval(intervalID);
            setMins(null);
        }
    }

    var publicAPI = {
        minutes: setMins,
        start: startTimer,
        stop: stopTimer,
        cdFunc: setCountdownFunc,
        dispFunc: setDisplayFunc,
        getCdMins: getMins
    };

    return publicAPI;
}

/**********************************************************************
* CycleManager
* Description: A module which tracks Pomodoro cycles and can return the
*               current cycle. Handles logic for switching the cycles.
***********************************************************************/
function CycleManager() {
    var working = false;
    var cycleCount = 0;
    var longBreakFlag = false;
    var longBreakEvery = 4;

    /**********************************************************************
    * Public Interface
    * Description: toggle: toggles between work/break cycles
    *              reset:  resets cycleCount, effectively restarting the 
    *                       pomodoro cycle
    *              isWorking: returns true if cycle is a work cycle, false
    *                           if break cycle
    *              isLongBreak: returns true if break cycle should be a 
    *                            long break
    *              cycleNum: returns the current cycle number
    ***********************************************************************/
    var publicAPI = {
        toggle: toggleCycle,
        reset: resetCycle,
        isWorking: getWorkCycle,
        isLongBreak: getLongBreak,
        cycleNum: getCycleNum
    }


    /**********************************************************************
    * toggleCycle
    * Description: Toggles 'working' variable depending on its' current
    *               value. Also checks if we are on a long break each
    *               break cycle.
    * Parameters: None 
    * Returns: None 
    ***********************************************************************/
    function toggleCycle() {
        if (working) {
            working = false;
            checkLongBreak(longBreakEvery);
        } else {
            working = true;
            incCycleCount();
        }
    }

    /**********************************************************************
    * checkLongBreak
    * Description: Sets the longBreakFlag if on a long break cycle.
    * Parameters: lbNum = a number representing how often to have a long break
    *                      ex. checkLongBreak(4) means every 4th break is long 
    * Returns: None 
    ***********************************************************************/
    function checkLongBreak(lbNum) {
        if ((getCycleNum() % lbNum) == 0) {
            longBreakFlag = true;
        } else {
            longBreakFlag = false;
        }
    }

    /**********************************************************************
    * incCycleCount
    * Description: Increments cycleCount
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function incCycleCount() {
        cycleCount++;
    }

    /**********************************************************************
    * resetCycle
    * Description: Resets cycle count back to 0, effectively restarting the
    *               Pomodoro cycle.
    * Parameters: None 
    * Returns: None 
    ***********************************************************************/
    function resetCycle() {
        cycleCount = 0;
    }
    
    /**********************************************************************
    * getCycleNum
    * Description: Reports what cycle number we are on
    * Parameters: None
    * Returns: cycleCount member variable 
    ***********************************************************************/
    function getCycleNum() {
        return cycleCount;
    }

    /**********************************************************************
    * getWorkCycle
    * Description: Returns true/false depending on the current cycle
    * Parameters: None 
    * Returns: True if current cycle is a work cycle, false if break cycle
    ***********************************************************************/
    function getWorkCycle() {
        return working;
    }

    /**********************************************************************
    * getLongBreak
    * Description: Returns the status of the longBreakFlag member variable
    * Parameters: None 
    * Returns: True if long break, false if regular break 
    ***********************************************************************/
    function getLongBreak() {
        return longBreakFlag;
    } 

    return publicAPI;
}

