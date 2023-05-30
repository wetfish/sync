const playlistUrl = process.env.URL || 'http://localhost:3000';
const argv = require('yargs-parser')(process.argv);
const path = require('path');
const fs = require('fs');
const m3uParser = require('m3u8-parser');
const videoTypes = new Set(['.ogv', '.mp4']);
const audioTypes = new Set(['.mp3', '.flac', '.oga', '.wav']);
const ambiguousTypes = new Set(['.webm', '.ogg']); // These can be either audio or video


//import m3u files into sync. atm files will need to be located in the project directory.
function importM3U(file) {

    const parser = new m3uParser.Parser();

    let parsedFile = fs.readFileSync(file).toString();

    parser.push(parsedFile);
    parser.end();
    return parser.manifest.segments;
}

class MediaPlayer {

    constructor(io) {
        this.io = io;
        this.mediaIndex = 0;
        this.mediaTypes = [];
        this.startTime = null;
        this.elapsedTime = null;
        this.filesProcessed = 0;
        this.playlistCount = 0;

        if (argv.m3u) {
            this.playlist = importM3U(argv.m3u).map(this.processM3U).filter(this.isValidMediaFile);
        }
        else {
            this.playlist = fs.readdirSync('./public/media').filter(this.isValidMediaFile).map(function(file){
                return '/media/'+file;
            });
        }
        console.log("Loaded playlist:", this.playlist);

        this.breakpoints = new Array(this.playlist.length);
        this.mediaLengths = new Array(this.playlist.length);
    }

    processM3U(file) {
        //check file duration
        if (file.duration) {
            //check for a file uri
            if (file.uri) {
                //get the name of the file which will be the title of the media
                let name = path.parse(file.uri).name;
                //return an object with relevant information 
                return {
                    duration:file.duration,
                    url: file.uri,
                    name: name,
                };
            }
            console.warn(`Weird. Somehow one of your files in your playlist is missing a path`);
        }
        else {
            if (file.uri) {
                //get the name of the file which will be the title of the media
                let name = path.parse(file.uri).name;
                const shellCommand = 'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1';
                const execute = require('child_process').execSync;
                let duration = execute(`${shellCommand} "./public${file.uri}"`).toString();
                //return an object with relevant information 
                return {
                    duration: parseFloat(duration),
                    url: file.uri,
                    name: name,
                };
            }
            console.warn(`one of your files in your playlist ${file.uri} is missing a duration`);
        }
    }

    isValidMediaFile(file) {
        let validExtensions = new Set([...videoTypes, ...audioTypes, ...ambiguousTypes]);
        let extension = path.parse('./'+ file).ext.toLowerCase();

        //if file happens to be an object and has the property url, parse it differently.
        if (file.hasOwnProperty('url')) {
            validExtensions = new Set([...videoTypes, ...audioTypes]);
            extension = path.parse('./'+ file.url).ext.toLowerCase();
            if(validExtensions.has(extension)) {
                return file;
            }
            else {
                console.warn(`file ${file.url} has an unsupported file extension. skipping...`);
            }
        }
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
            else throw Error(`${url} is an unsuported file type`);
        });
    }
    getPlaylistMediaTypes() {
        //m3u playlists will not support ambiguous file types for the moment.
        this.playlist.forEach((file)=>{
            let extension = path.parse(file.url).ext.toLowerCase();
            if (audioTypes.has(extension)) this.mediaTypes.push('audio');
            else if (videoTypes.has(extension)) this.mediaTypes.push('video');
        });
    }

    // Compute video end times
    previous(){
        console.log("previous");
        this.mediaIndex--;
        if(this.mediaIndex < 0){
            this.mediaIndex = this.playlist.length - 1;
        }
        
        this.emitNewMediaEvent()   ; 
    }
    next(){
        console.log("next");
        this.mediaIndex++;
        if(this.mediaIndex >= this.playlist.length){
            this.mediaIndex = 0;
            this.playlistCount++;
        }
        this.emitNewMediaEvent()   ;
    }
    emitNewMediaEvent()  {
        this.startTime = new Date();
        let url = `${playlistUrl}${this.playlist[this.mediaIndex]}`;
        //if were in m3u mode were passing an object so we have to fetch the url from the object
        if (argv.m3u) {
            //check the url for a remote http string
            if (this.playlist[this.mediaIndex]['url'].startsWith('http')) {
                url = `${this.playlist[this.mediaIndex]['url']}`;
            }
            else {
                //else its a local file 
                url = `${playlistUrl}${this.playlist[this.mediaIndex]['url']}`;
            }
            
        }
        const mediaType = this.mediaTypes[this.mediaIndex];
        const duration = this.mediaLengths[this.mediaIndex];
        const data = {
            url: url,
            duration: duration,
            mediaType: mediaType
        };

        this.io.sockets.emit('newMedia', data);
    }

    startTimers() {
        this.startTime = new Date(); // Start main timer
    }

    tick() {
        this.elapsedTime = (new Date() - this.startTime)/1000;
        if (this.elapsedTime >=  this.mediaLengths[this.mediaIndex]) {
            this.startTime = new Date();
            this.next();
        }
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
            this.filesProcessed++;
            if (this.filesProcessed === this.mediaLengths.length) {
                this.startTimers();
            }
        });
    }
    //register media lengths from M3U playlist
    registerMediaLength(file, index) {
        this.mediaLengths[index] = file.duration;
        this.filesProcessed++;
        if (this.filesProcessed === this.mediaLengths.length) {
            this.startTimers();
        }
    }

    // Initialize by parsing media
    init() {
        if (argv.m3u) {
            this.getPlaylistMediaTypes();
            this.playlist.forEach((file, index)=>{
                this.registerMediaLength(file,index);
            });
        }
        else {
            this.getMediaTypes();
            this.playlist.forEach((fileUrl, index) => {
                this.getMediaLength(fileUrl, index);
            });
        }
    }

    getTimestamp() {
        this.elapsedTime = (new Date() - this.startTime)/1000;

        let timestamp = this.elapsedTime;
        //if were in m3u mode were passing an object so we have to fetch the url from the object
        if (argv.m3u) {
            //check if the url is remote
            if (this.playlist[this.mediaIndex]['url'].startsWith('http')) {
                console.log(`watching file ${this.playlist[this.mediaIndex]['url']}; ${timestamp}s`);
            }
            //else include localhost for the person watching the backend of this app.
            else console.log(`watching file ${playlistUrl}${this.playlist[this.mediaIndex]['url']}; ${timestamp}s`);
        }
        else {
            console.log(`watching file ${playlistUrl}${this.playlist[this.mediaIndex]}; ${timestamp}s`);
        }

        return timestamp;
    }


}

module.exports = MediaPlayer;
