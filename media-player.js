const playlistUrl = process.env.URL || 'http://localhost:3000';
let path = require('path');
let fs = require('fs');
let m3uParser = require('m3u8-parser');

let videoTypes = new Set(['.ogv', '.mp4']);
let audioTypes = new Set(['.mp3', '.flac', '.oga', '.wav']);
let m3uTypes = new Set(['.m3u', '.m3u8']);
let ambiguousTypes = new Set(['.webm', '.ogg']); // These can be either audio or video

let count = 0;
//import m3u file
function importM3U(url) {
    
    let parser = new m3uParser.Parser();
    url = fs.readFileSync(url).toString();
    
    parser.push(url);
    parser.end();
    let parsedFile = parser.manifest;
   // console.log(parsedFile);
    return parsedFile;
}


class MediaPlayer {

    constructor(io) {
        this.io = io;
        this.mediaIndex = 0;
        this.mediaTypes = [];
        this.startTime = null;
        this.filesProcessed = 0;
        this.playlistCount = 0;

        this.playlist = fs.readdirSync('./public/media').filter(this.isValidMediaFile).map(function(file){
            //console.log(file);
            //process M3U file and return an array of content
            if (file.includes('m3u')) {
                let playlist = importM3U('./public/media/'+file);
                //loop through array, and check to see if each file is valid.
                let list = playlist.segments.map(function(file) {
                    //process file so that spaces are taken out of file name 
                    console.log(file);
                    return file.uri;
                });
                return list;
            }
                
            return '/media/'+file;
        });


        console.log("Loaded playlist:", this.playlist);

        this.breakpoints = new Array(this.playlist.length);
        this.mediaLengths = new Array(this.playlist.length);
    }

    isValidMediaFile(file) {
        


        let validExtensions = new Set([...videoTypes, ...audioTypes, ...ambiguousTypes, ...m3uTypes]);


        let extension = path.parse('./'+ file).ext.toLowerCase();
        

        return (validExtensions.has(extension));
    }

    // Determine whether files are audio, video, or unsupported
    getMediaTypes() {
        this.playlist.forEach((url) => {

            let relativeUrl = './public' + url;
            let extension = path.parse(relativeUrl).ext.toLowerCase();

            if (audioTypes.has(extension)) this.mediaTypes.push('audio');
            else if (videoTypes.has(extension)) this.mediaTypes.push('video');
            else if (ambiguousTypes.has(extension)) {
                const shellCommand = `ffmpeg -i "${relativeUrl}" -hide_banner 2>&1 | grep `;
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
            else throw Error(`${url} is an unsupported file type`);

             //if we get an array for a url, it's a processed m3u playlist
            if (Array.isArray(url)) {
                console.log('LOLOLOLOLOL');
                for (let i of url) {
                    if (this.isValidMediaFile(i)) {
                        console.log(i);
                        console.log(true);
                    }
                    else {
                        console.log(this.isValidMediaFile(i));
                    }
                }
                
                //trust that the user inputed the correct path, if theres no file then remove it from the playlist
            } 
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
                    this.mediaIndex = 0;
                    emitNewMediaEvent();
                    this.restartTimers();
                }, breakpointMillisecs);
            } else {
                setTimeout(() => {
                    // Emit socket event here
                    this.mediaIndex++;
                    emitNewMediaEvent();
                }, breakpointMillisecs);
            }
        }

        const emitNewMediaEvent = () => {
            const url = `${playlistUrl}${this.playlist[this.mediaIndex]}`;
            const mediaType = this.mediaTypes[this.mediaIndex];
            const duration = this.mediaLengths[this.mediaIndex];
            const data = {
                url: url,
                duration: duration,
                mediaType: mediaType
            };

            //on new media event, count each time the index is at zero.
            if (this.mediaIndex == 0) {
                this.playlistCount++;
            }
            this.io.sockets.emit('newMedia', data);
        };
    }

    restartTimers() {
        this.startTimers();
    }

    // Extract media duration. Documentation: https://ffmpeg.org/ffprobe.html
    getMediaLength(url, index) {
        const shellCommand = 'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1';
        const execute = require('child_process').exec;

        execute(`${shellCommand} "./public${url}"`, (err, stdout) => {
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
        this.getMediaTypes();
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
                console.log(`watching file ${playlistUrl}${this.playlist[index]}; ${timestamp}s`);
                return timestamp;
            }
        }
    }


}

module.exports = MediaPlayer;