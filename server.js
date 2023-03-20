const express = require('express');
const socket = require('socket.io');

require('dotenv').config();

const MediaPlayer = require('./media-player');
const backendControl = require('./backendControl');
const app = express();
const playlistUrl = process.env.URL || 'http://localhost:3000';
const port = process.env.PORT || 3000;



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
app.get('/fscreen.js', (req, res) => res.sendFile(__dirname + '/node_modules/fscreen/dist/fscreen.esm.js'));

// Start server
const server = app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});

// Socket setup
let io = socket(server);

backendControl(io,MediaPlayer);


