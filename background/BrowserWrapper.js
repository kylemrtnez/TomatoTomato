'use strict';
/**********************************************************************
* CycleManager
* Description: A module which tracks Pomodoro cycles and can return the
*               current cycle. Handles logic for switching the cycles.
***********************************************************************/
function BrowserWrapper() {
    var publicAPI = {
        addMsgListener: addMsgListener,
        reqListener: RequestsAPI(),
        localStorage: LocalStorageAPI(),
        setBadgeColor: setBadgeColor,
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

    function setBadgeColor(newColor) {
        chrome.browserAction.setBadgeBackgroundColor({color: newColor});
    }
}
