
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
            <div>
                <a id="play" v-on:click="play()">
                    <svg class="icon">
                        <use xlink:href="regular.svg#play-circle"></use>
                    </svg>
                </a>
                <a id="fullscreen" class="is-pulled-right" v-on:click="fullscreen()">
                    <svg class="icon">
                        <use xlink:href="solid.svg#expand"></use>
                    </svg>
                </a>
                 <a id="resync" class="is-pulled-right" v-on:click="resync()">
                    <svg class="icon">
                        <use xlink:href="solid.svg#redo-alt"></use>
                    </svg>
                </a>
                <a class="modal is-active" v-on:click="play()">
                    <svg class="icon-large">
                        <use xlink:href="regular.svg#play-circle"></use>
                    </svg>
                </a>
            </div>
        </div>
    `,
    props: ["timestamp", "duration"],
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
        },
        resync: function () {
            let mediaPlayer = document.getElementById("media-player");
            mediaPlayer.currentTime = vueApp.serverTime+((new Date().getTime() - vueApp.heartBeat )/1000);  
        }
    }
});

let vueApp = new Vue ({
    el: "#vue-app",
    data: {
        greeting: "Welcome to Sync",
        serverMsg: 'Waiting for server...',
        url: null,
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
        "audio-player": audioPlayer
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
