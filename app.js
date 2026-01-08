// Check if running inside Telegram
const isTelegram = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData !== '';
const tg = isTelegram ? window.Telegram.WebApp : null;

// Initialize Telegram Web App if available
if (tg) {
    tg.expand();
    tg.enableClosingConfirmation();
}

// Game state
let score = 0;
let isShaking = false;
let lastShakeTime = 0;
let ornamentsOnTree = 0;
let maxOrnaments = 20;
let shakeCount = 0;
let nextOrnamentShake = getRandomOrnamentDelay();

// Christmas ornament emojis
const fruitEmojis = ['🎁', '⭐', '🔔', '🎀', '❄️', '🧦', '🕯️', '🎅'];

// DOM elements
const scoreElement = document.getElementById('score');
const shakeIndicator = document.getElementById('shakeIndicator');
const fruitsContainer = document.getElementById('fruitsContainer');
const fallingItems = document.getElementById('fallingItems');
const resetBtn = document.getElementById('resetBtn');
const tree = document.querySelector('.tree');

// Shake detection variables
let lastX = 0, lastY = 0, lastZ = 0;
let shakeThreshold = 12; // Lower threshold for easier shake detection

// Get random delay for next ornament (5-10 shakes)
function getRandomOrnamentDelay() {
    return Math.floor(Math.random() * 6) + 5; // Random between 5 and 10
}

// Initialize game
function initGame() {
    score = 0;
    ornamentsOnTree = 0;
    shakeCount = 0;
    nextOrnamentShake = getRandomOrnamentDelay();
    updateScore();
    fruitsContainer.innerHTML = '';
    fallingItems.innerHTML = '';
    setupShakeDetection();
}

// Add ornament to tree when shaking
function addOrnamentToTree() {
    if (ornamentsOnTree >= maxOrnaments) return;

    const ornament = document.createElement('div');
    ornament.className = 'fruit on-tree';
    ornament.textContent = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];

    // Random position on tree
    const leftPercent = 30 + Math.random() * 40; // 30-70% for tree width
    const topPercent = 15 + Math.random() * 35; // 15-50% for tree height
    ornament.style.left = leftPercent + '%';
    ornament.style.top = topPercent + '%';
    ornament.style.opacity = '0';

    fruitsContainer.appendChild(ornament);
    ornamentsOnTree++;

    // Fade in animation
    setTimeout(() => {
        ornament.style.transition = 'opacity 0.3s';
        ornament.style.opacity = '1';
    }, 10);

    // Auto-fall after 2-4 seconds
    const fallDelay = 2000 + Math.random() * 2000;
    setTimeout(() => {
        if (ornament.parentNode) {
            makeOrnamentFall(ornament);
        }
    }, fallDelay);
}

// Setup shake detection
function setupShakeDetection() {
    // Always add click handler as fallback
    tree.addEventListener('click', () => {
        shake();
    });

    // Add touch handler for mobile
    tree.addEventListener('touchstart', (e) => {
        e.preventDefault();
        shake();
    });

    if (window.DeviceMotionEvent) {
        // Request permission for iOS 13+
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            shakeIndicator.textContent = 'Tap tree or shake to grow';
        } else {
            shakeIndicator.textContent = 'Shake to grow ornaments!';
        }
        window.addEventListener('devicemotion', handleMotion, true);
    } else {
        shakeIndicator.textContent = 'Tap tree to grow!';
    }
}

// Handle device motion
function handleMotion(event) {
    const current = event.accelerationIncludingGravity;

    if (!current.x || !current.y || !current.z) {
        return;
    }

    const deltaX = Math.abs(current.x - lastX);
    const deltaY = Math.abs(current.y - lastY);
    const deltaZ = Math.abs(current.z - lastZ);

    if (deltaX + deltaY + deltaZ > shakeThreshold) {
        const now = Date.now();

        // Allow more frequent shakes (minimum 300ms between shakes)
        if (now - lastShakeTime > 300) {
            lastShakeTime = now;
            shake();
        }
    }

    lastX = current.x;
    lastY = current.y;
    lastZ = current.z;
}

// Shake the tree
function shake() {
    if (isShaking) return;

    isShaking = true;
    tree.classList.add('shake');
    shakeIndicator.textContent = 'Keep shaking!';
    shakeIndicator.classList.add('shaking');

    // Increment shake count
    shakeCount++;

    // Only add ornaments when we reach the random shake count
    if (shakeCount >= nextOrnamentShake) {
        const numToAdd = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < numToAdd; i++) {
            addOrnamentToTree();
        }
        // Reset counter and get new random delay
        shakeCount = 0;
        nextOrnamentShake = getRandomOrnamentDelay();
    }

    // Vibrate device if supported
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }

    // Use Telegram haptic feedback
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }

    setTimeout(() => {
        tree.classList.remove('shake');
        shakeIndicator.textContent = 'Shake to grow ornaments!';
        shakeIndicator.classList.remove('shaking');
        isShaking = false;
    }, 400);
}

// Make an ornament fall and auto-collect
function makeOrnamentFall(ornamentElement) {
    const rect = ornamentElement.getBoundingClientRect();
    const containerRect = fruitsContainer.getBoundingClientRect();

    const fallingOrnament = document.createElement('div');
    fallingOrnament.className = 'falling-item';
    fallingOrnament.textContent = ornamentElement.textContent;

    // Position relative to falling items container
    fallingOrnament.style.left = (rect.left - containerRect.left) + 'px';
    fallingOrnament.style.top = (rect.top - containerRect.top) + 'px';

    // Random drift for natural fall
    const drift = (Math.random() - 0.5) * 100;
    fallingOrnament.style.setProperty('--drift', `${drift}px`);

    fallingItems.appendChild(fallingOrnament);
    ornamentElement.remove();
    ornamentsOnTree--;

    // Add 1 point when it starts falling
    score += 1;
    updateScore();

    // Haptic feedback
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }

    // Remove after it sinks to bottom (4 seconds to match animation)
    setTimeout(() => {
        if (fallingOrnament.parentNode) {
            fallingOrnament.remove();
        }
    }, 4000);
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;

    // Send score to Telegram Cloud Storage if available
    if (tg && tg.CloudStorage) {
        try {
            tg.CloudStorage.setItem('highScore', score.toString());
        } catch (e) {
            // Silently fail if CloudStorage not available
        }
    } else {
        // Use localStorage as fallback
        try {
            localStorage.setItem('shakeTreeHighScore', score.toString());
        } catch (e) {
            // Silently fail if localStorage not available
        }
    }

    // Show main button when score is earned
    if (tg && tg.MainButton && score > 0) {
        tg.MainButton.show();
    }
}

// Reset game
resetBtn.addEventListener('click', () => {
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    initGame();
});

// Load high score from Telegram Cloud Storage or localStorage
if (tg && tg.CloudStorage) {
    try {
        tg.CloudStorage.getItem('highScore', (error, value) => {
            // High score loaded from Telegram
        });
    } catch (e) {
        // Silently fail
    }
} else {
    // Load from localStorage
    try {
        localStorage.getItem('shakeTreeHighScore');
    } catch (e) {
        // Silently fail
    }
}

// Apply Telegram theme colors if available
if (tg && tg.themeParams) {
    document.body.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.body.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    initGame();

    // Show ready status to Telegram
    if (tg) {
        tg.ready();

        // Set main button for sharing score
        if (tg.MainButton) {
            tg.MainButton.setText('Share Score');
            tg.MainButton.onClick(() => {
                const shareText = `I scored ${score} points in Shake Tree! 🌳`;
                const url = tg.initDataUnsafe?.start_param || window.location.href;
                tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`);
            });

            if (score > 0) {
                tg.MainButton.show();
            }
        }
    }
});

