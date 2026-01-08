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
let fruitsOnTree = [];

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
let shakeThreshold = 15;

// Initialize game
function initGame() {
    score = 0;
    updateScore();
    fruitsOnTree = [];
    fruitsContainer.innerHTML = '';
    fallingItems.innerHTML = '';
    spawnFruitsOnTree();
    setupShakeDetection();
}

// Spawn fruits on tree
function spawnFruitsOnTree() {
    const fruitPositions = [
        { left: '30%', top: '20%' },
        { left: '50%', top: '15%' },
        { left: '70%', top: '25%' },
        { left: '25%', top: '35%' },
        { left: '55%', top: '30%' },
        { left: '75%', top: '40%' },
        { left: '35%', top: '45%' },
        { left: '65%', top: '50%' },
    ];

    fruitPositions.forEach((pos, index) => {
        const fruit = document.createElement('div');
        fruit.className = 'fruit on-tree';
        fruit.textContent = fruitEmojis[index % fruitEmojis.length];
        fruit.style.left = pos.left;
        fruit.style.top = pos.top;
        fruit.dataset.index = index;

        fruitsContainer.appendChild(fruit);
        fruitsOnTree.push(fruit);
    });
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
            shakeIndicator.textContent = 'Tap tree or shake device';
        } else {
            shakeIndicator.textContent = 'Shake device or tap tree';
        }
        window.addEventListener('devicemotion', handleMotion, true);
    } else {
        shakeIndicator.textContent = 'Tap the tree!';
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

        // Prevent shake spam (minimum 1 second between shakes)
        if (now - lastShakeTime > 1000) {
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
    shakeIndicator.textContent = 'Shaking!';
    shakeIndicator.classList.add('shaking');

    // Make fruits fall
    if (fruitsOnTree.length > 0) {
        const numFruitsToFall = Math.min(3, fruitsOnTree.length);

        for (let i = 0; i < numFruitsToFall; i++) {
            const randomIndex = Math.floor(Math.random() * fruitsOnTree.length);
            const fruit = fruitsOnTree[randomIndex];

            if (fruit) {
                makeFruitFall(fruit);
                fruitsOnTree.splice(randomIndex, 1);
            }
        }
    }

    // Vibrate device if supported
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }

    // Use Telegram haptic feedback
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    setTimeout(() => {
        tree.classList.remove('shake');
        shakeIndicator.textContent = 'Shake your device!';
        shakeIndicator.classList.remove('shaking');
        isShaking = false;
    }, 500);
}

// Make a fruit fall
function makeFruitFall(fruitElement) {
    const rect = fruitElement.getBoundingClientRect();
    const containerRect = fruitsContainer.getBoundingClientRect();

    const fallingFruit = document.createElement('div');
    fallingFruit.className = 'falling-item';
    fallingFruit.textContent = fruitElement.textContent;

    // Position relative to falling items container
    fallingFruit.style.left = (rect.left - containerRect.left) + 'px';
    fallingFruit.style.top = (rect.top - containerRect.top) + 'px';

    // Random drift for natural fall
    const drift = (Math.random() - 0.5) * 100;
    fallingFruit.style.setProperty('--drift', `${drift}px`);

    fallingItems.appendChild(fallingFruit);
    fruitElement.remove();

    // Add click handler to collect fruit
    fallingFruit.addEventListener('click', () => {
        collectFruit(fallingFruit);
    });

    // Auto-remove after animation (increased to 4 seconds to match CSS)
    setTimeout(() => {
        if (fallingFruit.parentNode) {
            fallingFruit.remove();
        }
    }, 4000);
}

// Collect a fruit
function collectFruit(fruitElement) {
    if (fruitElement.classList.contains('collected')) return;

    fruitElement.classList.add('collected');
    score += 10;
    updateScore();

    // Haptic feedback
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }

    setTimeout(() => {
        fruitElement.remove();
    }, 500);
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

