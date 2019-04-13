/*globals vueApp */

// Make connection
let socket = io.connect(location.origin.replace(/^http/, 'ws'));

socket.on('connect', () => {
    document.getElementById('socket-fail').style.visibility = "hidden";
    document.getElementById('socket-success').style.visibility = "visible";
});

socket.on('disconnect', () => {
    document.getElementById('socket-success').style.visibility = "hidden";
    document.getElementById('socket-fail').style.visibility = "visible";
});

// Server emits event when media ends
socket.on('newMedia', (data) => {
    vueApp.url = data.url;
    vueApp.timestamp = 0;
    // Check before updating the type of media player
    if (vueApp.mediaElement != data.mediaType + "-player"){
        vueApp.mediaElement = data.mediaType + "-player";
    } else {
        // If you only change the src attribute, you must load and play 
        document.getElementById('media-player').load();
        document.getElementById('media-player').play();
    }
});

// Server sends timestamp every three seconds
socket.on('timestamp', (data) => {
    const mediaPlayerTime = document.getElementById('media-player').currentTime;
    const serverTime = data.timestamp;
    const latency = serverTime - mediaPlayerTime;
    let msg = `Watching ${data.mediaType} file ${data.humanReadableIndex} of ${data.totalFiles}. Timestamp: ${data.timestamp}s. Latency: ${latency}`;
    vueApp.serverMsg = msg;
});

// Server emits event when client connects
socket.on('updateClient', (data) => {
    vueApp.mediaElement = data.mediaType + "-player";
    vueApp.timestamp = data.timestamp;
    vueApp.url = data.url;
});