# TomatoTomato
Tomato Tomato is a minimalistic productivity/work-flow management extension. Its concept revolves around working for a set amount of time, then taking a short break before working again. At the end of 4 work/break cycles, a longer break is taken. While the work session is active, Tomato Tomato blocks websites which you do not want to visit in order to keep you focused.

Key Features:
- Customize the timer lengths (work/break/longbreak)
- Customizable list of blocked websites
- Notification upon cycle completion

Pomodoro™/Focus Timer extension for Mozilla and Chrome. The Pomodoro Technique® and Pomodoro™ are registered trademarks of Francesco Cirillo. 

## Development
To build for all targets, run:
```
gulp
```

This will generate the manifest files for Chrome and Firefox and copy them to the appropriate subdirectory in `build/` 

To generate `*.zip` files for distribution, run:
```
gulp dist
```

Which will zip up the releases into the `dist/` directory with the version number defined in `manifest.master.json` appended to the filenames. 
