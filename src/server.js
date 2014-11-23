// Main application variables
var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

server.listen(2333);    
console.log("Sync Server Started");

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res)
{
    console.log("Home page loaded!");
    res.sendFile(__dirname + '/static/index.html');
});

app.get('/:room', function(req, res)
{
    console.log("Room loaded!");
    res.sendFile(__dirname + '/static/sync.html');
});

// Socket variables
var count = 0;

io.sockets.on('connection', function(socket)
{
    var user = {};
    
    console.log('User connected');
    socket.emit('connected');
    
    count++;
    io.sockets.emit('stats', {users: count});

    socket.on('join', function(channel)
    {
        // Is this dangerous?
        //socket.join(channel);

        // Maybe this is a better idea...
        channel = channel.toString();
        user.channel = channel;

        socket.join(channel);
        socket.emit('join');

        io.to(channel).emit('stats', {channel: Object.keys(io.sockets.adapter.rooms[channel]).length});
        console.log("User joined "+channel);
    });
    
    socket.on('chat', function(chat)
    {
        io.sockets.emit('chat', chat);
    });

    socket.on('disconnect', function()
    {
        console.log('User disconnected');
        count--;
        
        io.sockets.emit('stats', {users: count});
    });
});
