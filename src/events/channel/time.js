var socket = false;
var user = false;
var channels = false;

module.exports = function(required)
{
    io = required.io;
    socket = required.socket;
    user = required.user;
    channels = required.channels;
    
    socket.on('time', function(video)
    {
        if(user.leader)
        {
            channels[user.channel].video.time = video.time;
            io.to(user.channel).emit('time', video);
        }
    });
}
