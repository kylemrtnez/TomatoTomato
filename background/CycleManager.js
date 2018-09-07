/**********************************************************************
* CycleManager
* Description: A module which tracks Pomodoro cycles and can return the
*               current cycle. Handles logic for switching the cycles.
***********************************************************************/
function CycleManager() {
    var isWorkCycle = false;
    var cycleCount = 0;
    var longBreakFlag = false;
    var longBreakEvery = 4;

    /**********************************************************************
    * Public Interface
    * Description: toggle: toggles between work/break cycles
    *              reset:  resets cycleCount, effectively restarting the 
    *                       pomodoro cycle
    *              isWorking: returns true if cycle is a work cycle, false
    *                           if break cycle
    *              isLongBreak: returns true if break cycle should be a 
    *                            long break
    *              cycleNum: returns the current cycle number
    ***********************************************************************/
    var publicAPI = {
        toggle: updateCycle,
        reset: resetCycle,
        isWorking: getWorkCycle,
        isLongBreak: getLongBreak,
        cycleNum: getCycleNum
    }


    /**********************************************************************
    * updateCycle
    * Description: Updates cycle variables (isWorkCycle, cycleCount ,
    *              longBreakFlag) as necessary. Publically exposed.
    * Parameters: None 
    * Returns: None 
    ***********************************************************************/
    function updateCycle() {
        toggleCycle();
        updateCycleCount();
        checkLongBreak(longBreakEvery);

        function updateCycleCount() {
            // increase cycle count once for a work/rest pairing
            if (isWorkCycle) {
                incCycleCount();
            }
        }

        function toggleCycle() {
            if (isWorkCycle) {
                isWorkCycle = false;
            } else {
                isWorkCycle = true;
            }
        }
    }

    /**********************************************************************
    * checkLongBreak
    * Description: Sets the longBreakFlag if on a long break cycle.
    * Parameters: lbNum = a number representing how often to have a long break
    *                      ex. checkLongBreak(4) means every 4th break is long 
    * Returns: None 
    ***********************************************************************/
    function checkLongBreak(frequency) {
        if ((cycleCount % frequency) == 0) {
            longBreakFlag = true;
        } else {
            longBreakFlag = false;
        }
    }

    /**********************************************************************
    * incCycleCount
    * Description: Increments cycleCount
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function incCycleCount() {
        cycleCount++;
    }

    /**********************************************************************
    * resetCycle
    * Description: Resets cycle count back to 0, effectively restarting the
    *               Pomodoro cycle.
    * Parameters: None 
    * Returns: None 
    ***********************************************************************/
    function resetCycle() {
        cycleCount = 0;
        isWorkCycle = false;
    }
    
    /**********************************************************************
    * getCycleNum
    * Description: Reports what cycle number we are on
    * Parameters: None
    * Returns: cycleCount member variable 
    ***********************************************************************/
    function getCycleNum() {
        var modifiedCount = cycleCount % 4;

        if (cycleCount < 5) {
            return cycleCount;
        }
        else if (modifiedCount == 0) {
            return 4;
        }
        else {
            return modifiedCount;
        }
    }

    /**********************************************************************
    * getWorkCycle
    * Description: Returns true/false depending on the current cycle
    * Parameters: None 
    * Returns: True if current cycle is a work cycle, false if break cycle
    ***********************************************************************/
    function getWorkCycle() {
        return isWorkCycle;
    }

    /**********************************************************************
    * getLongBreak
    * Description: Returns the status of the longBreakFlag member variable
    * Parameters: None 
    * Returns: True if long break, false if regular break 
    ***********************************************************************/
    function getLongBreak() {
        return longBreakFlag;
    } 

    return publicAPI;
}

