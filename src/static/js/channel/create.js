$(document).ready(function()
{
    $('body').on('keydown keyup', '.create-channel .url', function(event)
    {
        if($(this).val().length)
        {
            $('.create-channel .preview').val("https://sync.wetfish.net/c/"+$(this).val());
        }
        else
        {
            $('.create-channel .preview').val('');
        }
    });
});
