// Initialize Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// Game variables
let game = new SnakeGame();
const renderer = new GameRenderer('gameCanvas', 32);
let gameRunning = false;
let gamePaused = false;
let gameLoopId = null;
let currentDifficulty = localStorage.getItem('difficulty') || 'normal';

// Input buffering
let inputBuffer = [];
const MAX_BUFFER_SIZE = 2;
let touchThreshold = parseInt(localStorage.getItem('touchSensitivity') || '30');

// UI Elements
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('finalScore');
const gameOverModal = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);

// Keyboard controls with input buffering
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    let direction = null;
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            direction = Direction.UP;
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            direction = Direction.DOWN;
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            direction = Direction.LEFT;
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            direction = Direction.RIGHT;
            e.preventDefault();
            break;
    }

    if (direction && inputBuffer.length < MAX_BUFFER_SIZE) {
        inputBuffer.push(direction);
    }
});

// Touch/Swipe controls
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!gameRunning) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    let direction = null;
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > touchThreshold) {
            direction = Direction.RIGHT;
        } else if (diffX < -touchThreshold) {
            direction = Direction.LEFT;
        }
    } else {
        // Vertical swipe
        if (diffY > touchThreshold) {
            direction = Direction.DOWN;
        } else if (diffY < -touchThreshold) {
            direction = Direction.UP;
        }
    }

    if (direction && inputBuffer.length < MAX_BUFFER_SIZE) {
        inputBuffer.push(direction);
    }
});

// Gamepad support
function handleGamepad() {
    const gamepads = navigator.getGamepads();
    if (!gamepads || !gamepads[0]) return;

    const gp = gamepads[0];
    const threshold = 0.5;
    let direction = null;

    if (gp.axes[0] < -threshold) {
        direction = Direction.LEFT;
    } else if (gp.axes[0] > threshold) {
        direction = Direction.RIGHT;
    } else if (gp.axes[1] < -threshold) {
        direction = Direction.UP;
    } else if (gp.axes[1] > threshold) {
        direction = Direction.DOWN;
    }

    // Also check D-pad
    if (gp.buttons[12] && gp.buttons[12].pressed) {
        direction = Direction.UP;
    } else if (gp.buttons[13] && gp.buttons[13].pressed) {
        direction = Direction.DOWN;
    } else if (gp.buttons[14] && gp.buttons[14].pressed) {
        direction = Direction.LEFT;
    } else if (gp.buttons[15] && gp.buttons[15].pressed) {
        direction = Direction.RIGHT;
    }

    if (direction && inputBuffer.length < MAX_BUFFER_SIZE) {
        inputBuffer.push(direction);
    }
}

// Game functions
function startGame() {
    game = new SnakeGame(currentDifficulty);
    gameRunning = true;
    gamePaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    gameOverModal.style.display = 'none';
    inputBuffer = [];

    const difficultyPanel = document.querySelector('.difficulty-panel');
    if (difficultyPanel) {
        difficultyPanel.style.display = 'none';
    }

    function gameLoop() {
        if (!gamePaused) {
            handleGamepad();
            if (inputBuffer.length > 0) {
                game.setDirection(inputBuffer.shift());
            }
            game.update();
            updateUI();

            if (game.foodEaten) {
                const foodColor = game.food.special ? '#FFD700' : renderer.themes[renderer.currentTheme].food;
                const x = game.food.x * 32 + 16;
                const y = game.food.y * 32 + 16;
                renderer.particleSystem.emit(x, y, 6, foodColor);
            }

            if (game.collisionOccurred) {
                renderer.shake(5);
            }

            if (game.gameOver) {
                endGame();
                return;
            }
        }
        renderer.render(game.getState());
        gameLoopId = setTimeout(gameLoop, game.updateInterval);
    }

    gameLoopId = setTimeout(gameLoop, game.updateInterval);
    renderer.render(game.getState());
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? '▶️ Продолжить' : '⏸️ Пауза';
    }
}

function restartGame() {
    if (gameLoopId) {
        clearTimeout(gameLoopId);
    }
    game = new SnakeGame(currentDifficulty);
    gameRunning = false;
    gamePaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸️ Пауза';
    gameOverModal.style.display = 'none';

    const difficultyPanel = document.querySelector('.difficulty-panel');
    if (difficultyPanel) {
        difficultyPanel.style.display = 'block';
    }

    updateUI();
    renderer.render(game.getState());
}

function endGame() {
    gameRunning = false;
    if (gameLoopId) {
        clearTimeout(gameLoopId);
    }
    startBtn.disabled = false;
    pauseBtn.disabled = true;

    const difficultyPanel = document.querySelector('.difficulty-panel');
    if (difficultyPanel) {
        difficultyPanel.style.display = 'block';
    }

    finalScoreDisplay.textContent = game.score;
    gameOverModal.style.display = 'block';
}

function updateUI() {
    scoreDisplay.textContent = game.score;
}

// Settings functions
function setSensitivity(sensitivity) {
    touchThreshold = sensitivity;
    localStorage.setItem('touchSensitivity', sensitivity);
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    localStorage.setItem('difficulty', difficulty);
    const difficultyButtons = document.querySelectorAll('[data-difficulty]');
    difficultyButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-difficulty') === difficulty) {
            btn.classList.add('active');
        }
    });
}

function setTheme(themeName) {
    renderer.setTheme(themeName);
    const themeButtons = document.querySelectorAll('[data-theme]');
    themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
        }
    });
    renderer.render(game.getState());
}

// Sensitivity selector helper
function initSensitivitySelector() {
    const sensitivityButtons = document.querySelectorAll('[data-sensitivity]');
    sensitivityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sensitivity = parseInt(btn.getAttribute('data-sensitivity'));
            setSensitivity(sensitivity);
            sensitivityButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Difficulty selector helper
function initDifficultySelector() {
    const difficultyButtons = document.querySelectorAll('[data-difficulty]');
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const difficulty = btn.getAttribute('data-difficulty');
            setDifficulty(difficulty);
        });
        if (btn.getAttribute('data-difficulty') === currentDifficulty) {
            btn.classList.add('active');
        }
    });
}

// Theme selector helper
function initThemeSelector() {
    const themeButtons = document.querySelectorAll('[data-theme]');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const themeName = btn.getAttribute('data-theme');
            setTheme(themeName);
        });
        if (btn.getAttribute('data-theme') === renderer.currentTheme) {
            btn.classList.add('active');
        }
    });
}

// Initial render
renderer.render(game.getState());
if (document.querySelectorAll('[data-sensitivity]').length > 0) {
    initSensitivitySelector();
}
if (document.querySelectorAll('[data-difficulty]').length > 0) {
    initDifficultySelector();
}
if (document.querySelectorAll('[data-theme]').length > 0) {
    initThemeSelector();
}
