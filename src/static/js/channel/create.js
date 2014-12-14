$(document).ready(function()
{
    $('body').on('keydown keyup', '.create-channel .url', function(event)
    {
        $('.create-channel .preview').val("https://sync.wetfish.net/c/"+$(this).val());
    });
});
