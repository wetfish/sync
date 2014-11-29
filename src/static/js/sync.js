$(document).foundation();

$(document).ready(function()
{
    var user = {};
    var video = {};
    
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

        if(user.leader)
        {
            $('.leader-only').removeClass('hide');
        }
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

    socket.on('video', function(input)
    {
        video = input;
        
        // If we're not the leader
        if(!user.leader)
        {
            if(video.playing)
                $('.video')[0].play();
            else
                $('.video')[0].pause();
       }
    });

    socket.on('time', function(input)
    {
        video = input;
        
        if(!user.leader)
            $('.video')[0].currentTime = video.time;
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
        if(user.leader)
        {
            video.playing = true;
            socket.emit('video', video);
        }
        
        $('.video')[0].play();
        $(this).removeClass('play').addClass('pause');
        $(this).val('Pause');
    });

    $('body').on('click', '.controls .pause', function()
    {
        if(user.leader)
        {
            video.playing = false;
            socket.emit('video', video);
        }
        
        $('.video')[0].pause();
        $(this).removeClass('pause').addClass('play');
        $(this).val('Play');
    });

    // Update video position when clicking the progress bar
    $('body').on('click', '.controls .progress', function(event)
    {
        // This is the position we clicked relative to the progress bar
        var offset = event.clientX - $(this).offset().left;

        // Find the width of the area we clicked
        var width = (offset / $(this).width()) * 100;

        // Find the time based on the video duration
        var time = $('.video')[0].duration * (width / 100);

        // Make it so
        $('.controls .progress .meter').width(width+"%");
        $('.video')[0].currentTime = time;

        socket.emit('time', {time: time});
    });

    // There's got to be a better way than interval
    setInterval(function()
    {
        // Update debug info
        var client = {time: $('.video')[0].currentTime, playing: ($('.video')[0].paused) ? false: true};

        $('.debug .server').text(JSON.stringify(video));
        $('.debug .client').text(JSON.stringify(client));
        
        if(user.leader)
        {
            video.time = $('.video')[0].currentTime;
            socket.emit('video', video);
        }
        
        var width = (100 / $('.video')[0].duration) * $('.video')[0].currentTime;
        $('.controls .progress .meter').width(width+"%");
    }, 100);


    // If the user is running android, show a modal to capture their click event
    var ua = navigator.userAgent.toLowerCase();
    var android = ua.indexOf("android") > -1;
    if(android)
    {
        $('.android-modal').trigger('click');

        $('body').on('click.android', function()
        {
            // Unbind this event since it only needs to be used once
            $('body').off('click.android');

            $('.reveal-modal .close-reveal-modal').trigger('click');
            
            $('.video')[0].play();
            $('.video')[0].pause();
        });
    }

    // All media events (for debugging and stuff)
    $('.video').on('loadstart progress suspend abort error emptied stalled loadedmetadata loadeddata canplay canplaythrough playing waiting seeking seeked ended durationchange timeupdate play pause ratechange resize volumechange', function(event)
    {
        // Ignore these for now
        if(event.type != 'timeupdate')
        {
            console.log(event.type);
            console.log(event);
        }
    });

    $('.video').on('playing', function()
    {
        if(Math.abs($('.video')[0].currentTime - video.time) > 0.1)
        {
            console.log('oh no');
//            $('.video')[0].currentTime = video.time;
        }
    });
});
