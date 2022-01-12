window.addEventListener('DOMContentLoaded', () => {
    // Implement controls for shwing and hiding the progress bar
    // Inspired by https://blog.videojs.com/hiding-and-showing-video-player-controls/

    const controls = document.getElementById('controls-container');
    const cursor = document.querySelector('body');
    const volume = document.querySelector('.slider');
    let startTimer;

    document.addEventListener('mousemove', function(){
        clearTimeout(startTimer);
        controls.classList.add('active');
        cursor.style.cursor = 'default';
        //we need to turn off pointer events for the slider so it disappears when the mouse is hovered on it
        volume.classList.add('slider-active');
        startTimer = setTimeout(() => {
            console.log("removing");
            controls.classList.remove('active');
            volume.classList.remove('slider-active');
            cursor.style.cursor = 'none';  
        }, 4000);
    });

    document.addEventListener('keydown', function(event) {
        if (event.keyCode === 77) {
           vueApp.$refs.mediaControls.mute();
        }
    });
});