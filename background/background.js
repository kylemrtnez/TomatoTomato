'use strict';

var webExtWrapper = BrowserWrapper();

// Set up default options if necessary
setUpDefaultPrefs();

function setUpDefaultPrefs() {
    webExtWrapper.localStorage.get(['blockPattern'], setDefaultPrefsIfNeeded);
}

function setDefaultPrefsIfNeeded(prefsObj) {
    if (needDefaultPrefs(prefsObj.blockPattern)) {
        webExtWrapper.localStorage.set(createDefaultsObj());
    } 

    function needDefaultPrefs(pref) {
        return pref == null ? true : false;
    }

    function createDefaultsObj() {
        let defaultSitesBlocked = ['*://www.reddit.com/*','*://www.facebook.com/*'];
        let defaultWorkMins = minsToSeconds(25);
        let defaultRestMins = minsToSeconds(5);
        let defaultLongRestMins = minsToSeconds(25);

        return { blockPattern:   {userValue: null, defaultValue: defaultSitesBlocked},
                workLength:     {userValue: null, defaultValue: defaultWorkMins},
                restLength:     {userValue: null, defaultValue: defaultRestMins},
                longRestLength: {userValue: null, defaultValue: defaultLongRestMins}
            };
    }
}



var original = BgReceiver();
// Listener for message from popup. 
webExtWrapper.addMsgListener(original.decipher);
// chrome.runtime.onMessage.addListener(original.decipher);






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

                if (!webExtWrapper.reqListener.exists(redirect)) {
                    // Get the stored block patterns and work session length and start blocking
                    chrome.storage.local.get(["blockPattern", "workLength"], (item) => {
                        // Block the pages
                        blockPages( item.blockPattern.userValue || item.blockPattern.defaultValue );
                        
                        // Create a countdown timer and start it
                        myCountdown = createTimer(item.workLength.userValue || item.workLength.defaultValue);
                        myCountdown.start();

                        // Inform menu immediately of changes
                        sendMenuMsg(myCountdown.getTime(), cycleTracker.cycleNum(), cycleTracker.isWorking());
                    }); // TODO: Stop timer if there's an error. Would the timer have started if we reach this error callback?
                }
                break;

            case 'unblock':
                // Stop the countdown, reset the cycle count, unblock the pages, and send an update to menu
                myCountdown.stop();
                myCountdown = null;
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
        webExtWrapper.reqListener.add(
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
        return {redirectUrl: chrome.extension.getURL("redirect/blocked.html")};
    }

    /**********************************************************************
    * unblockPages
    * Description: Removes listener from web requests
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function unblockPages() {
        webExtWrapper.reqListener.remove(redirect);
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
                var notificationMessage = "Congrats on the hard work! Take a long break.";

                chrome.storage.local.get("longRestLength",(item) => {
                    unblockPages();
                    myCountdown = createTimer(item.longRestLength.userValue || item.longRestLength.defaultValue); 
                    myCountdown.start();
                });
 
            } else {
                var notificationMessage = "Congrats on the hard work! Take a short break.";

                chrome.storage.local.get("restLength", (item) => {
                    unblockPages();
                    myCountdown = createTimer(item.restLength.userValue || item.restLength.defaultValue); 
                    myCountdown.start();
                });
            }
        } else {
            var notificationMessage = "Time to get to work!";

            // switching to working cycle
            cycleTracker.toggle();

            chrome.storage.local.get(["blockPattern", "workLength"], (item) => {
                blockPages( item.blockPattern.userValue || item.blockPattern.defaultValue );
                myCountdown = createTimer(item.workLength.userValue || item.workLength.defaultValue);
                myCountdown.start();
            });
        }
        chrome.storage.local.get("popups", (item)=> {
            //console.log(item.popups);
            if (item.popups) {
                sendNotification(notificationMessage);
            }
        });
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

        return theCountdown;
    }
    

    var publicAPI = {
        decipher: decode
    };

    return publicAPI;
}


