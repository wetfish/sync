window.addEventListener('DOMContentLoaded', () => {
    // Implement controls for shwing and hiding the progress bar
    // Inspired by https://blog.videojs.com/hiding-and-showing-video-player-controls/

    let controls = document.getElementById('controls-container');
    let startTimer;

    document.addEventListener('mousemove', function(){
        clearTimeout(startTimer);
        controls.classList.add('active');
        startTimer = setTimeout(() => {
            console.log("removing");
            controls.classList.remove('active');
        }, 4000);
    });

    document.addEventListener('keydown', function() {
        if (event.keyCode === 77) {
            document.getElementById('media-player').muted = !document.getElementById('media-player').muted;
        }
    });
    
});