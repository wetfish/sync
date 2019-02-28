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
let mediaTypes = [];
let filesProcessed = 0;
let breakpoints = new Array(playlist.length);
let mediaLengths = new Array(playlist.length);
let videoTypes = new Set(['mkv', 'flv', 'f4a', 'f4b', 'f4p', 'f4v', 'vob', 'ogv', 'drc', 'gif', 'ifv', 'mng', 'avi', 'mts', '2ts', 'mov', '.qt', 'wmv', 'yuv', '.rm', 'mvb', 'mp4', 'm4v', 'mpg', 'mp2', 'peg', 'mpe', 'mpv', 'm2v', 'svi', '3g2', 'mxf', 'roq', 'nsv']);
let audioTypes = new Set(['.aa', 'aac', 'aax', 'act', 'iff', 'amr', 'ape', '.au', 'awb', 'dct', 'dss', 'dvf', 'lac', 'gsm', 'lax', 'ivs', 'm4a', 'mmf', 'mp3', 'mpc', 'msv', 'nmf', 'nsf', 'oga', 'pus', '.ra', '.rm', 'raw', 'sln', 'tta', 'vox', 'wav', 'wma', '.wv', 'svx']);
let ambiguousTypes = new Set(['ogg', 'm4p', '3gp', 'ebm']); // These can be either audio or video

const getMediaTypes = function() {
    playlist.forEach((url) => {
        let extension = url.slice(-3).toLowerCase();
        if (audioTypes.has(extension)) mediaTypes.push('audio');
        else if (videoTypes.has(extension)) mediaTypes.push('video');
        else if (ambiguousTypes.has(extension)) mediaTypes.push('ambiguous');
        else mediaTypes.push('unknown');
    });
};

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
    getMediaTypes();
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
    init: init,
    playlist: playlist,
    mediaTypes: mediaTypes,
    mediaIndex: mediaIndex,
    getTimestamp: getTimestamp
};