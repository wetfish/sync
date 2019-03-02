let videoTypes = new Set(['mkv', 'flv', 'f4a', 'f4b', 'f4p', 'f4v', 'vob', 'ogv', 'drc', 'gif', 'ifv', 'mng', 'avi', 'mts', '2ts', 'mov', '.qt', 'wmv', 'yuv', '.rm', 'mvb', 'mp4', 'm4v', 'mpg', 'mp2', 'peg', 'mpe', 'mpv', 'm2v', 'svi', '3g2', 'mxf', 'roq', 'nsv']);
let audioTypes = new Set(['.aa', 'aac', 'aax', 'act', 'iff', 'amr', 'ape', '.au', 'awb', 'dct', 'dss', 'dvf', 'lac', 'gsm', 'lax', 'ivs', 'm4a', 'mmf', 'mp3', 'mpc', 'msv', 'nmf', 'nsf', 'oga', 'pus', '.ra', '.rm', 'raw', 'sln', 'tta', 'vox', 'wav', 'wma', '.wv', 'svx']);
let ambiguousTypes = new Set(['ogg', 'm4p', '3gp', 'ebm']); // These can be either audio or video

class MediaPlayer {
    
    constructor(io) {
        this.io = io;
        this.mediaIndex = 0;
        this.mediaTypes = [];
        this.startTime = null;
        this.filesProcessed = 0;
        this.playlist = [
            './media_files/short-test.mp4',                 // Video
            './media_files/giant-steps.ogv',                // Web video
            './media_files/have-you-met-miss-jones.ogg',    // Web audio
            './media_files/milestones.flac',                // Lossless audio
            './media_files/nows-the-time.mp4',              // Video
            './media_files/sing-sing-sing.webm',            // Web video
            './media_files/so-what.mp3',                    // Audio
            './media_files/straight-no-chaser.wav'          // Audio
        ];
        this.breakpoints = new Array(this.playlist.length);
        this.mediaLengths = new Array(this.playlist.length);
    }
    
    getMediaTypes() {
        this.playlist.forEach((url) => {
            let extension = url.slice(-3).toLowerCase();
            if (audioTypes.has(extension)) this.mediaTypes.push('audio');
            else if (videoTypes.has(extension)) this.mediaTypes.push('video');
            else if (ambiguousTypes.has(extension)) this.mediaTypes.push('ambiguous');
            else this.mediaTypes.push('unknown');
        });
    }
    
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
                setInterval(() => {
                    // TODO: Emit socket event here. Fix circular dependency.
                    this.mediaIndex = 0;
                }, breakpointMillisecs);
            } else {
                setInterval(() => {
                    // TODO: Emit socket event here. Fix circular dependency.
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
        const shellCommand = 'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ';
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
    
    // Get mediaLengths. Start timer
    init() {
        this.getMediaTypes();
        this.playlist.forEach((fileUrl, index) => {
            this.getMediaLength(fileUrl, index);
        });
    }
    
    getTimestamp() {
        let timePassed = (new Date() - this.startTime)/1000;
        for (let index = 0; index < this.breakpoints.length; index++) {
            if (timePassed < this.breakpoints[index]) {
                let videoStartTime = this.breakpoints[index - 1] || 0;
                console.log(`watching video: ${index + 1}`);
                return timePassed - videoStartTime;
            }
        }
        console.log('Restarting playlist');
        this.restartTimers();
        return 0;
    }
}

module.exports = MediaPlayer;