var socket = false;
var user = false;
var channels = false;

module.exports = function(required)
{
    io = required.io;
    socket = required.socket;
    user = required.user;
    channels = required.channels;
    
    socket.on('video', function(video)
    {
        // Only listen to leaders
        if(user.leader)
        {
            channels[user.channel].video = video;
            io.to(user.channel).emit('video', video);
        }
    });
}
