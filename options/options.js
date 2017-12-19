//TODO: Add restore defaults
//TODO: Clean up variable names
//TODO: Override 'enter' button function for 'Add' website
//TODO: Add Whitelist options and switch for blacklist/whitelist
//TODO: Enforce integer for timer length



// Get the document ids
var workLengthInput   = document.querySelector("#workLength");
var addSiteBtn    = document.getElementById('addSite');
var removeSiteBtn = document.getElementById('removeSite');
var websiteSelect = document.getElementById('blockPatterns');
var websiteInput  = document.getElementById('websiteInput');

// Set up defaults.
var workLengthDefault = "25";
var blockPatternDefault = ["*://www.reddit.com/*", "*://www.facebook.com/*"];

// Restore settings to UI when document elements done loading.
document.addEventListener("DOMContentLoaded", restoreOptions);

// Sets up listener for options save button.
document.querySelector("form").addEventListener("submit", saveOptions);

// Sets up listener that adds a website to the blocking list on click
addSiteBtn.addEventListener("click", ()=> {
    var siteToAdd = websiteInput.value;
    var last = websiteSelect.options.length;

    //TODO: Some regexrep magic to turn any website entry into a standard *://www.something.something/* format

    websiteSelect.options[last] = new Option(siteToAdd,last);
    websiteInput.value = null;
});

// Sets up a listener that removes selected websites from the list.
removeSiteBtn.addEventListener("click", ()=> {
    var elementsToRemove = Array.apply(null, websiteSelect.selectedOptions).map(function(el) { return el.index; });
    //console.log(elementsToRemove);
    for(var idx = elementsToRemove.length-1; idx >=0 ; idx--){
        //console.log(elementsToRemove[idx]);
        websiteSelect.remove(elementsToRemove[idx]);
    }
});

/**********************************************************************
* Description: Saves the user settings to local storage
* Parameters: None 
* Returns: None 
***********************************************************************/
function saveOptions(event) {
    event.preventDefault(); 
    
    //console.log(Array.apply(null, websiteSelect.options).map(function(el) { return el.text; }));

    //Save the settings in local storage
    browser.storage.local.set({
        workLength: workLengthInput.value,
        blockPattern: Array.apply(null, websiteSelect.options).map(function(el) { return el.text; }) // this crap is needed because HTMLSelectElement.Option returns stupid stuff
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
        workLengthInput.value   = restoredSettings.workLength    || workLengthDefault;

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
