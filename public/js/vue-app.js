/*eslint no-unused-vars: 0 */

// Video Vue Component
const videoPlayer = Vue.component('video-player', {
    template: `
        <video id="media-player" controls>
            <source v-bind:src="url">
        </video>
    `,
    props: ["url", "timestamp"],
    mounted() {
        document.getElementById('media-player').currentTime = this.timestamp;
        document.getElementById('media-player').play();
    }
});

// Vue Audio Component
const audioPlayer = Vue.component('audio-player', {
    template: `
        <audio id="media-player" controls>
            <source v-bind:src="url">
        </audio>
    `,
    props: ["url", "timestamp"],
    mounted() {
        document.getElementById('media-player').currentTime = this.timestamp;
        document.getElementById('media-player').play();
    }
});

let vueApp = new Vue ({
    el: "#vue-app",
    data: {
        greeting: "Welcome to Sync",
        serverMsg: 'Waiting for server...',
        url: null,
        mediaElement: null,
        timestamp: null
    },
    methods: {},
    computed: {},
    components: {
        "video-player": videoPlayer,
        "audio-player": audioPlayer
    }
});