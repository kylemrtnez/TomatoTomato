// Get the document ids
const workLengthInput   = document.querySelector("#workLength");
const blockPatternInput = document.querySelector("#blockPattern");
const workLengthDefault = "25";
const blockPatternDefault = "*://www.reddit.com*";

/**********************************************************************
* Description: Saves the user settings to local storage
* Parameters: None 
* Returns: None 
***********************************************************************/
function saveOptions(event) {
    event.preventDefault(); 

    //Save the settings in local storage
    browser.storage.local.set({
        workLength: workLengthInput.value,
        blockPattern: blockPatternInput.value
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
        workLengthInput.value   = restoredSettings.workLength    || workLengthDefault;
        blockPatternInput.value = restoredSettings.blockPattern  || blockPatternDefault;
    }
  
    // Grabs the settings, then tells it to update input field w that data
    var gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then(updateUI, onError);
}

// Restore settings to UI when document elements done loading.
document.addEventListener("DOMContentLoaded", restoreOptions);
// Save options on 'submit'
document.querySelector("form").addEventListener("submit", saveOptions);
