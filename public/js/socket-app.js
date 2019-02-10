// Make connection
let socket = io.connect('http://localhost:3000')

socket.on('connect', () => {
    document.getElementById('socket-fail').style.visibility = "hidden"
    document.getElementById('socket-success').style.visibility = "visible"
})

socket.on('disconnect', function () {
    document.getElementById('socket-success').style.visibility = "hidden"
    document.getElementById('socket-fail').style.visibility = "visible"
});