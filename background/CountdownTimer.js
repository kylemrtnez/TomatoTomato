/**********************************************************************
* CountdownTimer
* Description: Module representing a timer which counts down. 
* Interface: .setTimer = sets timer length in seconds
*            .start = starts countdown
*            .cdFunc = assigns a function to be called when countdown
*                       ends
* Parameters: None 
* Returns: Public interface to interact with CountdownTimer object 
***********************************************************************/
function CountdownTimer() {
    var countdownLength = null; // length of timer in seconds
    var countdownFunc = null;
    var intervalID = null;

    /**********************************************************************
    * setTimer
    * Description: Sets length of timer
    * Parameters: timeLength = length of time in seconds to set
    * Returns: None
    ***********************************************************************/
    function setTimer(timeLength) {
        countdownLength = timeLength;
    }

    /**********************************************************************
    * getTime
    * Description: Gets time left on the countdown
    * Parameters: None
    * Returns: countdownLength (seconds)
    ***********************************************************************/
    function getTime() {
        return countdownLength;
    }
    

    /**********************************************************************
    * setCountdownFunc
    * Description: Sets a function to be called at the end of the 
    *               countdown. Optional.
    * Parameters:  theFunc = the function to be called at end of countdown
    * Returns: None
    ***********************************************************************/
    function setCountdownFunc(endOfTimerFunc) {
        countdownFunc = endOfTimerFunc;
    }

    /**********************************************************************
    * startTimer
    * Description: Starts timer countdown. 
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function startTimer() {
        var timeLeft = countdownLength || 0;

        // timer
        intervalID = window.setInterval(()=> {
            timeLeft--;
            setTimer(timeLeft);

            if (timeLeft <= 0) {
                stopTimer();

                if (countdownFunc != null) {
                    countdownFunc();
                }   
            }
        }, 1*SECONDS);
    }

    /**********************************************************************
    * stopTimer
    * Description: Stops the timer if there is one currently running
    * Parameters: None
    * Returns: None 
    ***********************************************************************/
    function stopTimer() {
        if (intervalID) {
            window.clearInterval(intervalID);
            setTimer(null);
        }
    }

    var publicAPI = {
        setTimer: setTimer,
        start: startTimer,
        stop: stopTimer,
        cdFunc: setCountdownFunc,
        getTime: getTime
    };

    return publicAPI;
}
