//TODO: Add restore defaults
//TODO: Clean up variable names
//TODO: Override 'enter' button function for 'Add' website
//TODO: Add Whitelist options and switch for blacklist/whitelist
//TODO: Enforce integer for timer length


// Get the document ids
var workLengthInput   = document.querySelector("#workLength");
var restLengthInput   = document.querySelector("#restLength");
var longRestLengthInput = document.querySelector("#longRestLength");
var addSiteBtn    = document.getElementById('addSite');
var removeSiteBtn = document.getElementById('removeSite');
var websiteSelect = document.getElementById('blockPatterns');
var websiteInput  = document.getElementById('websiteInput');
var workDisplay = document.getElementById('workDisplay');
var restDisplay = document.getElementById('restDisplay');
var longRestDisplay = document.getElementById('longRestDisplay');

const SECONDS = 1000;
const MINUTES = 60*SECONDS;
// Set up defaults.
var workLengthDefault = 25*MINUTES/SECONDS;
var restLengthDefault = 5*MINUTES/SECONDS;
var longRestLengthDefault = 25*MINUTES/SECONDS;
var blockPatternDefault = ["*://www.reddit.com/*", "*://www.facebook.com/*"];

/**********************************************************************
* EVENT LISTENERS
***********************************************************************/

// Restore settings to UI when document elements done loading.
document.addEventListener("DOMContentLoaded", restoreOptions);

// Sets up listener for Cycle Length form save button.
document.getElementById("cycleForm").addEventListener("submit", saveMinutes);

// Sets up listener that adds a website to the blocking list on click
addSiteBtn.addEventListener("click", (event)=> {
    var siteToAdd = websiteInput.value;
    var last = websiteSelect.options.length;

    //TODO: Some regexrep magic to turn any website entry into a standard *://www.something.something/* format

    websiteSelect.options[last] = new Option(siteToAdd,last);
    websiteInput.value = null;
    saveWebsites(event);
});

// Sets up a listener that removes selected websites from the list.
removeSiteBtn.addEventListener("click", (event)=> {
    var elementsToRemove = Array.apply(null, websiteSelect.selectedOptions).map(function(el) { return el.index; });
    //console.log(elementsToRemove);
    for(var idx = elementsToRemove.length-1; idx >=0 ; idx--){
        //console.log(elementsToRemove[idx]);
        websiteSelect.remove(elementsToRemove[idx]);
    }
    saveWebsites(event);
});

// Error checking for working cycle minutes
workLengthInput.addEventListener("input", ()=> {
    if (isNaN(workLengthInput.value)) {
        var workLengthErrMsg = "Please enter a number."; 
        formatForErr(workLengthInput);
        updateText('workErr', workLengthErrMsg);
    } else { 
        clearErrFormat(workLengthInput);
        clearText('workErr');
    }
})

// Error checking for rest cycle minutes
restLengthInput.addEventListener("input", ()=> {
    if (isNaN(restLengthInput.value)) {
        var restLengthErrMsg = "Please enter a number."; 
        formatForErr(restLengthInput);
        updateText('restErr', restLengthErrMsg);
    } else { 
        clearErrFormat(restLengthInput);
        clearText('restErr');
    }
})

// Error checking for long rest cycle minutes
longRestLengthInput.addEventListener("input", ()=> {
    if (isNaN(longRestLengthInput.value)) {
        var longRestLengthErrMsg = "Please enter a number."; 
        formatForErr(longRestLengthInput);
        updateText('longRestErr', longRestLengthErrMsg);
    } else { 
        clearErrFormat(longRestLengthInput);
        clearText('longRestErr');
    }
})

/**********************************************************************
* HELPER FUNCTIONS
***********************************************************************/

/**********************************************************************
* saveMinutes
* Description: Saves the user settings to local storage
* Parameters: None 
* Returns: None 
***********************************************************************/
function saveMinutes(event) {
    event.preventDefault(); 
    
    //Save the settings in local storage
    if (workLengthInput.value != "") {
        browser.storage.local.set({
            workLength: workLengthInput.value*MINUTES/SECONDS,
        });
    }

    if (restLengthInput.value != "") {
        browser.storage.local.set({
            restLength: restLengthInput.value*MINUTES/SECONDS,
        });
    }

    if (longRestLengthInput.value != "") {
        browser.storage.local.set({
            longRestLength: longRestLengthInput.value*MINUTES/SECONDS,
        });
    }
}

/**********************************************************************
* saveWebsites
* Description: Event action for website list form submission. Stores 
*               website list in local storage.
* Parameters: The event from the event listener
* Returns: None
***********************************************************************/
function saveWebsites(event) {
    event.preventDefault();

    browser.storage.local.set({
        blockPattern: Array.apply(null, websiteSelect.options).map(
            function(el) { return el.text; }) // this crap is needed because HTMLSelectElement.Option returns stupid stuff
    })
}

/**********************************************************************
* Description: Restores settings from local storage when options page
*               is loaded. Uses defaults 
* Parameters: None 
* Returns: None 
***********************************************************************/
function restoreOptions() {

    function onError(error) {
        console.log(`Error: ${error}`);
    }
  
    // Actually does the restoring
    function updateUI(restoredSettings) {
        // Update the timer value 
        workDisplay.textContent       = restoredSettings.workLength*SECONDS/MINUTES     || workLengthDefault*SECONDS/MINUTES;
        restDisplay.textContent       = restoredSettings.restLength*SECONDS/MINUTES     || restLengthDefault*SECONDS/MINUTES;
        longRestDisplay.textContent   = restoredSettings.longRestLength*SECONDS/MINUTES || longRestLengthDefault*SECONDS/MINUTES;

        // If stored settings for blocked websites are found, use those.
        if(restoredSettings.blockPattern) {
            var websiteList = restoredSettings.blockPattern;
        } else {
            var websiteList = blockPatternDefault;
        }

        // Add the websites to the list box
        for(var idx in websiteList) {
            websiteSelect.options[websiteSelect.options.length] = new Option(websiteList[idx],idx);
        }
    }
  
    // Grabs the settings, then tells it to update input field w that data
    var gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then(updateUI, onError);
}

/**********************************************************************
* formatForErr
* Description: Formats a specified DOM Element to have a red background
*               and red border
* Parameters: The DOM element to format
* Returns: None
***********************************************************************/
function formatForErr(domElement) {
    var errorColor = "#ffc1c1";
    var errorBorder = "solid red 1px";

    domElement.style.backgroundColor = errorColor;
    domElement.style.border = errorBorder;
}

/**********************************************************************
* clearErrFormat
* Description: Sets a DOM element's background color to white and
*               border to none
* Parameters: The DOM element to format
* Returns: None
***********************************************************************/
function clearErrFormat(domElement) {
    var regularBorder = "solid #cecece 1px";

    domElement.style.backgroundColor = 'white';
    domElement.style.border = regularBorder;
}

/**********************************************************************
* updateText
* Description: Display an error message by inserting text into a 
*               specified DOM element
* Parameters: The DOM element ID to insert the message, a string with the
*               error message.
* Returns: None 
***********************************************************************/
function updateText(domId, msg) {
    var element = document.getElementById(domId);
    element.textContent = msg;
}

/**********************************************************************
* clearErrText
* Description: Clears text content of a specified DOM element
* Parameters: The DOM element ID to be cleared 
* Returns: None 
***********************************************************************/
function clearText(domId) {
    var clearThisElement = document.getElementById(domId);
    clearThisElement.textContent = "";
}