$(document).ready(function()
{
    console.log('Hi!');
    socket = io.connect();

    socket.on('connected', function()
    {
        var channel = window.location.pathname.substr(1);

        if(channel.length)
        {
            $('.title .channel').text(channel);
            $('.title .channel').css({opacity: 1});
            $('title').text('Sync - '+channel);
            
            socket.emit('join', channel);
        }
    });

    socket.on('stats', function(stats)
    {
        $('.user .count').text(stats.users);

        if(status.users == 1)
            $('.user .plural').hide();
        else
            $('.user .plural').show();
    });

    socket.on('chat', function(chat)
    {
        console.log("Chat recieved!", chat);
    });
});
