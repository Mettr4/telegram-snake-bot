// Initialize Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// Game state
let game, renderer;
let gameRunning = false, gamePaused = false, gameLoopId = null;
let currentDifficulty = localStorage.getItem('difficulty') || 'normal';
let touchThreshold = parseInt(localStorage.getItem('touchSensitivity') || '30');
let inputBuffer = [];

// UI refs
let scoreDisplay, finalScoreDisplay, gameOverModal, startBtn, pauseBtn, restartBtn;
let difficultyPanel;

const KEY_MAP = {
    'ArrowUp': Direction.UP, 'w': Direction.UP, 'W': Direction.UP,
    'ArrowDown': Direction.DOWN, 's': Direction.DOWN, 'S': Direction.DOWN,
    'ArrowLeft': Direction.LEFT, 'a': Direction.LEFT, 'A': Direction.LEFT,
    'ArrowRight': Direction.RIGHT, 'd': Direction.RIGHT, 'D': Direction.RIGHT
};

// Keyboard input
document.addEventListener('keydown', (e) => {
    if (!gameRunning || KEY_MAP[e.key]) return;
    const dir = KEY_MAP[e.key];
    if (dir && inputBuffer.length < 2) {
        inputBuffer.push(dir);
        e.preventDefault();
    }
});

// Touch input
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!gameRunning) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    let dir = null;
    if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > touchThreshold ? Direction.RIGHT : dx < -touchThreshold ? Direction.LEFT : null;
    } else {
        dir = dy > touchThreshold ? Direction.DOWN : dy < -touchThreshold ? Direction.UP : null;
    }

    if (dir && inputBuffer.length < 2) inputBuffer.push(dir);
});

// Gamepad input
function handleGamepad() {
    const gp = navigator.getGamepads()?.[0];
    if (!gp) return;

    let dir = null;
    if (gp.axes[0] < -0.5) dir = Direction.LEFT;
    else if (gp.axes[0] > 0.5) dir = Direction.RIGHT;
    else if (gp.axes[1] < -0.5) dir = Direction.UP;
    else if (gp.axes[1] > 0.5) dir = Direction.DOWN;
    else if (gp.buttons[12]?.pressed) dir = Direction.UP;
    else if (gp.buttons[13]?.pressed) dir = Direction.DOWN;
    else if (gp.buttons[14]?.pressed) dir = Direction.LEFT;
    else if (gp.buttons[15]?.pressed) dir = Direction.RIGHT;

    if (dir && inputBuffer.length < 2) inputBuffer.push(dir);
}

// Game loop
function gameLoop() {
    if (!gamePaused) {
        handleGamepad();
        if (inputBuffer.length > 0) game.setDirection(inputBuffer.shift());
        game.update();

        if (game.foodEaten) {
            const color = game.food.special ? '#FFD700' : renderer.themes[renderer.currentTheme].food;
            renderer.particleSystem.emit(game.food.x * 32 + 16, game.food.y * 32 + 16, 6, color);
        }
        if (game.collisionOccurred) renderer.shake(5);

        scoreDisplay.textContent = game.score;
        if (game.gameOver) endGame();
    }
    renderer.render(game.getState());
    gameLoopId = setTimeout(gameLoop, game.updateInterval);
}

// Game functions
function startGame() {
    game = new SnakeGame(currentDifficulty);
    gameRunning = true;
    gamePaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    gameOverModal.style.display = 'none';
    if (difficultyPanel) difficultyPanel.style.display = 'none';
    inputBuffer = [];

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
    if (gameLoopId) clearTimeout(gameLoopId);
    game = new SnakeGame(currentDifficulty);
    gameRunning = false;
    gamePaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸️ Пауза';
    gameOverModal.style.display = 'none';
    if (difficultyPanel) difficultyPanel.style.display = 'block';
    scoreDisplay.textContent = '0';
    renderer.render(game.getState());
}

function endGame() {
    gameRunning = false;
    if (gameLoopId) clearTimeout(gameLoopId);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    if (difficultyPanel) difficultyPanel.style.display = 'block';
    finalScoreDisplay.textContent = game.score;
    gameOverModal.style.display = 'block';
}

// Settings
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    localStorage.setItem('difficulty', difficulty);
    document.querySelectorAll('[data-difficulty]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-difficulty') === difficulty);
    });
}

function setSensitivity(sensitivity) {
    touchThreshold = sensitivity;
    localStorage.setItem('touchSensitivity', sensitivity);
}

function setTheme(themeName) {
    renderer.setTheme(themeName);
    document.querySelectorAll('[data-theme]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
    });
    renderer.render(game.getState());
}

// Initialize on DOM ready
function initApp() {
    try {
        game = new SnakeGame();
        renderer = new GameRenderer('gameCanvas', 32);

        scoreDisplay = document.getElementById('score');
        finalScoreDisplay = document.getElementById('finalScore');
        gameOverModal = document.getElementById('gameOver');
        startBtn = document.getElementById('startBtn');
        pauseBtn = document.getElementById('pauseBtn');
        restartBtn = document.getElementById('restartBtn');
        difficultyPanel = document.querySelector('.difficulty-panel');

        startBtn?.addEventListener('click', startGame);
        pauseBtn?.addEventListener('click', togglePause);
        restartBtn?.addEventListener('click', restartGame);

        document.querySelectorAll('[data-difficulty]').forEach(btn => {
            btn.addEventListener('click', () => setDifficulty(btn.getAttribute('data-difficulty')));
            if (btn.getAttribute('data-difficulty') === currentDifficulty) btn.classList.add('active');
        });

        document.querySelectorAll('[data-sensitivity]').forEach(btn => {
            btn.addEventListener('click', () => {
                setSensitivity(parseInt(btn.getAttribute('data-sensitivity')));
                document.querySelectorAll('[data-sensitivity]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => setTheme(btn.getAttribute('data-theme')));
            if (btn.getAttribute('data-theme') === renderer.currentTheme) btn.classList.add('active');
        });

        renderer.render(game.getState());
    } catch (error) {
        console.error('Init error:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
