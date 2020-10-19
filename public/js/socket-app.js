/*globals vueApp */

// Make connection
let socket = io.connect(location.origin.replace(/^http/, 'ws'));

socket.on('connect', () => {
    //document.getElementById('socket-fail').style.visibility = "hidden";
    //document.getElementById('socket-success').style.visibility = "visible";
});

socket.on('disconnect', () => {
    //document.getElementById('socket-success').style.visibility = "hidden";
    //document.getElementById('socket-fail').style.visibility = "visible";
});

// Server emits event when media ends
socket.on('newMedia', (data) => {
    vueApp.duration = data.duration;
    vueApp.url = data.url;
    vueApp.timestamp = 0;
    vueApp.latency = 0;
    const mediaPlayer = document.getElementById('media-player');
    // Automatically play the next item if the player is not paused
    if (!mediaPlayer.paused) {
        // Check before updating the type of media player
        if (vueApp.mediaElement != data.mediaType + "-player"){
            vueApp.mediaElement = data.mediaType + "-player";
        } else {
            // If you only change the src attribute, you must load and play 
            mediaPlayer.load();
            mediaPlayer.play();
        }
    } else {
        // Keep track of the media element that should be rendered
        vueApp.serverMediaType = data.mediaType;
        // And raise a flag
        vueApp.newMediaReceivedDuringPause = true;
        mediaPlayer.load();
    }
});

// Server sends timestamp every three seconds
// Calculate latency and update Vue component
socket.on('timestamp', (data) => {
    const mediaPlayer = document.getElementById('media-player');
    const mediaPlayerTime = mediaPlayer.currentTime;
    const serverTime = data.timestamp;
    const latency = vueApp.newMediaReceivedDuringPause ? 0 : serverTime - mediaPlayerTime;
    let msg = `Watching ${data.mediaType} file ${data.humanReadableIndex} of ${data.totalFiles}. Timestamp: ${data.timestamp}s. Latency: ${latency}`;
    vueApp.serverMsg = msg;
    vueApp.latency = latency;
    vueApp.serverTime = data.timestamp;
    //create a new date object for caculating time since last server message
    vueApp.heartBeat = new Date().getTime();
    //if the latency is over the threshold, then sync it back up
    if(Math.abs(vueApp.latency) >= vueApp.latencyThresholdSeconds) {
        vueApp.timestamp = data.timestamp;
    }
});

// Server emits event when client connects
socket.on('updateClient', (data) => {
    vueApp.mediaElement = data.mediaType + "-player";
    vueApp.serverMediaType = data.mediaType;
    vueApp.timestamp = data.timestamp;
    vueApp.duration = data.duration;
    vueApp.url = data.url;
});

