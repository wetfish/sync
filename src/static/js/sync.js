$(document).ready(function()
{
    console.log('Hi!');
    socket = io.connect();

    socket.on('connected', function()
    {
        var channel = window.location.pathname.substr(1);

        $('.bottom-bar .channel').text(channel);
        $('.bottom-bar .channel').css({opacity: 1});
        
        socket.emit('join', channel);
    });

    socket.on('stats', function(stats)
    {
        $('.count').text(stats.count);
    });

    socket.on('chat', function(chat)
    {
        console.log("Chat recieved!", chat);
    });
});
