const express = require('express');
const socket = require('socket.io');

require('dotenv').config();

const MediaPlayer = require('./media-player');

const app = express();
const playlistUrl = process.env.URL || 'http://localhost:3000';
const port = process.env.PORT || 3000;
const repeat = process.env.REPEAT;


/*
Actually... all of this stuff should be served by a real webserver, so uploading files to clients doesn't block the websocket thread
*/

// Basic Middleware
app.use(express.static(__dirname + '/public'));
// svg Sprites from Font Awesome
app.use(express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/sprites'));
// Basic Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/index.html');
});

// Hosted frameworks and libraries
app.get('/vue.js', (req, res) => res.sendFile(__dirname + '/node_modules/vue/dist/vue.js'));
app.get('/socket.io.js', (req, res) => res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js'));
app.get('/bulma.min.css',(req,res)=> res.sendFile(__dirname + '/node_modules/bulma/css/bulma.min.css'));
app.get('/fscreen.js', (req, res) => res.sendFile(__dirname + '/node_modules/fscreen/src/index.js'));

// Start server
let server = app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});

// Socket setup
let io = socket(server);
io.on('connection', (client) => {
    let index = mediaPlayer.mediaIndex;
    let url = `${playlistUrl}${mediaPlayer.playlist[index]}`;
    let timestamp = mediaPlayer.getTimestamp();
    let mediaType = mediaPlayer.mediaTypes[index];
    let duration = mediaPlayer.mediaLengths[index];
    console.log(`Client connected! Now playing ${mediaType} file ${url}. Timestamp: ${timestamp}`);
    client.emit('updateClient', {
        mediaType: mediaType,
        timestamp: timestamp,
        duration: duration,
        url: url
    });
});

// Start mediaPlayer
let mediaPlayer = new MediaPlayer(io);
mediaPlayer.init();

// Stop server depending on value given from REPEAT constant
function checkRepeat(repeat, count) {
    if (repeat==='true'||repeat=='') {
        return;
    }
    if (repeat == count) {
            console.log('we have played through the list '+count+' times');
            process.exit('bye bye!');
        }
    if (repeat==='false') {
        if (count == 1) {
            console.log('we have played through the list');
            process.exit('bye bye!');
        }
        return;
    }
}
setInterval(() => {
    let index = mediaPlayer.mediaIndex;
    let total = mediaPlayer.playlist.length;
    let timestamp = mediaPlayer.getTimestamp();
    let mediaType = mediaPlayer.mediaTypes[index];
    let playlistCount = mediaPlayer.playlistCount;
    let data = {
        humanReadableIndex: index + 1,
        mediaType: mediaType,
        timestamp: timestamp,
        totalFiles: total
    };
    checkRepeat(repeat,playlistCount);
    io.sockets.emit('timestamp', data);
}, 3000);
