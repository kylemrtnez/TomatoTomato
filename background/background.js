'use strict';

var webExtWrapper = BrowserWrapper();

// Set up default options if necessary
setUpDefaultPreferences();

var workingSession = WorkSessionManager();
// Listener for message from popup. 
webExtWrapper.addMsgListener(workingSession.route);

/**********************************************************************
* Description: Sets up a listener for web requests and redirects sites on
*               list to blocked html page. 
* Parameters: None 
* Returns: None 
***********************************************************************/
function WorkSessionManager() {
    var myCountdown = null;
    var cycleTracker = CycleManager();

    /**********************************************************************
    * decode
    * Description: Checks what message is received and routes to correct
    *               action
    * Parameters: The message object from onMessage listener
    * Returns: None
    ***********************************************************************/
    function routeMessage(message) {
        switch (message.action) {
            case 'block':
                cycleTracker.toggle();

                if (!webExtWrapper.reqListener.exists(redirect)) {
                    startWorkSession(myCountdown, cycleTracker);
                }
                break;

            case 'unblock':
                /* Stop the countdown, reset the cycle count, unblock the pages, 
                and send an update to menu */
                clearWorkSession(myCountdown, cycleTracker);
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

    function clearWorkSession(timer, cycleInfo) {
        timer.stop();
        timer = null;
        cycleInfo.reset();
        unblockPages();
        sendMenuMsg(null, cycleTracker.cycleNum(), cycleTracker.isWorking());
    }


    function startWorkSession(timer, cycleInfo) {
        webExtWrapper.localStorage.get(["blockPattern", "workLength"], (item) => {
            blockPages(selectPreferenceValue(item.blockPattern));
                    
            myCountdown = createTimer(selectPreferenceValue(item.workLength));
            myCountdown.start();

            // Inform menu immediately of changes
            sendMenuMsg(timer.getTime(), cycleInfo.cycleNum(), cycleInfo.isWorking());
        }); 
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

                webExtWrapper.localStorage.get("longRestLength",(item) => {
                    unblockPages();
                    myCountdown = createTimer(item.longRestLength.userValue || item.longRestLength.defaultValue); 
                    myCountdown.start();
                });
 
            } else {
                var notificationMessage = "Congrats on the hard work! Take a short break.";

                webExtWrapper.localStorage.get("restLength", (item) => {
                    unblockPages();
                    myCountdown = createTimer(item.restLength.userValue || item.restLength.defaultValue); 
                    myCountdown.start();
                });
            }
        } else {
            var notificationMessage = "Time to get to work!";

            // switching to working cycle
            cycleTracker.toggle();

            webExtWrapper.localStorage.get(["blockPattern", "workLength"], (item) => {
                blockPages( item.blockPattern.userValue || item.blockPattern.defaultValue );
                myCountdown = createTimer(item.workLength.userValue || item.workLength.defaultValue);
                myCountdown.start();
            });
        }
        webExtWrapper.localStorage.get("popups", (item)=> {
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

    function selectPreferenceValue(key) {
        return key.userValue || key.defaultValue;
    }

    var publicAPI = {
        route: routeMessage
    };

    return publicAPI;
}


function setUpDefaultPreferences() {
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
        // default settings arbitrarily chosen
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

