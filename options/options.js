//TODO: Add restore defaults
//TODO: Clean up variable names
//TODO: Override 'enter' button function for 'Add' website
//TODO: Add Whitelist options and switch for blacklist/whitelist
//TODO: Enforce integer for timer length

// Get the document ids
var workLengthInput     = document.querySelector("#workLength");
var restLengthInput     = document.querySelector("#restLength");
var longRestLengthInput = document.querySelector("#longRestLength");
var addSiteBtn          = document.getElementById('addSite');
var removeSiteBtn       = document.getElementById('removeSite');
var websiteSelect       = document.getElementById('blockPatterns');
var websiteInput        = document.getElementById('websiteInput');
var workDisplay         = document.getElementById('workDisplay');
var restDisplay         = document.getElementById('restDisplay');
var longRestDisplay     = document.getElementById('longRestDisplay');
var saveMinutesBtn      = document.getElementById('saveMinutesBtn');

const SECONDS = 1000;
const MINUTES = 60*SECONDS;

/**********************************************************************
* EVENT LISTENERS
***********************************************************************/

// Restore settings to UI when document elements done loading.
document.addEventListener("DOMContentLoaded", restoreOptions);

// Sets up listener for Cycle Length form save button.
document.getElementById('cycleForm').addEventListener("submit", saveMinutes);

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
        saveMinutesBtn.disabled = true;
    } else { 
        clearErrFormat(workLengthInput);
        clearText('workErr');
        saveMinutesBtn.disabled = false;
    }
})

// Error checking for rest cycle minutes
restLengthInput.addEventListener("input", ()=> {
    if (isNaN(restLengthInput.value)) {
        var restLengthErrMsg = "Please enter a number."; 
        formatForErr(restLengthInput);
        updateText('restErr', restLengthErrMsg);
        saveMinutesBtn.disabled = true;
    } else { 
        clearErrFormat(restLengthInput);
        clearText('restErr');
        saveMinutesBtn.disabled = false;
    }
})

// Error checking for long rest cycle minutes
longRestLengthInput.addEventListener("input", ()=> {
    if (isNaN(longRestLengthInput.value)) {
        var longRestLengthErrMsg = "Please enter a number."; 
        formatForErr(longRestLengthInput);
        updateText('longRestErr', longRestLengthErrMsg);
        saveMinutesBtn.disabled = true;
    } else { 
        clearErrFormat(longRestLengthInput);
        clearText('longRestErr');
        saveMinutesBtn.disabled = false;
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
    

    
    var gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then((restoredSettings)=> {

        // Overwrite the user settings with the new settings
        if (workLengthInput.value != "") {
            restoredSettings.workLength.userValue = workLengthInput.value*MINUTES/SECONDS;
        }

        if (restLengthInput.value != "") {
            restoredSettings.restLength.userValue = restLengthInput.value*MINUTES/SECONDS;
        }

        if (longRestLengthInput.value != "") {
            restoredSettings.longRestLength.userValue = longRestLengthInput.value*MINUTES/SECONDS;
        }
        
        // Save updated settings to local storage
        browser.storage.local.set(restoredSettings);

        // Update displays 
        workDisplay.textContent       = restoredSettings.workLength.userValue*SECONDS/MINUTES     || restoredSettings.workLength.defaultValue*SECONDS/MINUTES;
        restDisplay.textContent       = restoredSettings.restLength.userValue*SECONDS/MINUTES     || restoredSettings.restLength.defaultValue*SECONDS/MINUTES;
        longRestDisplay.textContent   = restoredSettings.longRestLength.userValue*SECONDS/MINUTES || restoredSettings.longRestLength.defaultValue*SECONDS/MINUTES;
    });

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

    var gettingStoredWebsites = browser.storage.local.get();
    gettingStoredWebsites.then((restoredSettings)=> {
        // Overwrite block patterns with new list
        restoredSettings.blockPattern.userValue = Array.apply(null, websiteSelect.options).map(
            function(el) { 
                var url = new WebsiteUrl(el.text); 
                return url.formatted();
            }) // this crap is needed because HTMLSelectElement.Option returns stupid stuff

        // Save updated website list
        browser.storage.local.set(restoredSettings);
    });
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
        workDisplay.textContent       = restoredSettings.workLength.userValue*SECONDS/MINUTES     || restoredSettings.workLength.defaultValue*SECONDS/MINUTES;
        restDisplay.textContent       = restoredSettings.restLength.userValue*SECONDS/MINUTES     || restoredSettings.restLength.defaultValue*SECONDS/MINUTES;
        longRestDisplay.textContent   = restoredSettings.longRestLength.userValue*SECONDS/MINUTES || restoredSettings.longRestLength.defaultValue*SECONDS/MINUTES;

        websiteList = restoredSettings.blockPattern.userValue || restoredSettings.blockPattern.defaultValue;

        // Add the websites to the list box
        for(var idx in websiteList) {
            var listUrl = new WebsiteUrl(websiteList[idx]);
            websiteSelect.options[websiteSelect.options.length] = new Option(listUrl.unformatted(), idx);
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
