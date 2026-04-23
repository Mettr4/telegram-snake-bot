// Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// Game state
let game, renderer;
let gameRunning = false, gamePaused = false, gameLoopId = null;
let inputBuffer = [];
let bestScore = parseInt(localStorage.getItem('bestScore') || '0');
let currentDifficulty = localStorage.getItem('difficulty') || 'normal';

// UI
const ui = {};
let joystickElement, joystickStick, joystickActive = false;

// Input constants
const KEY_MAP = {
    'ArrowUp': Direction.UP, 'w': Direction.UP, 'W': Direction.UP,
    'ArrowDown': Direction.DOWN, 's': Direction.DOWN, 'S': Direction.DOWN,
    'ArrowLeft': Direction.LEFT, 'a': Direction.LEFT, 'A': Direction.LEFT,
    'ArrowRight': Direction.RIGHT, 'd': Direction.RIGHT, 'D': Direction.RIGHT
};

// Keyboard
document.addEventListener('keydown', (e) => {
    if (!gameRunning || !KEY_MAP[e.key]) return;
    const dir = KEY_MAP[e.key];
    if (dir && inputBuffer.length < 2) {
        inputBuffer.push(dir);
        e.preventDefault();
    }
});

// Touch swipe
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!gameRunning) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const threshold = parseInt(localStorage.getItem('touchSensitivity') || '30');

    let dir = null;
    if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > threshold ? Direction.RIGHT : dx < -threshold ? Direction.LEFT : null;
    } else {
        dir = dy > threshold ? Direction.DOWN : dy < -threshold ? Direction.UP : null;
    }

    if (dir && inputBuffer.length < 2) inputBuffer.push(dir);
});

// Joystick
function initJoystick() {
    joystickElement = document.getElementById('joystick');
    joystickStick = document.querySelector('.joystick-stick');
    if (!joystickElement) return;

    const joystickRadius = 50;

    joystickElement.addEventListener('touchstart', (e) => {
        if (!gameRunning) return;
        joystickActive = true;
    }, { passive: true });

    const handleJoystickMove = (e) => {
        if (!joystickActive || !gameRunning) return;
        const touch = e.touches ? e.touches[0] : e;
        const rect = joystickElement.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = touch.clientX - cx;
        const dy = touch.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = joystickRadius + 15;

        const sx = dist > maxDist ? (dx / dist) * maxDist : dx;
        const sy = dist > maxDist ? (dy / dist) * maxDist : dy;

        joystickStick.style.transform = `translate(calc(-50% + ${sx}px), calc(-50% + ${sy}px))`;

        if (Math.abs(sx) > 3 || Math.abs(sy) > 3) {
            const dir = Math.abs(sx) > Math.abs(sy)
                ? (sx > 0 ? Direction.RIGHT : Direction.LEFT)
                : (sy > 0 ? Direction.DOWN : Direction.UP);
            if (inputBuffer.length < 2) inputBuffer.push(dir);
        }
    };

    document.addEventListener('touchmove', handleJoystickMove, { passive: true });
    document.addEventListener('mousemove', handleJoystickMove);

    joystickElement.addEventListener('mousedown', () => { if (gameRunning) joystickActive = true; });
    document.addEventListener('mouseup', () => {
        joystickActive = false;
        joystickStick.style.transform = 'translate(-50%, -50%)';
    });

    document.addEventListener('touchend', () => {
        joystickActive = false;
        joystickStick.style.transform = 'translate(-50%, -50%)';
    });
}

// Gamepad
function handleGamepad() {
    const gp = navigator.getGamepads?.()?.[0];
    if (!gp) return;

    let dir = null;
    if (gp.axes[0] < -0.5) dir = Direction.LEFT;
    else if (gp.axes[0] > 0.5) dir = Direction.RIGHT;
    else if (gp.axes[1] < -0.5) dir = Direction.UP;
    else if (gp.axes[1] > 0.5) dir = Direction.DOWN;

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

        ui.score.textContent = game.score;
        ui.level.textContent = Math.floor(game.score / 100) + 1;
        ui.length.textContent = game.snake.length;

        if (game.gameOver) endGame();
    }
    renderer.render(game.getState());
    gameLoopId = setTimeout(gameLoop, game.updateInterval);
}

function renderFrame() {
    renderer.render(game.getState());
    requestAnimationFrame(renderFrame);
}

// Controls
function startGame() {
    game = new SnakeGame(currentDifficulty);
    gameRunning = true;
    gamePaused = false;
    ui.startBtn.disabled = true;
    ui.pauseBtn.disabled = false;
    ui.gameOverModal.style.display = 'none';
    joystickElement.classList.add('active');
    inputBuffer = [];

    gameLoopId = setTimeout(gameLoop, game.updateInterval);
    requestAnimationFrame(renderFrame);
}

function togglePause() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    ui.pauseBtn.textContent = gamePaused ? '▶️ PLAY' : '⏸️ PAUSE';
}

function restartGame() {
    if (gameLoopId) clearTimeout(gameLoopId);
    game = new SnakeGame(currentDifficulty);
    gameRunning = false;
    gamePaused = false;
    ui.startBtn.disabled = false;
    ui.pauseBtn.disabled = true;
    ui.pauseBtn.textContent = '⏸️ PAUSE';
    ui.gameOverModal.style.display = 'none';
    joystickElement.classList.remove('active');
    ui.score.textContent = '0';
    renderer.render(game.getState());
}

function endGame() {
    gameRunning = false;
    if (gameLoopId) clearTimeout(gameLoopId);
    ui.startBtn.disabled = false;
    ui.pauseBtn.disabled = true;
    joystickElement.classList.remove('active');

    if (game.score > bestScore) {
        bestScore = game.score;
        localStorage.setItem('bestScore', bestScore);
        ui.bestScore.textContent = bestScore;
    }

    ui.finalScore.textContent = game.score;
    ui.gameOverModal.style.display = 'flex';
}

function toggleSettings() {
    if (gameRunning) return;
    const display = ui.settingsPanel.style.display;
    ui.settingsPanel.style.display = display === 'none' ? 'flex' : 'none';
}

// Settings
function setDifficulty(diff) {
    currentDifficulty = diff;
    localStorage.setItem('difficulty', diff);
    document.querySelectorAll('[data-difficulty]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-difficulty') === diff);
    });
}

function setSensitivity(sens) {
    localStorage.setItem('touchSensitivity', sens);
}

function setTheme(theme) {
    renderer.setTheme(theme);
    document.querySelectorAll('[data-theme]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });
    renderer.render(game.getState());
}

// Init
function initApp() {
    game = new SnakeGame();
    renderer = new GameRenderer('gameCanvas', 32);

    ui.score = document.getElementById('score');
    ui.finalScore = document.getElementById('finalScore');
    ui.gameOverModal = document.getElementById('gameOver');
    ui.startBtn = document.getElementById('startBtn');
    ui.pauseBtn = document.getElementById('pauseBtn');
    ui.restartBtn = document.getElementById('restartBtn');
    ui.settingsBtn = document.getElementById('settingsBtn');
    ui.settingsPanel = document.getElementById('settingsPanel');
    ui.bestScore = document.getElementById('bestScore');
    ui.level = document.getElementById('level');
    ui.length = document.getElementById('length');

    ui.bestScore.textContent = bestScore;

    ui.startBtn?.addEventListener('click', startGame);
    ui.pauseBtn?.addEventListener('click', togglePause);
    ui.restartBtn?.addEventListener('click', restartGame);
    ui.settingsBtn?.addEventListener('click', toggleSettings);

    document.querySelectorAll('[data-difficulty]').forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn.getAttribute('data-difficulty')));
        if (btn.getAttribute('data-difficulty') === currentDifficulty) btn.classList.add('active');
    });

    document.querySelectorAll('[data-sensitivity]').forEach(btn => {
        btn.addEventListener('click', () => {
            setSensitivity(btn.getAttribute('data-sensitivity'));
            document.querySelectorAll('[data-sensitivity]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.querySelectorAll('[data-theme]').forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.getAttribute('data-theme')));
        if (btn.getAttribute('data-theme') === renderer.currentTheme) btn.classList.add('active');
    });

    initJoystick();
    renderer.render(game.getState());
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
