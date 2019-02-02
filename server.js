const express = require('express')
const socket = require('socket.io')

const app = express()
const port = process.env.PORT || 3000

// Basic Middleware
app.use(express.static(__dirname + '/public'))

// Basic Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/index.html')
})

// Start server
let server = app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})

// Socket setup
let io = socket(server)
io.on('connection', () => {
    console.log(`Made socket connection with a client`)
})