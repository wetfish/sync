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
    alert(`The next item in the playlist is ${data.url}`);
});

socket.on('timestamp', (data) => {
    vueApp.serverMsg = data.msg;
});