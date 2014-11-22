$(document).ready(function()
{
    console.log('Hi!');
    socket = io.connect();

    socket.on('stats', function(stats)
    {
        $('.count').text(stats.count);
    });

    socket.on('chat', function(chat)
    {
        console.log("Chat recieved!", chat);
    });
});
