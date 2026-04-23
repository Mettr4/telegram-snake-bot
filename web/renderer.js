class GameRenderer {
    constructor(canvasId, cellSize = 32) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = cellSize;
        this.setupCanvas();
    }

    setupCanvas() {
        // Disable image smoothing for pixelated look
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }

    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#111111';
        this.ctx.lineWidth = 0.5;

        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += this.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += this.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawSnake(snake) {
        // Draw body
        for (let i = 1; i < snake.length; i++) {
            this.drawCell(snake[i], '#00cc00');
        }

        // Draw head with glow
        if (snake.length > 0) {
            this.drawCellWithGlow(snake[0], '#00ff00');
        }
    }

    drawFood(food) {
        this.drawCell(food, '#ff0000');
        // Add darker border
        const x = food.x * this.cellSize;
        const y = food.y * this.cellSize;
        this.ctx.strokeStyle = '#cc0000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
    }

    drawCell(pos, color) {
        const x = pos.x * this.cellSize;
        const y = pos.y * this.cellSize;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
    }

    drawCellWithGlow(pos, color) {
        const x = pos.x * this.cellSize;
        const y = pos.y * this.cellSize;

        // Draw glow
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        this.ctx.shadowBlur = 0;
    }

    render(gameState) {
        this.clear();
        this.drawSnake(gameState.snake);
        this.drawFood(gameState.food);
    }
}
