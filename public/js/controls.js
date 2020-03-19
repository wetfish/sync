window.addEventListener('DOMContentLoaded', () => {
    // Implement controls for shwing and hiding the progress bar
    // Inspired by https://blog.videojs.com/hiding-and-showing-video-player-controls/

    let controls = document.getElementById('controls-container');
    let cursor = document.querySelector('body');
    let startTimer;

    document.addEventListener('mousemove', function(){
        clearTimeout(startTimer);
        controls.classList.add('active');
        cursor.style.cursor = 'default';
        startTimer = setTimeout(() => {
            console.log("removing");
            controls.classList.remove('active');
            cursor.style.cursor = 'none';  
        }, 4000);
    });

    document.addEventListener('keydown', function(event) {
        if (event.keyCode === 77) {
            document.getElementById('media-player').muted = !document.getElementById('media-player').muted;
        }
    });
    
});