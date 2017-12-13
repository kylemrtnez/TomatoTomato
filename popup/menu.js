'use strict';

var startBtn = document.getElementById('start');

// TODO check that multiple presses of this message does not reset timer
// prob check this on the background script
startBtn.addEventListener("click", workTimerMsg)

function workTimerMsg() {
    // TODO will need to check that a second press does not reset timer
    browser.runtime.sendMessage({timer: "work"});
    console.log("Popup button sent the message!");
}