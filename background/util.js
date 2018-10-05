const SECONDS = 1000;
const MINUTES = 60*SECONDS;
const WORK_SOUND = 'start-work-cycle';
const WORK_SOUND_FILEPATH = '../sounds/start-work-cycle.mp3';
const REST_SOUND = 'start-rest-cycle';
const REST_SOUND_FILEPATH = '../sounds/start-rest-cycle.mp3';

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

function playAudioNotification(type) {
    var notifSound;
    if (type === WORK_SOUND) {
        notifSound = new Audio(WORK_SOUND_FILEPATH); 
    } else if (type === REST_SOUND) { 
        notifSound = new Audio(REST_SOUND_FILEPATH);
    }
    notifSound.play();
}

function minsToSeconds(num) {
    return num * MINUTES / SECONDS; 
}


function onError(error) {
    console.log(`Error: ${error}`);
}
