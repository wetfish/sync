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

socket.on('newMedia', (data) => {
    console.log(`The next item in the playlist is ${data.url}`);
    vueApp.url = data.url;
    document.getElementById('media-player').load();
    document.getElementById('media-player').play();
});

socket.on('timestamp', (data) => {
    vueApp.serverMsg = data.msg;
});

socket.on('update', (data) => {
    vueApp.mediaType = data.mediaType;
    vueApp.timestamp = data.timestamp;
    vueApp.url = data.url;
    document.getElementById('media-player').currentTime = data.timestamp;
    document.getElementById('media-player').load();
    document.getElementById('media-player').play();
});