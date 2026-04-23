class Direction {
    static UP = { x: 0, y: -1 };
    static DOWN = { x: 0, y: 1 };
    static LEFT = { x: -1, y: 0 };
    static RIGHT = { x: 1, y: 0 };

    static isOpposite(dir1, dir2) {
        return (dir1.x === -dir2.x && dir1.y === -dir2.y);
    }
}

class SnakeGame {
    static GRID_WIDTH = 10;
    static GRID_HEIGHT = 10;

    constructor() {
        this.reset();
    }

    reset() {
        this.snake = [{ x: 5, y: 5 }];
        this.food = this.spawnFood();
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;
        this.score = 0;
        this.gameOver = false;
    }

    spawnFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * SnakeGame.GRID_WIDTH),
                y: Math.floor(Math.random() * SnakeGame.GRID_HEIGHT)
            };
        } while (this.isSnakePosition(newFood));
        return newFood;
    }

    isSnakePosition(pos) {
        return this.snake.some(segment => segment.x === pos.x && segment.y === pos.y);
    }

    setDirection(direction) {
        if (!Direction.isOpposite(direction, this.direction)) {
            this.nextDirection = direction;
        }
    }

    update() {
        if (this.gameOver) return;

        this.direction = this.nextDirection;
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= SnakeGame.GRID_WIDTH ||
            newHead.y < 0 || newHead.y >= SnakeGame.GRID_HEIGHT) {
            this.gameOver = true;
            return;
        }

        // Check self collision
        if (this.isSnakePosition(newHead)) {
            this.gameOver = true;
            return;
        }

        this.snake.unshift(newHead);

        // Check food collision
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.food = this.spawnFood();
        } else {
            this.snake.pop();
        }
    }

    getState() {
        return {
            snake: this.snake,
            food: this.food,
            score: this.score,
            gameOver: this.gameOver
        };
    }
}
