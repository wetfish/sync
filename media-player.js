let playlist = [
    './media_files/giant-steps.ogv',                // Web video
    './media_files/have-you-met-miss-jones.ogg',    // Web audio
    './media_files/milestones.flac',                // Lossless audio
    './media_files/nows-the-time.mp4',              // Video
    './media_files/sing-sing-sing.webm',            // Web video
    './media_files/so-what.mp3',                    // Audio
    './media_files/straight-no-chaser.wav'          // Audio
]

// Get media duration using ffprobe
const ffprobe  = require('ffprobe')
const ffprobeStatic = require('ffprobe-static')
const execute = require('child_process').exec // Asynchronous version

const getMediaLength = function (url) {
    ffprobe(url, {path: ffprobeStatic.path}, function (err, info) {
        if (err) {
            return done(err)
        }
      console.log(`${url}:.... ${info.streams[0].duration}`);
    });
}

playlist.forEach((fileUrl) => {
    getMediaLength(fileUrl)
})

module.exports = {
    playlist: playlist
}