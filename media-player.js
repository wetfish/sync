let playlist = [
    './media_files/giant-steps.ogv',                // Web video
    './media_files/have-you-met-miss-jones.ogg',    // Web audio
    './media_files/milestones.flac',                // Lossless audio
    './media_files/nows-the-time.mp4',              // Video
    './media_files/sing-sing-sing.webm',            // Web video
    './media_files/so-what.mp3',                    // Audio
    './media_files/straight-no-chaser.wav'          // Audio
];

let index = 0;
let filesProcessed = 0;
let mediaLengths = new Array(playlist.length);
let startTime;

// Extract media duration. Documentation: https://ffmpeg.org/ffprobe.html
const getMediaLength = function (url, index) {
    const shellCommand = 'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ';
    const execute = require('child_process').exec;

    execute(shellCommand + url, (err, stdout) => {
        let duration = stdout.split('\n')[0]; // Remove \n
        mediaLengths[index] = parseInt(duration);
        if (++filesProcessed === mediaLengths.length) {
            startTime = new Date();
        }
    });
};

// Get mediaLengths. Start timer
const init = function() {
    playlist.forEach((fileUrl, index) => {
        getMediaLength(fileUrl, index);
    });
};

module.exports = {
    playlist: playlist,
    index: index,
    init: init
};