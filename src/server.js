// Main application variables
var express = require('express'),
    app = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server);

app.listen(2333);
console.log("Sync Server Started");

//app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res)
{
    console.log("Home page loaded!");
    res.sendFile(__dirname + '/static/index.html');
});

// Socket variables
var count;

io.sockets.on('connection', function(socket)
{
    var user = {};
    
    console.log('User connected');
    socket.emit('connected');
    
    count++;
    io.sockets.emit('count', {count: count});
    
    socket.on('chat', function(chat)
    {
        io.sockets.emit('chat', chat);
    });

    socket.on('disconnect', function()
    {
        console.log('User disconnected');
        count--;
        
        io.sockets.emit('count', {count: count});
    });
});
