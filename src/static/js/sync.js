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

    socket.on('join', function()
    {
        $('.status').removeClass('secondary').addClass('success');
        $('.status').text("Connected");

        setTimeout(function()
        {
            $('.status').css({opacity: 0});
        }, 2000);
    });

    socket.on('stats', function(stats)
    {
        $('.user .count').text(stats.users);

        if(typeof stats.users != "undefined")
        {
            if(stats.users == 1)
                $('.user .plural').hide();
            else
                $('.user .plural').show();
        }

        if(typeof stats.channel != "undefined")
        {
            $('.channel .count').text(stats.channel);
        }
    });

    socket.on('chat', function(chat)
    {
        console.log("Chat recieved!", chat);
    });
});
