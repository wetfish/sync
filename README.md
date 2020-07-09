# Wetfish Sync v0.2

Synchronize HTML5 audio and video between friends!

### Prerequisite Packages
- ffmpeg and ffprobe, Sync uses shell commands in order to determine the length of audio and video files

### How to use

- clone the repository
- cd sync
- npm install
- place mp4,ogv,mp3,flac,oga,wav,webm, or ogg files within /public/media
- npm start

### M3U support

-in order to use an m3u file feature simply start sync like this 'npm run start -- --m3u=/path/to/playlist.m3u'
or node server.js --m3u="path/to/playlist.m3u8"


-the m3u file can be located anywhere on the system, however the files it refrences must be in the public directory. otherwise you'll have a black screen, and a file name that says it's playing on the server backend.

-.webm and .ogg are unsupported filetypes if using the m3u option.


