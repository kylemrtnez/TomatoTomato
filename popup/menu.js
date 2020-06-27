const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const settingsBtn = document.getElementById('settings');
const timerDisplay = document.getElementById('timer-display');

// Open options extension options page when settings button is clicked
settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

/** ********************************************************************
* sendBackgroundMsg
* Description: Sends a message to the background script telling it
                whether to listen/block web requests or not.
* Parameters: blockOrUnblock = a string saying "block" or "unblock"
* Returns: None
********************************************************************** */
function sendBackgroundMsg(blockOrUnblock) {
  chrome.runtime.sendMessage({ action: blockOrUnblock });
}

/** ********************************************************************
 * updatePopup
 * Description: Sets up an interval for requesting an update from background on
 *              the timer. 100ms seems to be roughly required to prevent
 *              user-detectable lag. TODO is this too much CPU usage?
 * Parameters: None
 * Returns: None
 ********************************************************************** */
function updatePopup() {
  window.setInterval(() => {
    sendBackgroundMsg('requestUpdate');
  }, 100);
}

/** ********************************************************************
 * updateDisplay
 * Description: Updates timer display with minutes remaining in menu
 * Parameters: updatedMins = integer to change display
 * Returns: None
 ********************************************************************** */
function updateDisplay(timeLeft) {
  // Pad minutes / seconds so that always show at least two digits
  function leftPad(number, targetLength) {
    let output = `${number}`;
    while (output.length < targetLength) {
      output = `0${output}`;
    }
    return output;
  }
  // Calculate mins/secs
  const minsLeft = Math.floor(timeLeft / 60);
  const secsLeft = Math.floor(timeLeft - minsLeft * 60);

  // Display time left in MM:SS
  timerDisplay.textContent = `${leftPad(minsLeft, 2)}:${leftPad(secsLeft, 2)}`;

  // Choose what button to display
  if (minsLeft === 0 && secsLeft === 0) {
    stopBtn.style.display = 'none';
    startBtn.style.display = 'block';
  } else {
    stopBtn.style.display = 'block';
    startBtn.style.display = 'none';
  }
}

/** ********************************************************************
 * updateBackground
 * Description: Updates background color to correspond with cycle type
 * Parameters: isWorkCycle = boolean on if work status
 * Returns: None
 ********************************************************************** */
function updateBackground(isWorkCycle) {
  const backgrounds = document.getElementsByClassName('background');
  const restColor = '#c3e9ff';
  const workColor = '#ffefbb';

  if (isWorkCycle) {
    for (let i = 0; i < backgrounds.length; i += 1) {
      backgrounds[i].style.backgroundColor = workColor;
    }
  } else {
    for (let i = 0; i < backgrounds.length; i += 1) {
      backgrounds[i].style.backgroundColor = restColor;
    }
  }
}

/** ********************************************************************
 * updateCycleCount
 * Description: Updates cycle count in menu to number of cycles
 * Parameters: count = int of number of cycles
 * Returns: None
 ********************************************************************** */
function updateCycle(count, workCycle) {
  function formatCurrent(domEle) {
    const hiliteBorder = '#FF932D';
    const hiliteColor = '#ffab46';

    domEle.style.border = `1px solid transparent${hiliteBorder}`;
    domEle.style.backgroundColor = hiliteColor;
    domEle.style.animation = 'glowing 1.0s infinite alternate';
  }

  function formatPrevious(num, cycle) {
    const finishedBorder = '#0084DB';
    const finishedColor = '#2594DD';

    const restClass = 'cycle-rest';
    const restCycles = document.getElementsByClassName(restClass);
    const workClass = 'cycle-work';
    const workCycles = document.getElementsByClassName(workClass);

    for (let i = 1; i < num; i += 1) {
      const idx = i - 1;
      workCycles[idx].style.border = `solid 1px ${finishedBorder}`;
      workCycles[idx].style.backgroundColor = finishedColor;
      workCycles[idx].style.animation = 'fillIn 3.0s';

      restCycles[idx].style.border = `solid 1px ${finishedBorder}`;
      restCycles[idx].style.backgroundColor = finishedColor;
      restCycles[idx].style.animation = 'fillIn 3.0s';
    }
    if (cycle === 'rest') {
      workCycles[num - 1].style.border = `solid 1px ${finishedBorder}`;
      workCycles[num - 1].style.backgroundColor = finishedColor;
      workCycles[num - 1].style.animation = 'fillIn 3.0s';
    }
  }
  function resetCycle() {
    const restClass = 'cycle-rest';
    const restCycles = document.getElementsByClassName(restClass);
    const workClass = 'cycle-work';
    const workCycles = document.getElementsByClassName(workClass);

    const noBackground = '#FFFFFF';

    for (let i = 0; i < restCycles.length; i += 1) {
      restCycles[i].style.border = 'none';
      restCycles[i].style.backgroundColor = noBackground;
      restCycles[i].style.animation = 'none';
    }

    for (let i = 0; i < workCycles.length; i += 1) {
      workCycles[i].style.border = 'none';
      workCycles[i].style.backgroundColor = noBackground;
      workCycles[i].style.animation = 'none';
    }
  }
  // if count is 0 then we haven't started a cycle
  if (count === 0) {
    resetCycle();
    return;
  }

  let cycleType = 'rest';
  if (workCycle) {
    cycleType = 'work';
  }

  const selectionString = `cycle-${cycleType} cycle-${count}`;
  const curCycle = document.getElementsByClassName(selectionString);
  resetCycle();
  formatCurrent(curCycle[0]);
  formatPrevious(count, cycleType);
}

// Set up listener for updates from background
chrome.runtime.onMessage.addListener((message) => {
  updateDisplay(message.timeLeft || 0);
  updateBackground(message.cycWorking);
  updateCycle(message.cycCount, message.cycWorking);
});

// Start the popup update requests
updatePopup();

// Start button listener
startBtn.addEventListener('click', () => {
  sendBackgroundMsg('block'); // TODO replace string with variable once alternating is solved
  stopBtn.style.display = 'block';
  startBtn.style.display = 'none';
});

// Stop button listener
stopBtn.addEventListener('click', () => {
  // chrome.browserAction.setBadgeText({text: " "});
  sendBackgroundMsg('unblock');
  stopBtn.style.display = 'none';
  startBtn.style.display = 'block';
});
