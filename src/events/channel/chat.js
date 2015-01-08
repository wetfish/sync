var socket = false;
var user = false;
var channels = false;

module.exports = function(required)
{
    io = required.io;
    socket = required.socket;
    user = required.user;
    channels = required.channels;
    
    socket.on('chat', function(chat)
    {
        chat.color = user.color;
        io.sockets.emit('chat', chat);
    });
}
