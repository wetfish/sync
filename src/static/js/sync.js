$(document).foundation();

$(document).ready(function()
{
    // Socket handling code
    if(typeof config.websocket != "undefined")
        socket = io.connect(config.websocket);
    else
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
        if(typeof stats.users != "undefined")
        {
            $('.user .count').text(stats.users);

            if(stats.users == 1)
                $('.user .plural').hide();
            else
                $('.user .plural').show();
        }

        if(typeof stats.channels != "undefined")
        {
            $('.channel .count').text(stats.channels);

            if(stats.channels == 1)
                $('.channel .plural').hide();
            else
                $('.channel .plural').show();
        }

        if(typeof stats.channel != "undefined")
        {
            $('.channel .count').text(stats.channel);
        }
    });

    socket.on('chat', function(chat)
    {
        console.log("Chat recieved!", chat);

        var template = $('.chat-wrap .template').clone();
        template.find('.user').text(chat.user);
        template.find('.user').css({color: 'hsl('+chat.color.h+', '+chat.color.s+'%, '+chat.color.l+'%)'});
        template.find('.message').text(chat.message);

        template.removeClass('template hide').addClass('chat');

        // Append new message to the messages list and scroll to the bottom
        $('.chat-wrap .messages').append(template);
        $('.chat-wrap .messages').scrollTop($('.chat-wrap .messages').height());
    });

    // User triggered behavior
    $('body').on('submit', '.input-form', function(event)
    {
        event.preventDefault();

        var message = $(this).find('.message').val();
        $(this).find('.message').val('');

        socket.emit('chat', {'user': 'Anonymous', message: message});
    });
});
