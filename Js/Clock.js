// === CONFIG ===
let timeLeft = 25; // You can change to 20 if needed
const totalTime = timeLeft;
const timeDisplay = document.getElementById('time');
const outerRing = document.querySelector('.outer-ring');
const endSound = document.getElementById('endSound');

let countdown; // to store interval

// === FUNCTION TO START TIMER ===
function startCountdown() {
  // Prevent multiple intervals
  if (countdown) return;

  countdown = setInterval(() => {
    timeDisplay.textContent = timeLeft;

    // Create circular progress animation
    const progress = ((totalTime - timeLeft) / totalTime) * 360;
    outerRing.style.background = `conic-gradient(#2e82ff ${progress}deg, #1b1b3a ${progress}deg)`;

    // End of countdown
    if (timeLeft <= 0) {
      clearInterval(countdown);
      countdown = null; // reset
      timeDisplay.textContent = '00';
      endSound.play();
    }

    timeLeft--;
  }, 1000);
}

// === LISTEN FOR ENTER KEY ===
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    // Reset timer if finished
    if (!countdown) {
      timeLeft = totalTime;
      outerRing.style.background = `conic-gradient(#2e82ff 0deg, #1b1b3a 0deg)`;
      startCountdown();
    }
  }
});
