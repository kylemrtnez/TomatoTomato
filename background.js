'use strict';

var pattern = "https://www.reddit.com/*";

function blockingPages() {

    function redirect(reqDetails) {
        return {redirectUrl: browser.extension.getURL("redirect/blocked.html")};
    }

    browser.webRequest.onBeforeRequest.addListener(
        redirect,
        {urls: [pattern]}, 
        ["blocking"]
    );
    console.log("Background received the message!");
}

browser.runtime.onMessage.addListener(blockingPages);