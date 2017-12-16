'use strict';

var startBtn = document.getElementById('start');
var defaultWorkMins = 10;

updateDisplay(defaultWorkMins);

browser.runtime.onMessage.addListener(function (message) {
    updateDisplay(message.uMinutes);
});

startBtn.addEventListener("click", ()=> {
    sendBackgroundMsg('block'); // TODO replace string with variable once alternating is solved
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

