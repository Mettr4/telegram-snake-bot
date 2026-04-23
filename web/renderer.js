class Particle {
    constructor(x, y, vx, vy, color, life = 30) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 4, 4);
        ctx.globalAlpha = 1;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(new Particle(x, y, vx, vy, color));
        }
    }

    update() {
        this.particles = this.particles.filter(p => {
            p.update();
            return p.life > 0;
        });
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

class GameRenderer {
    constructor(canvasId, cellSize = 32) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = cellSize;
        this.particleSystem = new ParticleSystem();
        this.themes = {
            classic: { bg: '#000000', head: '#00ff00', body: '#00cc00', food: '#ff0000', obstacle: '#444444' },
            neon: { bg: '#0a0a0a', head: '#00ffff', body: '#00aa88', food: '#ff00ff', obstacle: '#666666' },
            retro: { bg: '#1a1a2e', head: '#38ff46', body: '#11ff41', food: '#ff6b35', obstacle: '#555555' },
            dark: { bg: '#0d0221', head: '#3a86ff', body: '#1b4965', food: '#ff006e', obstacle: '#333333' }
        };
        this.currentTheme = localStorage.getItem('theme') || 'classic';
        this.shakeIntensity = 0;
        this.setupCanvas();
    }

    setupCanvas() {
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            localStorage.setItem('theme', themeName);
        }
    }

    shake(intensity = 3) {
        this.shakeIntensity = intensity;
    }

    clear() {
        const theme = this.themes[this.currentTheme];
        this.ctx.fillStyle = theme.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
    }

    applyShake() {
        if (this.shakeIntensity > 0) {
            const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(offsetX, offsetY);
            this.shakeIntensity *= 0.85;
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = '#111111';
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();

        for (let i = 0; i <= this.canvas.width; i += this.cellSize) {
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
        }
        for (let i = 0; i <= this.canvas.height; i += this.cellSize) {
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
        }
        this.ctx.stroke();
    }

    drawSnake(snake) {
        const theme = this.themes[this.currentTheme];
        for (let i = 1; i < snake.length; i++) {
            const pos = snake[i];
            const x = Math.round(pos.x * this.cellSize) + 1;
            const y = Math.round(pos.y * this.cellSize) + 1;
            this.ctx.fillStyle = theme.body;
            this.ctx.fillRect(x, y, this.cellSize - 2, this.cellSize - 2);
        }

        if (snake.length > 0) {
            const headPos = snake[0];
            const x = Math.round(headPos.x * this.cellSize) + 1;
            const y = Math.round(headPos.y * this.cellSize) + 1;
            this.ctx.shadowColor = theme.head;
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = theme.head;
            this.ctx.fillRect(x, y, this.cellSize - 2, this.cellSize - 2);
            this.ctx.shadowBlur = 0;
        }
    }

    drawFood(food) {
        const theme = this.themes[this.currentTheme];
        const x = food.x * this.cellSize;
        const y = food.y * this.cellSize;

        if (food.special) {
            this.drawCell(food, '#FFD700');
            this.ctx.strokeStyle = '#FFA500';
        } else {
            this.drawCell(food, theme.food);
            this.ctx.strokeStyle = { '#ff0000': '#cc0000', '#00ff00': '#00cc00', '#ff00ff': '#cc00cc' }[theme.food] || '#666666';
        }

        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
    }

    drawObstacles(obstacles) {
        const theme = this.themes[this.currentTheme];
        this.ctx.fillStyle = theme.obstacle;
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 1;
        const padding = 1;
        const size = this.cellSize - 2;

        for (let obs of obstacles) {
            const x = obs.x * this.cellSize;
            const y = obs.y * this.cellSize;
            this.ctx.fillRect(x + padding, y + padding, size, size);
            this.ctx.strokeRect(x + padding, y + padding, size, size);
        }
    }

    drawCell(pos, color) {
        this.ctx.fillStyle = color;
        const x = pos.x * this.cellSize + 1;
        const y = pos.y * this.cellSize + 1;
        this.ctx.fillRect(x, y, this.cellSize - 2, this.cellSize - 2);
    }

    drawCellWithGlow(pos, color) {
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = color;
        const x = pos.x * this.cellSize + 1;
        const y = pos.y * this.cellSize + 1;
        this.ctx.fillRect(x, y, this.cellSize - 2, this.cellSize - 2);
        this.ctx.shadowBlur = 0;
    }

    render(gameState) {
        this.renderInterpolated(gameState, 1);
    }

    renderInterpolated(gameState, progress) {
        try {
            this.applyShake();
            this.clear();
            this.particleSystem.update();

            if (gameState.obstacles && gameState.obstacles.length > 0) {
                this.drawObstacles(gameState.obstacles);
            }

            const interpolatedSnake = progress < 1 && gameState.snake ?
                this.getInterpolatedSnake(gameState.snake, progress) : gameState.snake;
            this.drawSnake(interpolatedSnake);
            this.drawFood(gameState.food);
            this.particleSystem.draw(this.ctx);

            if (this.ctx.resetTransform) {
                this.ctx.resetTransform();
            } else {
                this.ctx.translate(0, 0);
            }
        } catch (error) {
            console.error('Render error:', error);
        }
    }

    getInterpolatedSnake(snake, progress) {
        if (!snake || snake.length === 0) return snake;
        return snake.map(segment => ({
            x: segment.x,
            y: segment.y
        }));
    }
}
