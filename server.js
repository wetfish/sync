const express = require('express');
const socket = require('socket.io');
const MediaPlayer = require('./media-player');

const app = express();
const port = process.env.PORT || 3000;

// Basic Middleware
app.use(express.static(__dirname + '/public'));

// Basic Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/index.html');
});

// Hosted frameworks and libraries
app.get('/vue.js', (req, res) => res.sendFile(__dirname + '/node_modules/vue/dist/vue.js'));
app.get('/socket.io.js', (req, res) => res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js'));

// Start server
let server = app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});

// Socket setup
let io = socket(server);
io.on('connection', (client) => {
    let index = mediaPlayer.mediaIndex;
    let url = mediaPlayer.playlist[index];
    let timestamp = mediaPlayer.getTimestamp();
    let mediaType = mediaPlayer.mediaTypes[index];
    console.log(`Client connected! Now playing ${mediaType} file ${url}. Timestamp: ${timestamp}`);
    client.emit('updateClient', {
        mediaType: mediaType,
        timestamp: timestamp,
        url: url
    });
});

// Start mediaPlayer
let mediaPlayer = new MediaPlayer(io);
mediaPlayer.init();
setInterval(() => {
    let index = mediaPlayer.mediaIndex;
    let total = mediaPlayer.playlist.length;
    let timestamp = mediaPlayer.getTimestamp();
    let mediaType = mediaPlayer.mediaTypes[index];
    let data = {
        humanReadableIndex: index + 1,
        mediaType: mediaType,
        timestamp: timestamp,
        totalFiles: total
    };
    io.sockets.emit('timestamp', data);
}, 3000);