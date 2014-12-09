var io = false;
var socket = false;
var user = false;
var channels = false;
var stats = false;

module.exports = function(required)
{
    io = required.io;
    socket = required.socket;
    user = required.user;
    channels = required.channels;
    stats = required.stats;

    socket.on('disconnect', function()
    {
        console.log('User disconnected');
        stats.count--;

        // Leave channel if user joined one
        if(typeof user.channel != "undefined")
        {
            if(user.leader)
                channels[user.channel].leader = false;
                
            channels[user.channel].users--;

            socket.leave(user.channel);
            io.to(user.channel).emit('stats', {channel: channels[user.channel].users});

            // If no one is in this channel anymore
            if(channels[user.channel].users == 0)
                delete channels[user.channel];
        }

        io.sockets.emit('stats', {users: stats.count, channels: Object.keys(channels).length});
    });
}
