'use strict'

function CycleManager() {
    var working = false;
    var breakCount = 0;
    var cycleCount = 0;
    var isLongBreak = false;
    var longBreakEvery = 4;

    // return length of break?
    // cycle manager responsible for fetching work/break lengths?

    // how do we indicate that we are on a long break?
    // need a public API

    function refresh() {
        // get date/time and reset breakCount
    }


    function toggleCycle() {
        if (working) {
            working = false;
            incBreakCount();
            checkLongBreak(longBreakEvery)
        } else {
            working = true;
            incCycleCount();
        }
    }

    // test for long break
    function checkLongBreak(lbNum) {
        if ((breakCount % lbNum) == 0) {
            toggleLongBreak ();
        }
    }

    function toggleLongBreak() {
        if (isLongBreak) {
            isLongBreak = false;
        } else {
            isLongBreak = true;
        }
    }

    function incCycleCount() {
        cycleCount++;
    }

    function incBreakCount() {
        breakCount++;
    }

    function resetCycle() {
        breakCount = 0;
    }
    
    function getCycleNum() {
        return cycleCount;
    }

    // need a public API
    var publicAPI = {
        toggle: toggleCycle,
        reset: resetCycle
    }

    return publicAPI;
}

export CycleManager;