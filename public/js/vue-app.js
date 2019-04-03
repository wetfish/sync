/*eslint no-unused-vars: 0 */

// Video Vue Component
const videoPlayer = Vue.component('video-player', {
    template: `
        <video id="media-player" autoplay controls>
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
        <audio id="media-player" autoplay controls>
            <source v-bind:src="url">
        </audio>
    `,
    props: ["url", "timestamp", "muted"],
    mounted() {
        mountNewPlayer(this);
    }
});

let vueApp = new Vue ({
    el: "#vue-app",
    data: {
        greeting: "Welcome to Sync",
        serverMsg: 'Waiting for server...',
        url: null,
        mediaElement: null,
        timestamp: null,
        muted: true
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
}