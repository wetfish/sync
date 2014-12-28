var socket = false;
var user = false;
var channels = false;
var model = false;

// Thanks MDN
function random_int(min, max)
{
    max++;
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = function(required)
{
    io = required.io;
    socket = required.socket;
    user = required.user;
    channels = required.channels;
    model = required.model;
    
    socket.on('join', function(channel)
    {
        channel = channel.toString();

        // Get channel data
        model.channel.get({url: channel}, function(error, response)
        {
            console.log(response);
            
            user.channel = channel;
            user.color = {h: random_int(0, 360), s: random_int(25, 100), l: random_int(25, 50)};

            socket.join(channel);

            if(typeof channels[channel] == "undefined")
            {
                // We should probably store the leader's session ID?
                channels[channel] = {users: 0, leader: false, video: {}};
            }

            // If there is no leader, you get to be a leader!
            if(!channels[channel].leader)
            {
                channels[channel].leader = true;

                // TODO: Leadership should be based on channel, in case a user joins multiple?
                user.leader = true;
            }

            channels[channel].users++;

            // Tell the user about itself
            socket.emit('join', user);
            socket.emit('time', channels[channel].video);

            // Emit other statistics
            io.sockets.emit('stats', {channels: Object.keys(channels).length});
            io.to(channel).emit('stats', {channel: channels[channel].users});
            console.log("User joined "+channel);
        });
    });
}
