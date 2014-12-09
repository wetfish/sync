// Required local packages
var config = require('./config');
var model = require('./model');
var login = require("../login/sdk/server/wetfish-login");

// Required node packages
var fs = require('fs');

// Required packages from npm
var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

// Main application variables
var app = express();
var ssl_options = {};
var server = {};


if(config.ssl_enabled) 
{
    ssl_options = {
        key: fs.readFileSync(config.ssl_paths.key),
        cert: fs.readFileSync(config.ssl_paths.cert)
    };
    server = require('https').createServer(ssl_options, app);
}
else
{
    server = require('http').createServer(app);
}

var io = require('socket.io')(server);

server.listen(2333);
console.log("Sync Server Started");

login.init(config.login);

// Connect to redis and MySQL
model.connect(config);

// Use the existing connection for session data
app.use(session({
    store: new RedisStore({client: model.redis}),
    secret: config.session.secret
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'hjs');

// Required variables routes need access to
var required = {app: app, model: model, login: login};
var routes = ['index', 'login', 'logout', 'channel', 'user'];

routes.map(function(route)
{
    require(__dirname + '/routes/'+route+'.js')(required);
});

app.use(express.static(__dirname + '/static'));

// Socket variables
var count = 0;
var channels = {};

// Thanks MDN
function random_int(min, max)
{
    max++;
    return Math.floor(Math.random() * (max - min)) + min;
}

io.sockets.on('connection', function(socket)
{
    var user = {};
    var channels = {};

    // Required variables events need access to
    var required = {socket: socket, user: user, channels: channels};
    var events = ['join'] //, 'chat', 'video', 'time', 'disconnect'];

    events.map(function(event)
    {
        require(__dirname + '/events/'+event+'.js')(required);
    });
    
    console.log('User connected');
    socket.emit('connected');
    
    count++;
    io.sockets.emit('stats', {users: count, channels: Object.keys(channels).length});
    
    socket.on('chat', function(chat)
    {
        chat.color = user.color;
        io.sockets.emit('chat', chat);
    });

    socket.on('video', function(video)
    {
        // Only listen to leaders
        if(user.leader)
        {
            channels[user.channel].video = video;
            io.to(user.channel).emit('video', video);
        }
    });

    socket.on('time', function(video)
    {
        if(user.leader)
        {
            channels[user.channel].video.time = video.time;
            io.to(user.channel).emit('time', video);
        }
    });

    socket.on('disconnect', function()
    {
        console.log('User disconnected');
        count--;

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

        io.sockets.emit('stats', {users: count, channels: Object.keys(channels).length});
    });
});
