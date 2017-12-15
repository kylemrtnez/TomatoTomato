'use strict';

var pattern = "https://www.reddit.com/*";

function redirect(reqDetails) {
    console.log("Redirecting from reddit...");
    return {redirectUrl: browser.extension.getURL("redirect/blocked.html")};
}

browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: [pattern]}, 
    ["blocking"]
);