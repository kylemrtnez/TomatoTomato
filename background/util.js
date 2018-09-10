const SECONDS = 1000;
const MINUTES = 60*SECONDS;

// chrome.webRequest.onBeforeRequest.hasListener
// chrome.webRequest.onBeforeRequest.addListener
// chrome.webRequest.onBeforeRequest.removeListener

function BrowserWrapper() {
    var publicAPI = {
        addMsgListener: addMsgListener,
        reqListener: RequestsAPI(),
        localStorage: LocalStorageAPI()
    };
    return publicAPI;

    function RequestsAPI() {
        var API = {
            add: addReqListener,
            remove: removeReqListener,
            exists: reqListenerExists
        };
        return API;
 
        function removeReqListener(listenerFn) {
            chrome.webRequest.onBeforeRequest.removeListener(listenerFn);
        }

        function reqListenerExists(listenerFn) {
            return chrome.webRequest.onBeforeRequest.hasListener(listenerFn);
        }

        function addReqListener(listenerFn, filter, extraInfo) {
            chrome.webRequest.onBeforeRequest.addListener(
                listenerFn,
                filter,
                extraInfo
            );
        }
    }

    function LocalStorageAPI() {
        var API = {
            set: localSet,
            get: localGet
        }
        return API;

        function localSet(keyValuePairs) {
            chrome.storage.local.set(keyValuePairs);
        }

        function localGet(key, callback) {
            chrome.storage.local.get(key, callback); 
        }
    }



    function addMsgListener(listenerFn) {
        chrome.runtime.onMessage.addListener(listenerFn);
    }

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

    chrome.runtime.sendMessage(contents);
}

function sendNotification(msg) {
    chrome.notifications.create("cycle-notification", {
        "type":     "basic",
        "title":    "Cycle complete!",
        "iconUrl":  chrome.extension.getURL("icons/pomo48.png"),
        "message":  msg
    });
}

function minsToSeconds(num) {
    return num * MINUTES / SECONDS; 
}


function onError(error) {
    console.log(`Error: ${error}`);
}