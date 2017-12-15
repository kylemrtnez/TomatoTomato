'use strict';

var pattern = "https://www.reddit.com/*";
var wait = 10000;
var original = Receiver();
// Listener for message from popup. 
browser.runtime.onMessage.addListener(original.decipher);



/**********************************************************************
* Description: Sets up a listener for web requests and redirects sites on
*               list to blocked html page. 
* Parameters: None 
* Returns: None 
***********************************************************************/
function Receiver() {
    function decode(message) {
        // see what type of message it is
        // if block message, start blocking
        if (message.action == "block") {
            if (!browser.webRequest.onBeforeRequest.hasListener(redirect)) {
               blockPages(); 
            }
        }
        else { 
        //(message.action == "unblock") 
            unblockPages();
        } 
    }
    /**********************************************************************
    * blockPages
    * Description: Sets up a listener for web requests and redirects sites
    *               on list to an extension html page.
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function blockPages() {
        browser.webRequest.onBeforeRequest.addListener(
            redirect,
            {urls: [pattern]}, 
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

    var publicAPI = {
        decipher: decode
    };

    return publicAPI;
}




