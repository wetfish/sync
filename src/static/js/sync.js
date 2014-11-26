$(document).foundation();

$(document).ready(function()
{
    var user = {};
    
    // Socket handling code
    if(typeof config != "undefined" && typeof config.websocket != "undefined")
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

    socket.on('join', function(user_data)
    {
        user = user_data;
        $('.account').trigger('change');

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
        $('.chat-wrap').scrollTop($('.chat-wrap .messages').height());
    });

    // User triggered behavior
    $('body').on('submit', '.input-form', function(event)
    {
        event.preventDefault();

        var message = $(this).find('.message').val();
        $(this).find('.message').val('');

        socket.emit('chat', {'user': user.name, message: message});
    });

    $('body').on('submit', '.name-form', function(event)
    {        
        event.preventDefault();
        user.nick = $(this).find('.name').val();
        user.name = user.nick;
        
        $('.account option[value="custom"]').text(user.name);
        $('.account').trigger('change');

        $('.name-form').hide();
        $('.input-form').fadeIn();
        $('.input-form .message').focus();
    });

    $('body').on('change', '.account', function()
    {
        if($(this).val() == "custom")
        {
            if(typeof user.nick == "undefined")
            {
                $('.input-form').hide();
                $('.name-form').removeClass('hide').hide().fadeIn();
                $('.name-form .name').focus();
            }
            else
            {
                user.name = user.nick;
            }
        }
        else
        {
            $('.name-form').hide();
            $('.input-form').fadeIn();

            user.name = 'Anonymous';
        }
    });

    $('body').on('click', '.controls .play', function()
    {
        $('.video')[0].play();
        $(this).removeClass('play').addClass('pause');
        $(this).val('Pause');
    });

    $('body').on('click', '.controls .pause', function()
    {
        $('.video')[0].pause();
        $(this).removeClass('pause').addClass('play');
        $(this).val('Play');
    });
});
