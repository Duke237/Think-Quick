// Countdown variables
let countdown;
let timeLeft = 0;
let isRunning = false;
const timeDisplay = document.getElementById('time');

// Initialize display to 00
timeDisplay.textContent = '00';

// Function to play Steve Harvey-style buzzer sound (when time is requested)
function playStartSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create multiple oscillators for rich buzzer sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Steve Harvey-style buzzer - two tones together
    oscillator1.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
    
    oscillator2.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    oscillator1.type = 'square';
    oscillator2.type = 'square';
    
    // Sharp attack and release for buzzer effect
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.3);
    oscillator2.stop(audioContext.currentTime + 0.3);
    
    console.log('🔊 Steve Harvey-style buzzer played!');
}

// Function to play countdown beep sound
function playCountdownBeep() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Clear beep sound for countdown
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Function to play bell sound (when timer hits 00)
function playEndSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create bell-like sound with multiple harmonics
    const fundamental = audioContext.createOscillator();
    const harmonic1 = audioContext.createOscillator();
    const harmonic2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    fundamental.connect(gainNode);
    harmonic1.connect(gainNode);
    harmonic2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Bell frequencies (fundamental + harmonics)
    fundamental.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    fundamental.frequency.exponentialRampToValueAtTime(330, audioContext.currentTime + 0.8);
    
    harmonic1.frequency.setValueAtTime(880, audioContext.currentTime); // Octave
    harmonic1.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.8);
    
    harmonic2.frequency.setValueAtTime(1320, audioContext.currentTime); // Fifth
    harmonic2.frequency.exponentialRampToValueAtTime(990, audioContext.currentTime + 0.8);
    
    fundamental.type = 'sine';
    harmonic1.type = 'sine';
    harmonic2.type = 'sine';
    
    // Bell envelope - slow attack, slow decay
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);
    
    fundamental.start(audioContext.currentTime);
    harmonic1.start(audioContext.currentTime);
    harmonic2.start(audioContext.currentTime);
    fundamental.stop(audioContext.currentTime + 1.0);
    harmonic1.stop(audioContext.currentTime + 1.0);
    harmonic2.stop(audioContext.currentTime + 1.0);
    
    console.log('🔔 Bell sound - Time is up!');
}

// Function to start the countdown with beeping sound
function startCountdown() {
    if (isRunning || timeLeft <= 0) {
        console.log('Cannot start - already running or no time set');
        return;
    }
    
    isRunning = true;
    console.log('Countdown started with beeping sound');
    
    // Play first beep immediately
    playCountdownBeep();
    
    countdown = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        // Update the outer ring progress
        updateProgressRing();
        
        // Play beep sound for each second (except when reaching 0)
        if (timeLeft > 0) {
            playCountdownBeep();
        }
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            isRunning = false;
            console.log('Countdown finished!');
            playEndSound(); // Play the bell sound
            timeDisplay.textContent = '00';
            resetProgressRing();
        }
    }, 1000);
}

// Function to set the timer based on voice command
function setTimer(seconds) {
    if (isRunning) {
        console.log('Cannot set timer - countdown is running');
        return;
    }
    
    timeLeft = seconds;
    updateDisplay();
    playStartSound(); // Play the Steve Harvey-style buzzer
    resetProgressRing();
    console.log(`Timer set to ${seconds} seconds`);
}

// Function to update the display
function updateDisplay() {
    timeDisplay.textContent = timeLeft.toString().padStart(2, '0');
}

// Function to update the progress ring
function updateProgressRing() {
    const outerRing = document.querySelector('.outer-ring');
    if (timeLeft > 0) {
        const maxTime = 30; // Maximum expected time
        const progressPercentage = ((maxTime - timeLeft) / maxTime) * 360;
        outerRing.style.background = `conic-gradient(#2e82ff ${progressPercentage}deg, #1b1b3a ${progressPercentage}deg)`;
    }
}

// Function to reset the progress ring
function resetProgressRing() {
    const outerRing = document.querySelector('.outer-ring');
    outerRing.style.background = `conic-gradient(#1b1b3a 0deg, #1b1b3a 360deg)`;
}

// Function to reset the timer
function resetTimer() {
    clearInterval(countdown);
    timeLeft = 0;
    isRunning = false;
    timeDisplay.textContent = '00';
    resetProgressRing();
    console.log('Timer reset to 00');
}

// Voice recognition setup - FIXED to work from first time
function setupVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.log('Speech recognition not supported in this browser');
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Ensure audio context is ready for first sound
    let audioContextReady = false;
    
    recognition.onresult = function(event) {
        // Ensure we have a final result
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                const transcript = event.results[i][0].transcript.toLowerCase();
                
                console.log('🎤 Voice command:', transcript);
                
                // Check for different time requests
                if (transcript.includes('can i please have 25 seconds on the clock please')) {
                    console.log('✅ 25 seconds requested!');
                    setTimer(25);
                    break;
                }
                else if (transcript.includes('can i please have 20 seconds on the clock please')) {
                    console.log('✅ 20 seconds requested!');
                    setTimer(20);
                    break;
                }
                else if (transcript.includes('can i please have 15 seconds on the clock please')) {
                    console.log('✅ 15 seconds requested!');
                    setTimer(15);
                    break;
                }
                else if (transcript.includes('can i please have 10 seconds on the clock please')) {
                    console.log('✅ 10 seconds requested!');
                    setTimer(10);
                    break;
                }
                else if (transcript.includes('can i please have 30 seconds on the clock please')) {
                    console.log('✅ 30 seconds requested!');
                    setTimer(30);
                    break;
                }
            }
        }
    };
    
    recognition.onerror = function(event) {
        console.log('Speech recognition error:', event.error);
    };
    
    recognition.onend = function() {
        // Always restart recognition
        setTimeout(() => {
            try {
                recognition.start();
                console.log('🔄 Voice recognition restarted');
            } catch (e) {
                console.log('Error restarting recognition:', e);
            }
        }, 500);
    };
    
    // Start recognition
    try {
        recognition.start();
        console.log('🎤 Voice recognition started successfully');
    } catch (e) {
        console.log('Error starting recognition:', e);
    }
}

// Keyboard event listener
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        if (timeLeft > 0 && !isRunning) {
            startCountdown();
        } else if (timeLeft === 0) {
            console.log('Please request time first using voice command');
        }
    } else if (event.key === 'Escape') {
        resetTimer();
    }
});

// Initialize the application - FIXED for first-time sound
function init() {
    // Set initial display to 00
    timeDisplay.textContent = '00';
    resetProgressRing();
    
    // Warm up audio context (fixes first-time sound issue)
    const warmUpAudioContext = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.001);
        
        console.log('🔊 Audio context warmed up - sounds ready!');
    };
    
    // Warm up audio on first user interaction
    document.addEventListener('click', function warmUp() {
        warmUpAudioContext();
        document.removeEventListener('click', warmUp);
    }, { once: true });
    
    // Setup voice recognition
    setupVoiceRecognition();
    
    console.log('⏰ THINK QUICK COUNTDOWN READY!');
    console.log('🎯 Say: "Can I please have [10/15/20/25/30] seconds on the clock please"');
    console.log('🎯 Press ENTER to start countdown');
    console.log('🎯 Press ESC to reset to 00');
    console.log('');
    console.log('🔊 NEW SOUNDS:');
    console.log('   - Start: Steve Harvey-style buzzer (when time requested)');
    console.log('   - Countdown: Clear beep (each second)');
    console.log('   - End: Beautiful bell sound (when reaches 00)');
}

// Start the application when the page loads
window.addEventListener('load', init);