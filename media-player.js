let path = require('path');

let videoTypes = new Set(['.ogv', '.mp4']);
let audioTypes = new Set(['.mp3', '.flac', '.oga', '.wav']);
let ambiguousTypes = new Set(['.webm', '.ogg']); // These can be either audio or video

class MediaPlayer {
    
    constructor(io) {
        this.io = io;
        this.mediaIndex = 0;
        this.mediaTypes = [];
        this.startTime = null;
        this.filesProcessed = 0;
        this.playlist = [
            './media_files/frozen-tree-branches.ogv',   // Video
            './media_files/tiny-bird.webm',             // Video
            './media_files/bird-on-a-rock.mp4',         // Video
            './media_files/birds-after-rain.oga',       // Audio
            './media_files/dove.wav',                   // Audio
            './media_files/farm.webm',                  // Audio
            './media_files/nature-ambiance.flac',       // Audio
            './media_files/sunny-day.ogg',              // Audio
            './media_files/western-sandpiper.mp3'       // Audio
        ];
        this.breakpoints = new Array(this.playlist.length);
        this.mediaLengths = new Array(this.playlist.length);
    }
    
    // Determine whether files are audio, video, or unsupported
    getMediaTypes() {
        this.playlist.forEach((url) => {
            let extension = path.parse(url).ext.toLowerCase();
            if (audioTypes.has(extension)) this.mediaTypes.push('audio');
            else if (videoTypes.has(extension)) this.mediaTypes.push('video');
            else if (ambiguousTypes.has(extension)) {
                const shellCommand = `heroku run ffmpeg -i ${url} -hide_banner 2>&1 | grep `;
                const executeSync = require('child_process').execSync;
                try {
                    executeSync(shellCommand + 'Video:'); // Check if ogg or webm file is video
                    this.mediaTypes.push('video');
                }
                catch (videoError) {
                    try {
                        executeSync(shellCommand + 'Audio:'); // Check if ogg or webm file is audio
                        this.mediaTypes.push('audio');
                    }
                    catch (audioError) {
                        throw Error(`${url} has no video or audio content`);
                    }
                }
            }
            else throw Error(`${url} is an unsuported file type`);
        });
    }
    
    // Compute video end times
    setBreakpoints() {
        let totalTime = 0;
        this.breakpoints = this.mediaLengths.map((currentVal) => {
            return totalTime += currentVal; 
        });
    }
    

    startTimers() {
        this.startTime = new Date(); // Start main timer
        for (let index = 0; index < this.breakpoints.length; index++) {
            let breakpointMillisecs = this.breakpoints[index] * 1000;
            
            // Set timers to update mediaIndex and notify users of next URL in playlist
            if (index === (this.breakpoints.length - 1)) {
                setTimeout(() => {
                    // Emit socket event here
                    let url = this.playlist[0].slice(14);
                    this.io.sockets.emit('newMedia', {url: url});
                    this.mediaIndex = 0;
                    this.restartTimers();
                }, breakpointMillisecs);
            } else {
                setTimeout(() => {
                    // Emit socket event here
                    let url = this.playlist[this.mediaIndex + 1].slice(14);
                    this.io.sockets.emit('newMedia', {url: url});
                    this.mediaIndex++;
                }, breakpointMillisecs);
            }
        }
    }
    
    restartTimers() {
        this.startTimers();
    }
    
    // Extract media duration. Documentation: https://ffmpeg.org/ffprobe.html
    getMediaLength(url, index) {
        const shellCommand = 'heroku run ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ';
        const execute = require('child_process').exec;
    
        execute(shellCommand + url, (err, stdout) => {
            let duration = stdout.split('\n')[0]; // Remove \n
            this.mediaLengths[index] = parseFloat(duration);
            if (++this.filesProcessed === this.mediaLengths.length) {
                this.setBreakpoints();
                this.startTimers();
            }
        });
    }
    
    // Initialize by parsing media
    init() {
        //this.getMediaTypes();
        this.playlist.forEach((fileUrl, index) => {
            this.getMediaLength(fileUrl, index);
        });
    }
    
    getTimestamp() {
        let timePassed = (new Date() - this.startTime)/1000;
        for (let index = 0; index < this.breakpoints.length; index++) {
            if (timePassed <= this.breakpoints[index]) {
                let videoStartTime = this.breakpoints[index - 1] || 0;
                let timestamp = timePassed - videoStartTime;
                console.log(`watching file ${index + 1}; ${timestamp}s`);
                return timestamp;
            }
        }
    }
}

module.exports = MediaPlayer;