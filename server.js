const express = require('express');
const enableWs = require('express-ws');
var path = require('path');
const app = express();

enableWs(app);

app.use(express.static(path.join(__dirname, 'client')));

app.ws('/echo', (ws, req) => {
  ws.on('message', msg => {
    ws.send(msg);
  });

  ws.on('close', () => {
    console.log('WebSocket was closed');
  });
});

app.listen(3001, function() {
  console.log('listening on port 3001');
});

