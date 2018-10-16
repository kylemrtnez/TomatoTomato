//TODO: Clean up variable names
//TODO: Add Whitelist options and switch for blacklist/whitelist

// Get the document ids
var workLengthInput     = document.querySelector("#workLength");
var restLengthInput     = document.querySelector("#restLength");
var longRestLengthInput = document.querySelector("#longRestLength");
var addSiteBtn          = document.getElementById('addSite');
var removeSiteBtn       = document.getElementById('removeSite');
var restoreDefaultsBtn  = document.getElementById('restoreDefaultsBtn');
var websiteSelect       = document.getElementById('blockPatterns');
var websiteInput        = document.getElementById('websiteInput');
var workDisplay         = document.getElementById('workDisplay');
var restDisplay         = document.getElementById('restDisplay');
var longRestDisplay     = document.getElementById('longRestDisplay');
var popupNotif          = document.getElementById('popupNotif');
var workLengthBtn       = document.getElementById('workLengthBtn');
var restLengthBtn       = document.getElementById('restLengthBtn');
var longRestLengthBtn   = document.getElementById('longRestLengthBtn');

const SECONDS = 1000;
const MINUTES = 60*SECONDS;

/**********************************************************************
* EVENT LISTENERS
***********************************************************************/

// Restore settings to UI when document elements done loading.
document.addEventListener("DOMContentLoaded", restoreOptions);

// Sets up listener for restore defaults button
restoreDefaultsBtn.addEventListener("click", (event)=> {
    if (window.confirm("Are you sure? This will erase all your settings, including losing your entire website block list.")) {
        restoreDefaults();
    }
});

/******* WEBSITE LIST LISTENERS *******/

// Adds website on button click
addSiteBtn.onclick = function() {
    addSiteToList();
    saveWebsites();
}

// Website list listener for "enter" button
websiteInput.addEventListener("keydown", function(event) {
    if ((event.which == 13 || event.keyCode == 13)) {
        event.preventDefault();

        addSiteToList();
        saveWebsites();
    }
});

// Remove selected sites on click
removeSiteBtn.addEventListener("click", (event)=> {
    event.preventDefault();
    var elementsToRemove = Array.apply(null, websiteSelect.selectedOptions).map(function(el) { return el.index; });

    clearSelectElements(elementsToRemove);

    saveWebsites();
});

/******* CYCLE LENGTH LISTENERS *******/

// Saves cycle lengths on button click
workLengthBtn.onclick        = function() { saveCycleLength(workLengthInput.id); }
restLengthBtn.onclick        = function() { saveCycleLength(restLengthInput.id); }
longRestLengthBtn.onclick    = function() { saveCycleLength(longRestLengthInput.id); }

// Work cycle length listener for "enter" button
workLengthInput.addEventListener("keydown", function(event) {
    if ((event.which == 13 || event.keyCode == 13) && isPositiveNumber(workLengthInput)) {
        event.preventDefault();
        saveCycleLength(workLengthInput.id);
    }
});

// Rest cycle length listener for "enter" button
restLengthInput.addEventListener("keydown", function(event) {
    if ((event.which == 13 || event.keyCode == 13) && isPositiveNumber(restLengthInput)) {
        event.preventDefault();
        saveCycleLength(restLengthInput.id);
    }
});

// Long Rest cycle length listener for "enter" button
longRestLengthInput.addEventListener("keydown", function(event) {
    if ((event.which == 13 || event.keyCode == 13) && isPositiveNumber(longRestLengthInput)) {
        event.preventDefault();
        saveCycleLength(longRestLengthInput.id);
    }
});

// Error checking for working cycle minutes
workLengthInput.addEventListener("input", ()=> {
    if (!isPositiveNumber(workLengthInput)) {
        var errMsg = "<strong>Oh Snap!</strong> Please enter a positive number."; 
        formatForErr(workLengthInput);
        showError('cycleError', errMsg);
        workLengthBtn.disabled = true;
    } else { 
        clearErrFormat(workLengthInput);
        clearError('cycleError');
        workLengthBtn.disabled = false;
    }
})

// Error checking for rest cycle minutes
restLengthInput.addEventListener("input", ()=> {
    if (isNaN(restLengthInput.value)) {
        var restLengthErrMsg = "Please enter a number."; 
        var errMsg = "<strong>Oh Snap!</strong> Please enter a positive number."; 
        formatForErr(restLengthInput);
        showError('cycleError', errMsg);
        restLengthBtn.disabled = true;
    } else { 
        clearErrFormat(restLengthInput);
        clearError('cycleError');
        restLengthBtn.disabled = false;
    }
})

// Error checking for long rest cycle minutes
longRestLengthInput.addEventListener("input", ()=> {
    if (isNaN(longRestLengthInput.value)) {
        var longRestLengthErrMsg = "Please enter a number."; 
        var errMsg = "<strong>Oh Snap!</strong> Please enter a positive number."; 
        formatForErr(longRestLengthInput);
        showError('cycleError', errMsg);
        longRestLengthBtn.disabled = true;
    } else { 
        clearErrFormat(longRestLengthInput);
        clearError('cycleError');
        longRestLengthBtn.disabled = false;
    }
})

// Save notification setting on click
popupNotif.addEventListener("change", ()=> {
    chrome.storage.local.get(null,(restoredSettings)=> {
            restoredSettings.popups = popupNotif.checked;
            chrome.storage.local.set(restoredSettings);
    });
});

/**********************************************************************
* HELPER FUNCTIONS
***********************************************************************/

/**********************************************************************
* restoreDefaults
* Description: Restores the default settings
* Parameters: None 
* Returns: None 
***********************************************************************/
function restoreDefaults(event) {
    console.log("restore defaults");
    // Set up default values
    let defaultSitesBlocked = ['*://www.reddit.com/*','*://www.facebook.com/*'];
    let defaultWorkMins = 25 * MINUTES / SECONDS;
    let defaultRestMins = 5 * MINUTES / SECONDS;
    let defaultLongRestMins =25 * MINUTES / SECONDS;
    
    // For each data member, set userValue to null
    var userSettings = { 
        blockPattern:   {userValue: null, defaultValue: defaultSitesBlocked},
        workLength:     {userValue: null, defaultValue: defaultWorkMins},
        restLength:     {userValue: null, defaultValue: defaultRestMins},
        longRestLength: {userValue: null, defaultValue: defaultLongRestMins}
    };

    // Save settings
    chrome.storage.local.set(userSettings);

    // Update the page
    restoreOptions();
}

// Adds website to list (does not affect saved data)
function addSiteToList() {

    var siteToAdd = websiteInput.value;
    var last = websiteSelect.options.length;

    //TODO: Some regexrep magic to turn any website entry into a standard *://www.something.something/* format

    websiteSelect.options[last] = new Option(siteToAdd,last);
    websiteInput.value = null;
}

// Clears website list (does not affect saved data)
function clearSelectElements(idxToClear) {
    for(var idx = idxToClear.length-1; idx >=0 ; idx--){
        websiteSelect.remove(idxToClear[idx]);
    }
}

// Checks if an element (cycle length) is a positive number
function isPositiveNumber(inputElement) {
    return (~isNaN(inputElement.value) && inputElement.value >= 0);
}

// Saves cycle lengths
function saveCycleLength(domId) {
    chrome.storage.local.get(null,function(restoredSettings) {
        if(domId == "workLength" || domId == "workLengthBtn") {
            restoredSettings.workLength.userValue = workLengthInput.value*MINUTES/SECONDS;
            saveMinutes(restoredSettings);

            updateUI(restoredSettings);

            // Clear current text
            workLengthInput.value = null;
        }
        if(domId == "restLength" || domId == "restLengthBtn") {
            restoredSettings.restLength.userValue = restLengthInput.value*MINUTES/SECONDS;
            saveMinutes(restoredSettings);

            updateUI(restoredSettings);

            // Clear current text
            restLengthInput.value = null;
        }
        if(domId == "longRestLength" || domId == "longRestLengthBtn") {
            restoredSettings.longRestLength.userValue = longRestLengthInput.value*MINUTES/SECONDS;
            saveMinutes(restoredSettings);

            updateUI(restoredSettings);

            // Clear current text
            longRestLengthInput.value = null;
        }
    });
}

/**********************************************************************
* saveMinutes
* Description: Saves the user settings to local storage
* Parameters: None 
* Returns: None 
***********************************************************************/
function saveMinutes(settings) {
        // Save updated settings to local storage
        chrome.storage.local.set(settings);

        // Update displays 
        workDisplay.textContent       = settings.workLength.userValue*SECONDS/MINUTES     || settings.workLength.defaultValue*SECONDS/MINUTES;
        restDisplay.textContent       = settings.restLength.userValue*SECONDS/MINUTES     || settings.restLength.defaultValue*SECONDS/MINUTES;
        longRestDisplay.textContent   = settings.longRestLength.userValue*SECONDS/MINUTES || settings.longRestLength.defaultValue*SECONDS/MINUTES;
}

/**********************************************************************
* saveWebsites
* Description: Event action for website list form submission. Stores 
*               website list in local storage.
* Parameters: The event from the event listener
* Returns: None
***********************************************************************/
function saveWebsites() {

    chrome.storage.local.get(null,(restoredSettings)=> {
        // Overwrite block patterns with new list
        restoredSettings.blockPattern.userValue = Array.apply(null, websiteSelect.options).map(
            function(el) { 
                var url = new WebsiteUrl(el.text); 
                return url.formatted();
            }) // this crap is needed because HTMLSelectElement.Option returns stupid stuff

        // Save updated website list
        chrome.storage.local.set(restoredSettings);
    });
}

// Updates UI to reflect stored settings
function updateUI(restoredSettings)  {
    popupNotif.checked = restoredSettings.popups;

    // Update the timer value 
    workDisplay.textContent       = restoredSettings.workLength.userValue*SECONDS/MINUTES     || restoredSettings.workLength.defaultValue*SECONDS/MINUTES;
    restDisplay.textContent       = restoredSettings.restLength.userValue*SECONDS/MINUTES     || restoredSettings.restLength.defaultValue*SECONDS/MINUTES;
    longRestDisplay.textContent   = restoredSettings.longRestLength.userValue*SECONDS/MINUTES || restoredSettings.longRestLength.defaultValue*SECONDS/MINUTES;


    // Clear the website list before adding the list that's stored
    var allSelectElements = Array.apply(null, {length: websiteSelect.length}).map(Function.call, Math.random);
    clearSelectElements(allSelectElements);

    // Add the websites to the list box
    websiteList = restoredSettings.blockPattern.userValue || restoredSettings.blockPattern.defaultValue;
    for(var idx in websiteList) {
        var listUrl = new WebsiteUrl(websiteList[idx]);
        websiteSelect.options[websiteSelect.options.length] = new Option(listUrl.unformatted(), idx);
    }
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
  
    // Grabs the settings, then tells it to update input field w that data
    chrome.storage.local.get(null, updateUI);
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
* showError
* Description: Display an error message by inserting text into a 
*               specified DOM element
* Parameters: The DOM element ID to insert the message, a string with the
*               error message.
* Returns: None 
***********************************************************************/
function showError(domId, msg) {
    var element = document.getElementById(domId);
    element.hidden = false;
    element.innerHTML = msg;
}

/**********************************************************************
* clearError
* Description: Clears text content of a specified DOM element
* Parameters: The DOM element ID to be cleared 
* Returns: None 
***********************************************************************/
function clearError(domId) {
    var clearThisElement = document.getElementById(domId);
    clearThisElement.hidden = true;
    clearThisElement.textContent = "";
}

/**********************************************************************
* Class: WebsiteURL
* Description: A class used to transform a website URL to formats needed
*               by the web extension. 2 formats were needed, one for the
*               background script and one to present to users on the 
*               options page.
*               Example of background script format: *://www.reddit.com/*
*               Example of user presentation format: www.reddit.com
* Interface: formatted() returns backround script format
*            unformatted() returns user presentation format
***********************************************************************/
class WebsiteUrl {
    constructor(urlAddress) {
        this.unformattedUrl = this.unformatWebsite(urlAddress);
        this.formattedUrl = this.formatWebsite(urlAddress);
    }

    unformatted() {
        return this.unformattedUrl;
    }

    formatted() {
        return this.formattedUrl;
    }
    
    /**********************************************************************
     * unformatWebsite
     * Description: Formats website URL to format seen by users in options page.
     *               Note that this function does not do formatting validation. 
     *               URLs passed to this function should be in the format used 
     *               by the background script before  being used. Formats to use 
     *               can be found in the parameters 
     *               section.
     * Parameters: The website address to be formatted
     *             The following formats are supported
     *             *://www.reddit.com/*
     * Returns: A URL with formatted for external use by options page.
     *           Ex. www.reddit.com
     ***********************************************************************/
    unformatWebsite(formattedUrl) {
        var unformattedUrl = unformatFront(formattedUrl);
        unformattedUrl = unformatEnd(unformattedUrl);

        return unformattedUrl;

        function unformatFront(webUrl) {
            var unformattedFront = webUrl;

            if (unformattedFront.startsWith("*://")) {
               unformattedFront = webUrl.slice(4);
            }

            return unformattedFront;
        }

        function unformatEnd(webUrl) {
            var unformattedEnd = webUrl;

            if (unformattedEnd.endsWith("/*")) {
               unformattedEnd = webUrl.slice(0, -2); 
            }

            return unformattedEnd;
        }

    }
 
    /**********************************************************************
    * formatWebsite
    * Description: Formats website URL to format used in background script. 
    *               Note that this function does not do formatting validation. 
    *               URLs passed to this function should be validated before 
    *               being used. Formats to use can be found in the parameters 
    *               section.
    * Parameters: The website address to be formatted
    *             The following formats are supported
    *             www.reddit.com
    *             http://www.reddit.com/
    *             https://www.reddit.com/
    * Returns: A URL with formatted for internal use by background script.
    *           Ex. *://www.reddit.com/*
    ***********************************************************************/
    formatWebsite(unformattedUrl) {
         
        var formattedUrl = formatFront(unformattedUrl);
        formattedUrl = formatEnd(formattedUrl);
 
        return formattedUrl;
 
        function formatEnd(webUrl) {
            var endStr = "/*";
            var formattedEnd;
 
            if (webUrl.endsWith("/")) {
                formattedEnd = webUrl.slice(0, -1) + endStr;
            } else {
                formattedEnd = webUrl + endStr;
            }
            return formattedEnd;
        }
        
        function formatFront(webUrl) {
            var beginningStr = "*://";
            // check for the following strings at front of URL
            var http = "http://";
            var httpIdx = 7; // index for slicing
            var https = "https://";
            var httpsIdx = 8; // index for slicing
            var formattedFront; // function returns this;
 
            /* Note that formatting should be pre-validated before using this
                function. Therefore, we don't need to validate formatting here
                and can freely adjust the website URL.
            */
            if (webUrl.startsWith(http)) {
                formattedFront =  beginningStr + webUrl.slice(httpIdx);
            } else if (webUrl.startsWith(https)) {
                formattedFront = beginningStr + webUrl.slice(httpsIdx);
            } else {
                formattedFront = beginningStr + webUrl;
            }
            return formattedFront;
        } 
    }
}
