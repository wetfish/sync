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
    vueApp.mediaElement = data.mediaType + "-player";
    vueApp.url = data.url;
    vueApp.timestamp = 0;
    // Move to lifecycle event
    document.getElementById('media-player').load();
    document.getElementById('media-player').play();
});

// Server sends timestamp every three seconds
socket.on('timestamp', (data) => {
    vueApp.serverMsg = data.msg;
});

// Server emits event when client connects
socket.on('updateClient', (data) => {
    vueApp.mediaElement = data.mediaType + "-player";
    vueApp.timestamp = data.timestamp;
    vueApp.url = data.url;
});