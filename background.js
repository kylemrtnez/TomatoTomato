'use strict';

const SECONDS = 1000;
const MINUTES = 60*SECONDS;

// Set up default options if necessary
var checkingStoredSettings = browser.storage.local.get();
checkingStoredSettings.then((loadedSettings)=> { 
    if( loadedSettings.blockPattern == null ) {
        browser.storage.local.set({
            blockPattern:   {userValue: null, defaultValue: ["*://www.reddit.com/*", "*://www.facebook.com/*"]},
            workLength:     {userValue: null, defaultValue: 25*MINUTES/SECONDS},
            restLength:     {userValue: null, defaultValue: 5*MINUTES/SECONDS},
            longRestLength: {userValue: null, defaultValue: 25*MINUTES/SECONDS},
        });  
    }
});

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
* Parameters: seconds = sends time left to menu.js
* Returns: None
***********************************************************************/
function sendMenuMsg(seconds, count, workingFlag) {
    var contents = {
        timeLeft: seconds,
        cycCount: count,
        cycWorking: workingFlag
    };

    browser.runtime.sendMessage(contents);
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
                        blockPages( item.blockPattern.userValue || item.blockPattern.defaultValue );
                        myCountdown = createTimer(item.workLength.userValue || item.workLength.defaultValue);
                        myCountdown.start();
                    },onError); // TODO: Stop timer if there's an error. Would the timer have started if we reach this error callback?
                }
                break;

            case 'unblock':
                myCountdown.stop();
                cycleTracker.reset();
                unblockPages();
                sendMenuMsg(null, cycleTracker.cycleNum(), cycleTracker.isWorking());
                break;
        
            case 'requestUpdate':
                if (myCountdown == null) {
                    sendMenuMsg(null, cycleTracker.cycleNum(), cycleTracker.isWorking());
                } 
                else {
                    sendMenuMsg(myCountdown.getTime(), cycleTracker.cycleNum(), cycleTracker.isWorking());
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
            // if long break, get long break seconds            
            if (cycleTracker.isLongBreak()) {
                console.log('long break reached');
                browser.storage.local.get("longRestLength").then( (item) => {
                    unblockPages();
                    myCountdown = createTimer(item.longRestLength.userValue || item.longRestLength.defaultValue); 
                    myCountdown.start();
                },onError);
 
            } else {
                browser.storage.local.get("restLength").then( (item) => {
                    unblockPages();
                    myCountdown = createTimer(item.restLength.userValue || item.restLength.defaultValue); 
                    myCountdown.start();
                },onError);
            }
        } else {
            // switching to working cycle
            cycleTracker.toggle();
            browser.storage.local.get(["blockPattern", "workLength"]).then( (item) => {
                blockPages( item.blockPattern.userValue || item.blockPattern.defaultValue );
                myCountdown = createTimer(item.workLength.userValue || item.workLength.defaultValue);
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
        theCountdown.setTimer(length);     
        theCountdown.cdFunc(endOfTimer);
        theCountdown.dispFunc(function(timeRemaining) {
            sendMenuMsg(timeRemaining, cycleTracker.cycleNum(), cycleTracker.isWorking());
        });

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
* Interface: .setTimer = sets timer length in seconds
*            .start = starts countdown
*            .cdFunc = assigns a function to be called when countdown
*                       ends
*            .dispFunc = assigns a function to be called at each tick
*                         of the countdown
* Parameters: None 
* Returns: Public interface to interact with CountdownTimer object 
***********************************************************************/
function CountdownTimer() {
    var countdownLength = null; // length of timer in seconds
    var timeoutIds = [];   // stores timeoutIDs to be cancelled if paused
    var countdownFunc = null;
    var displayFunc = null;
    var intervalID = null;

    /**********************************************************************
    * setTimer
    * Description: Sets length of timer
    * Parameters: timeLength = length of time in seconds to set
    * Returns: None
    ***********************************************************************/
    function setTimer(timeLength) {
        countdownLength = timeLength;
    }

    /**********************************************************************
    * getTime
    * Description: Gets time left on the countdown
    * Parameters: None
    * Returns: countdownLength (seconds)
    ***********************************************************************/
    function getTime() {
        return countdownLength;
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
        var timeLeft = countdownLength || 0;

        // timer
        if (displayFunc != null) {
            displayFunc(timeLeft);
        }
        intervalID = window.setInterval(()=> {
            timeLeft--;

            setTimer(timeLeft);

            if (displayFunc != null) {
                displayFunc(timeLeft);
            }

            if (timeLeft <= 0) {
                stopTimer();

                if (countdownFunc != null) {
                    countdownFunc();
                }   
            }
        }, 1*SECONDS);
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
            setTimer(null);
        }
    }

    var publicAPI = {
        setTimer: setTimer,
        start: startTimer,
        stop: stopTimer,
        cdFunc: setCountdownFunc,
        dispFunc: setDisplayFunc,
        getTime: getTime
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
        if ((cycleCount % lbNum) == 0) {
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
        working = false;
    }
    
    /**********************************************************************
    * getCycleNum
    * Description: Reports what cycle number we are on
    * Parameters: None
    * Returns: cycleCount member variable 
    ***********************************************************************/
    function getCycleNum() {
        var modifiedCount = cycleCount % 4;

        if (cycleCount < 5) {
            return cycleCount;
        }
        else if (modifiedCount == 0) {
            return 4;
        }
        else {
            return modifiedCount;
        }
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

