'use strict';

var pattern = "https://www.reddit.com/*";
var wait = 10000;

// Listener for message from popup. 
browser.runtime.onMessage.addListener(blockingPages);

/**********************************************************************
* Description: Sets up a listener for web requests and redirects sites on
*               list to blocked html page. 
* Parameters: None 
* Returns: None 
***********************************************************************/
function blockingPages() {
    browser.webRequest.onBeforeRequest.addListener(
        redirect,
        {urls: [pattern]}, 
        ["blocking"]
    );

    window.setTimeout(unblockPages, wait);

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
}



/**********************************************************************
* 
* Description: 
* Parameters: 
* Returns: 
***********************************************************************/
function something(param) {
    // if it is a work session
    if (param == "work") {
       blockingPages(); 
    }
    // else 
    // something with the timer for a break session
}

