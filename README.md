# Wetfish Sync v0.2

Synchronize HTML5 audio and video between friends!

### Prerequisite Packages
- ffmpeg and ffprobe, Sync uses shell commands in order to determine the length
  of audio and video files

### How to use

- clone the repository
- cd sync
- npm install
- copy .env.example to .env and edit it to suit your needs
- place mp4,ogv,mp3,flac,oga,wav,webm, or ogg files within /public/media. Files
  will be played in lexicographic order. A simple way to ensure they are played
  in the desired order is to prefix the name with a number, e.g. to play
  `foo.mp4` before `bar.webm`, you would name them `01_foo.mp4` and
  `02_bar.webm`.
- npm start
