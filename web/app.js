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
let settingsBtn, settingsPanel;

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

// Joystick
let joystickElement, joystickStick;
let joystickActive = false;
let joystickCenterX = 0, joystickCenterY = 0;
let joystickRadius = 40;

function initJoystick() {
    joystickElement = document.getElementById('joystick');
    joystickStick = document.querySelector('.joystick-stick');

    joystickElement.addEventListener('touchstart', (e) => {
        joystickActive = true;
        updateJoystick(e.touches[0]);
    }, { passive: true });

    joystickElement.addEventListener('touchmove', (e) => {
        if (joystickActive && gameRunning) updateJoystick(e.touches[0]);
    }, { passive: true });

    joystickElement.addEventListener('touchend', () => {
        joystickActive = false;
        resetJoystick();
    });
}

function updateJoystick(touch) {
    const rect = joystickElement.getBoundingClientRect();
    joystickCenterX = rect.left + rect.width / 2;
    joystickCenterY = rect.top + rect.height / 2;

    const dx = touch.clientX - joystickCenterX;
    const dy = touch.clientY - joystickCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = joystickRadius;

    let stickX = dx, stickY = dy;
    if (distance > maxDistance) {
        stickX = (dx / distance) * maxDistance;
        stickY = (dy / distance) * maxDistance;
    }

    joystickStick.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;

    if (Math.abs(stickX) > 10 || Math.abs(stickY) > 10) {
        let dir = null;
        if (Math.abs(stickX) > Math.abs(stickY)) {
            dir = stickX > 0 ? Direction.RIGHT : Direction.LEFT;
        } else {
            dir = stickY > 0 ? Direction.DOWN : Direction.UP;
        }

        if (dir && inputBuffer.length < 2) {
            inputBuffer.push(dir);
        }
    }
}

function resetJoystick() {
    if (joystickStick) {
        joystickStick.style.transform = 'translate(-50%, -50%)';
    }
}

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

// Separate logic update and render
let lastLogicUpdate = 0;

function updateLogic() {
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
    lastLogicUpdate = Date.now();
    gameLoopId = setTimeout(updateLogic, game.updateInterval);
}

function renderFrame() {
    const state = game.getState();
    const timeSinceUpdate = Math.max(0, Date.now() - (state.lastUpdateTime || Date.now()));
    const progress = Math.min(1, timeSinceUpdate / game.updateInterval);

    renderer.renderInterpolated(state, progress);
    requestAnimationFrame(renderFrame);
}

// Game functions
function startGame() {
    game = new SnakeGame(currentDifficulty);
    gameRunning = true;
    gamePaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    gameOverModal.style.display = 'none';
    if (joystickElement) joystickElement.classList.add('active');
    inputBuffer = [];

    gameLoopId = setTimeout(updateLogic, game.updateInterval);
    requestAnimationFrame(renderFrame);
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
    pauseBtn.textContent = '⏸️ PAUSE';
    gameOverModal.style.display = 'none';
    if (joystickElement) joystickElement.classList.remove('active');
    scoreDisplay.textContent = '0';
    renderer.render(game.getState());
}

function endGame() {
    gameRunning = false;
    if (gameLoopId) clearTimeout(gameLoopId);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    if (joystickElement) joystickElement.classList.remove('active');
    finalScoreDisplay.textContent = game.score;
    gameOverModal.style.display = 'flex';
}

function toggleSettings() {
    if (gameRunning) return;
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'flex' : 'none';
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
        settingsBtn = document.getElementById('settingsBtn');
        settingsPanel = document.getElementById('settingsPanel');

        initJoystick();

        startBtn?.addEventListener('click', startGame);
        pauseBtn?.addEventListener('click', togglePause);
        restartBtn?.addEventListener('click', restartGame);
        settingsBtn?.addEventListener('click', toggleSettings);

        document.querySelectorAll('[data-difficulty]').forEach(btn => {
            btn.addEventListener('click', () => {
                setDifficulty(btn.getAttribute('data-difficulty'));
                document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
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
            btn.addEventListener('click', () => {
                setTheme(btn.getAttribute('data-theme'));
                document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
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
