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

// Extract media duration. Documentation: https://ffmpeg.org/ffprobe.html
const shellCommand = 'ffprobe -v error -sexagesimal -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ';
const execute = require('child_process').exec;

const getMediaLength = function (url) {
    execute(shellCommand + url, (err, stdout) => {
        let duration = stdout.split('\n'); // Remove \n
        console.log( url + '...' + duration);
    });
};

playlist.forEach((fileUrl) => {
    getMediaLength(fileUrl);
});

module.exports = {
    playlist: playlist,
    index: index
};