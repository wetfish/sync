
// Video Vue Component
const videoPlayer = Vue.component('video-player', {
    template: `
        <video id="media-player" autoplay>
            <source v-bind:src="url">
        </video>
    `,
    props: ["url", "timestamp", "muted"],
    mounted() {
        mountNewPlayer(this);
    }
});

// Vue Audio Component
const audioPlayer = Vue.component('audio-player', {
    template: `
        <audio id="media-player" autoplay>
            <source v-bind:src="url">
        </audio>
    `,
    props: ["url", "timestamp", "muted"],
    mounted() {
        mountNewPlayer(this);
    }
});

const mediaPlayerControls = Vue.component('media-player-controls', {
    template: `
        <div id="controls-container">
            <progress v-bind:value="timestamp" v-bind:max="duration"></progress>
            <div class="button-container">
                <div class="left-side-buttons">
                    <a id="play" v-on:click="play()">
                        <svg class="icon">
                            <use xlink:href="regular.svg#play-circle"></use>
                        </svg>
                    </a>
                    <a id="mute" @click="mute">
                        <svg class="icon">
                            <use :xlink:href="volumeStatus"></use>
                        </svg>
                    </a>
                    <div id="vol">
                        <input class="slider" type="range" min="0" max="100" @input="changeVolume" v-model="volume"/>
                    </div>
                </div>
                
                <div class="right-side-buttons">
                    <a id="resync" class="is-pulled-right" v-on:click="resync">
                        <svg class="icon">
                            <use xlink:href="solid.svg#redo-alt"></use>
                        </svg>
                    </a>
                    <a id="fullscreen" class="is-pulled-right" v-on:click="fullscreen">
                        <svg class="icon">
                            <use xlink:href="solid.svg#expand"></use>
                        </svg>
                    </a>
                </div>
            </div>
            <a class="modal is-active" v-on:click="play()">
                <svg class="icon-large">
                    <use xlink:href="regular.svg#play-circle"></use>
                </svg>
            </a>
        </div>
    `,
    props: ["timestamp", "duration"],
    data:function() {
        return {
            volume:0,
            muteIcons: {
            //declare icons for easy access
                volumeOff:'solid.svg#volume-off',
                volumeLow:'solid.svg#volume-down',
                volumeUp:'solid.svg#volume-up',
                muted:'solid.svg#volume-mute'
            },
            volumeStatus:''
        };
    },
    methods: {
        fullscreen: function() {
            if (!fscreen.fullscreenElement) {
                let video = document.querySelector("#vue-app");
                fscreen.requestFullscreen(video);
            } else {
                fscreen.exitFullscreen();
            }
        },
        play: function() {

            let mediaPlayer = document.getElementById("media-player");
            let playbutton = document.querySelector("#play svg use");
            let startbutton = document.querySelector(".modal");

            if (mediaPlayer.paused) {
                playbutton.setAttribute('xlink:href','regular.svg#pause-circle');
                startbutton.classList.remove("is-active");
                mediaPlayer.play();
                mediaPlayer.muted = false;
            }
            else if(!mediaPlayer.paused) {
                playbutton.setAttribute('xlink:href','regular.svg#play-circle');
                mediaPlayer.pause();
            }
            //call this.changeVolume to set the volume icon properly
            this.changeVolume();
        },
        resync: function () {
            let mediaPlayer = document.getElementById("media-player");

            // get the difference of the last server heart beat in seconds
            let lastHeartBeatOffset = ((new Date().getTime() - vueApp.heartBeat )/1000);
            mediaPlayer.currentTime = vueApp.serverTime+lastHeartBeatOffset;  
        },
        changeVolume: function (){
            // get the media player element and set it's volume to whatever the slider value is

            let mediaPlayer = document.querySelector("#media-player");
            mediaPlayer.volume = this.volume*.01;

            // update our icon status while were at it.
            if (!mediaPlayer.muted) {
                if (this.volume == 0 ) {
                    this.volumeStatus = this.muteIcons.volumeOff;
                }
                else if (this.volume < 90 ) {
                    this.volumeStatus = this.muteIcons.volumeLow;
                }
                else if (this.volume >= 90 ) {
                    this.volumeStatus = this.muteIcons.volumeUp;
                }
            }
            

        },
        mute: function () {
            //get the media element and make mute/unmute toggle
            let mediaPlayer = document.querySelector("#media-player");

            if (mediaPlayer.muted != true) {
                this.volumeStatus = this.muteIcons.muted;
                mediaPlayer.muted = true;
            }
            else {
                //else mute the element and call changeVolume() to set the icon
                mediaPlayer.muted = false;
                this.changeVolume();
            }
        }
    },
    mounted() {
        //get the mediaPlayer element set up default volume
        let mediaPlayer = document.querySelector("#media-player");
        this.volume = this.$attrs.appvolume;
        this.volumeStatus = this.muteIcons.muted;
        mediaPlayer.volume = this.volume*.01;
    }
});

let vueApp = new Vue ({
    el: "#vue-app",
    data: {
        greeting: "Welcome to Sync",
        serverMsg: 'Waiting for server...',
        url: null,
        appVolume:75,
        serverTime:null,
        mediaElement: null,
        timestamp: null,
        duration: null,
        muted: true,
        heartBeat:null,
        latencyThresholdSeconds: 5
    },
    components: {
        "video-player": videoPlayer,
        "audio-player": audioPlayer,
    },
});

function mountNewPlayer(mediaComponent) {
    let mediaElement = document.getElementById('media-player');
    mediaElement.muted = mediaComponent.muted;
    mediaElement.currentTime = mediaComponent.timestamp;
    mediaElement.addEventListener('volumechange', () => {
        // Update the muted property of the parent element
        vueApp.muted = document.getElementById('media-player').muted;
    });

    mediaElement.addEventListener('timeupdate', (event) => {
        vueApp.timestamp = mediaElement.currentTime;
    });
    mediaElement.pause();
    mediaElement.addEventListener('play', () => {
        const mediaPlayer = document.getElementById('media-player');
        // If the flag was raised, load and play the newest content. Reset flag.
        // Else if the latency is too large (ex: user pause or lag), syncronize
        if (vueApp.newMediaReceivedDuringPause) {
            mediaPlayer.load();
            mediaPlayer.currentTime = vueApp.timestamp;
            mediaPlayer.play();
            vueApp.newMediaReceivedDuringPause = false;
        } else if (vueApp.latency > vueApp.latencyThresholdSeconds) {
            // In order to catch latency issues, make sure that the latency
            // threshold is greater than the websocket timestamp interval
            mediaPlayer.currentTime = vueApp.timestamp;
        }
    });
}
