// Initialize Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// Game variables
const game = new SnakeGame();
const renderer = new GameRenderer('gameCanvas', 32);
let gameRunning = false;
let gamePaused = false;
let gameLoopId = null;

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

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            game.setDirection(Direction.UP);
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            game.setDirection(Direction.DOWN);
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            game.setDirection(Direction.LEFT);
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            game.setDirection(Direction.RIGHT);
            e.preventDefault();
            break;
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

    const threshold = 30;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > threshold) {
            game.setDirection(Direction.RIGHT);
        } else if (diffX < -threshold) {
            game.setDirection(Direction.LEFT);
        }
    } else {
        // Vertical swipe
        if (diffY > threshold) {
            game.setDirection(Direction.DOWN);
        } else if (diffY < -threshold) {
            game.setDirection(Direction.UP);
        }
    }
});

// Game functions
function startGame() {
    gameRunning = true;
    gamePaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    gameOverModal.style.display = 'none';

    gameLoopId = setInterval(() => {
        if (!gamePaused) {
            game.update();
            updateUI();

            if (game.gameOver) {
                endGame();
            }
        }
        renderer.render(game.getState());
    }, 500);

    renderer.render(game.getState());
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? '▶️ Продолжить' : '⏸️ Пауза';
    }
}

function restartGame() {
    game.reset();
    gameRunning = false;
    gamePaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸️ Пауза';
    gameOverModal.style.display = 'none';

    if (gameLoopId) {
        clearInterval(gameLoopId);
    }

    updateUI();
    renderer.render(game.getState());
}

function endGame() {
    gameRunning = false;
    if (gameLoopId) {
        clearInterval(gameLoopId);
    }
    startBtn.disabled = false;
    pauseBtn.disabled = true;

    finalScoreDisplay.textContent = game.score;
    gameOverModal.style.display = 'block';
}

function updateUI() {
    scoreDisplay.textContent = game.score;
}

// Initial render
renderer.render(game.getState());
