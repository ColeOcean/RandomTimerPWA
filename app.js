let timerInterval;
let startTime;
let endTime;
const buzzerSound = document.getElementById('buzzerSound');
let buzzerPreloaded = false; // Flag for first load

document.getElementById('startBtn').addEventListener('click', startRandomTimer);
document.getElementById('resetBtn').addEventListener('click', resetTimer);

function updateDisplay(currentElapsed) {
    const totalSeconds = Math.floor(currentElapsed);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((currentElapsed % 1) * 100);
    const newText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = newText;
    console.log('Display updated to:', newText); // Debug log
}

function startRandomTimer() {
    console.log('Start button clicked'); // Debug
    const randomSeconds = (Math.random() * 14.49) + 0.50; // 0.50–14.99s (hidden, min for sync buffer)
    startTime = Date.now();
    endTime = startTime + (randomSeconds * 1000); // Secret expiration—known ahead
    document.getElementById('startBtn').textContent = 'Running...';
    document.getElementById('startBtn').disabled = true;
    document.getElementById('resetBtn').style.display = 'inline-block';
    updateDisplay(0);

    // Preload buzzer on first user gesture (no lag on expiration)
    if (!buzzerPreloaded) {
        buzzerSound.currentTime = 0.5; // Scrub to mid-file (buzzer start)
        buzzerSound.play().then(() => {
            buzzerSound.pause(); // Pause after load—ready to resume
            buzzerPreloaded = true;
            console.log('Buzzer preloaded and cued at 0.5s');
        }).catch(e => console.log('Preload failed:', e));
    }

    timerInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = (currentTime - startTime) / 1000;
        updateDisplay(elapsed);
        
        // Frontload audio ~750ms early (hidden—syncs sound to exact visual flash on iOS)
        const audioLeadTime = 750; // Nudged for extra 1/4s latency
        if (currentTime >= endTime - audioLeadTime && buzzerSound.paused) {
            buzzerSound.play(); // Starts early—buzzer peaks at flash
            console.log('Audio frontloaded', audioLeadTime + 'ms early');
        }
        
        if (currentTime >= endTime) {
            clearInterval(timerInterval);
            alertUser();
        }
    }, 100);
}

function resetTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    document.getElementById('startBtn').textContent = 'Start Timer';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('timerDisplay').textContent = '00:00.00';
    document.getElementById('resetBtn').style.display = 'none';
    buzzerSound.pause(); // Reset audio state
    buzzerSound.currentTime = 0.5; // Re-cue
}

function alertUser() {
    console.log('Alert triggered'); // Debug
    document.body.classList.add('alert');
    document.getElementById('timerDisplay').textContent = 'BUZZ!'; // Visual on exact endTime
    // Audio already frontloaded—peaks here for sync
    setTimeout(() => {
        document.body.classList.remove('alert');
        document.getElementById('timerDisplay').textContent = '00:00.00';
        buzzerSound.pause(); // Pause after buzz for reuse
        buzzerSound.currentTime = 0.5; // Re-cue
    }, 3000);

    setTimeout(() => {
        document.getElementById('startBtn').textContent = 'Start Timer';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('resetBtn').style.display = 'none';
        document.getElementById('timerDisplay').textContent = '00:00.00';
    }, 3000);
}