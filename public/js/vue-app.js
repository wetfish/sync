/*eslint no-unused-vars: 0 */

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
        </div>
    `,
    props: ["timestamp", "duration"]
});

let vueApp = new Vue ({
    el: "#vue-app",
    data: {
        greeting: "Welcome to Sync",
        serverMsg: 'Waiting for server...',
        url: null,
        mediaElement: null,
        timestamp: null,
        duration: null,
        muted: true,
        latencyThresholdSeconds: 5
    },
    methods: {},
    computed: {},
    components: {
        "video-player": videoPlayer,
        "audio-player": audioPlayer
    }
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