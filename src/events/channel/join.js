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
    
    socket.on('join', function(channel_url)
    {
        channel_url = channel_url.toString();

        // Get channel data
        model.channel.get({url: channel_url}, function(error, response)
        {
            if(error)
            {
                console.log(error);
                return;
            }

            // This channel must not exist
            if(!response.length)
            {
                // You can't join a channel if it doesn't exist!
                return;
            }

            var channel = response[0];

            // Get user session data
            model.user.session(user.session, function(error, response)
            {
                var session = JSON.parse(response);

                user.channel = channel.url;
                user.color = {h: random_int(0, 360), s: random_int(25, 100), l: random_int(25, 50)};

                socket.join(channel.url);

                if(typeof channels[channel.url] == "undefined")
                {
                    channels[channel.url] = {users: 0, video: {}};
                }

                // If you are the channel creator, you get to be the leader
                if(channel.owner == session.user.user_id)
                {
                    // TODO: Leadership should be based on channel, in case a user joins multiple?
                    user.leader = true;
                }

                channels[channel.url].users++;

                // Tell the user about itself
                socket.emit('join', user);
                socket.emit('time', channels[channel.url].video);

                // Emit other statistics
                io.sockets.emit('stats', {channels: Object.keys(channels).length});
                io.to(channel).emit('stats', {channel: channels[channel.url].users});
                console.log("User joined "+channel.url);
            });
        });
    });
}
