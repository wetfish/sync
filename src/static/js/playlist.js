var playlist =
{
    list: [],
    index: 0,

    add: function(index, track)
    {
        playlist.list.splice(index, 0, track);
    },

    append: function(track)
    {
        playlist.list.push(track);
    },

    prepend: function(track)
    {
        playlist.list.unshift(track);
    },

    play: function(index)
    {
        playlist.index = index;
        return playlist.playing();
    },

    next: function()
    {
        playlist.index--;

        if(playlist.index < 0)
            playlist.index = playlist.legnth -1;

        return playlist.playing();
    },

    previous: function()
    {
        playlist.index--;

        if(playlist.index < 0)
            playlist.index = playlist.legnth -1;

        return playlist.playing();
    },

    playing: function()
    {
        return playlist.list[playlist.index];
    }
};
