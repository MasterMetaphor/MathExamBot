document.addEventListener('DOMContentLoaded', () => {
    const mascot = document.getElementById('mascot');
    if (mascot && mascot.dataset.frames) {
        const frames = JSON.parse(mascot.dataset.frames.replace(/'/g, '"'));
        let currentFrame = 0;
        setInterval(() => {
            currentFrame = (currentFrame + 1) % frames.length;
            mascot.src = `./static/${frames[currentFrame]}`;
        }, 500);
    }
});
