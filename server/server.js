// Start the server
var config = require('./config');
var server = require('wetfish-server').createServer(config);

// Add a custom model
require('./models/example')(server.model);

// Add some routes
require('./routes/pages')(server);
require('./routes/login')(server);
