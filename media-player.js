let playlist = [
    './media_files/giant-steps.ogv',                // Web video
    './media_files/have-you-met-miss-jones.ogg',    // Web audio
    './media_files/milestones.flac',                // Lossless audio
    './media_files/nows-the-time.mp4',              // Video
    './media_files/sing-sing-sing.webm',            // Web video
    './media_files/so-what.mp3',                    // Audio
    './media_files/straight-no-chaser.wav'          // Audio
];

let startTime;
let mediaIndex = 0;
let filesProcessed = 0;
let breakpoints = new Array(playlist.length);
let mediaLengths = new Array(playlist.length);

const setBreakpoints = function() {
    let totalTime = 0;
    breakpoints = mediaLengths.map((currentVal) => {
        return totalTime += currentVal; 
    });
};

const startTimers = function() {
    startTime = new Date(); // Start main timer
    for (let index = 0; index < breakpoints.length; index++) {
        let breakpointMillisecs = breakpoints[index] * 1000;
        
        if (index === (breakpoints.length - 1)) {
            setInterval(() => {mediaIndex = 0;}, breakpointMillisecs); // A timer to reset mediaIndex
        } else {
            setInterval(() => {mediaIndex++;}, breakpointMillisecs); // A timer to update mediaIndex
        }
    }
};

const restartTimers = function() {
    startTimers();
};

// Extract media duration. Documentation: https://ffmpeg.org/ffprobe.html
const getMediaLength = function (url, index) {
    const shellCommand = 'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ';
    const execute = require('child_process').exec;

    execute(shellCommand + url, (err, stdout) => {
        let duration = stdout.split('\n')[0]; // Remove \n
        mediaLengths[index] = parseFloat(duration);
        if (++filesProcessed === mediaLengths.length) {
            setBreakpoints();
            startTimers();
        }
    });
};

// Get mediaLengths. Start timer
const init = function() {
    playlist.forEach((fileUrl, index) => {
        getMediaLength(fileUrl, index);
    });
};

const getTimestamp = function() {
    let timePassed = (new Date() - startTime)/1000;
    for (let index = 0; index < breakpoints.length; index++) {
        if (timePassed < breakpoints[index]) {
            let videoStartTime = breakpoints[index - 1] || 0;
            console.log(`watching video: ${index + 1}`);
            return timePassed - videoStartTime;
        }
    }
    console.log('Restarting playlist');
    restartTimers();
    return 0;
};

module.exports = {
    playlist: playlist,
    mediaIndex: mediaIndex,
    init: init,
    getTimestamp: getTimestamp
};