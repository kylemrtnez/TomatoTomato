'use strict';

var startBtn = document.getElementById('start');
var stopBtn = document.getElementById('stop');
var settingsBtn = document.getElementById('settings');

// message listener
browser.runtime.onMessage.addListener(function (message) {
    updateDisplay(message.uMinutes || 'tomato icon');
})

// update minutes when menu is opened
sendBackgroundMsg('requestCurTimeRemaining');

// start button
startBtn.addEventListener("click", ()=> {
    sendBackgroundMsg('block'); // TODO replace string with variable once alternating is solved
})

// stop button
stopBtn.addEventListener("click", ()=> {
    sendBackgroundMsg('unblock');
})

// Open options extension options page when settings button is clicked
settingsBtn.addEventListener("click", ()=> {
    var opening = browser.runtime.openOptionsPage();
})

/**********************************************************************
* sendBackgroundMsg
* Description: Sends a message to the background script telling it
                whether to listen/block web requests or not.
* Parameters: blockOrUnblock = a string saying "block" or "unblock" 
* Returns: None
***********************************************************************/
function sendBackgroundMsg(blockOrUnblock) {
    browser.runtime.sendMessage({action: blockOrUnblock});
}

/**********************************************************************
* updateDisplay
* Description: Updates timer display with minutes remaining in menu
* Parameters: updatedMins = integer to change display 
* Returns: 
***********************************************************************/
function updateDisplay(updatedMins) {
    var timerDisplay = document.getElementById('timer-display');
    timerDisplay.textContent = updatedMins;
}

