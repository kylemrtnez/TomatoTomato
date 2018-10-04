const SECONDS = 1000;
const MINUTES = 60*SECONDS;

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
