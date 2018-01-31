const express = require('express');
var path = require('path');
const app = express();
const io = require('socket.io')();

const port = 8000;

//socket routes
io.on('connection', (client) => {
  client.on('subscribeToTimer', (interval) => {
    console.log('client is subscribing to timer with interval ', interval);
    setInterval(() => {
      client.emit('timer', new Date());
    }, interval);
  });
});

io.listen(port);
console.log('listening on port ', port);

//express routes
app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => res.send('Hello World!'));


app.listen(process.env.PORT || 3001, () => {
  console.log('listening on port 3001');
});

