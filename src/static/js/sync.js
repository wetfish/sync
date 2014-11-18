$(document).ready(function()
{
    console.log('Hi!');
    socket = io.connect();

    socket.on('chat', function(chat)
    {
        console.log("Chat recieved!", chat);
    });
});
