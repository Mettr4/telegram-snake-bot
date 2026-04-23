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
    static DIFFICULTY = { easy: 600, normal: 500, hard: 350 };

    constructor(difficulty = 'normal') {
        this.difficulty = difficulty;
        this.updateInterval = SnakeGame.DIFFICULTY[difficulty];
        this.reset();
    }

    reset() {
        this.snake = [{ x: 5, y: 5 }];
        this.direction = Direction.RIGHT;
        this.nextDirection = Direction.RIGHT;
        this.score = 0;
        this.gameOver = false;
        this.obstacles = [];
        this.slowCounter = 0;
        this.foodEaten = false;
        this.collisionOccurred = false;
        this.lastUpdateTime = 0;

        if (this.difficulty === 'hard') {
            this.generateObstacles();
        }
        this.food = this.spawnFood();
    }

    generateObstacles() {
        this.obstacles = [];
        for (let i = 0; i < 8; i++) {
            let newObs;
            do {
                newObs = {
                    x: Math.floor(Math.random() * SnakeGame.GRID_WIDTH),
                    y: Math.floor(Math.random() * SnakeGame.GRID_HEIGHT)
                };
            } while (this.isSnakePosition(newObs) ||
                     (newObs.x === this.food.x && newObs.y === this.food.y) ||
                     this.isObstaclePosition(newObs));
            this.obstacles.push(newObs);
        }
    }

    spawnFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * SnakeGame.GRID_WIDTH),
                y: Math.floor(Math.random() * SnakeGame.GRID_HEIGHT),
                special: Math.random() < 0.1
            };
        } while (this.isSnakePosition(newFood) || this.isObstaclePosition(newFood));
        return newFood;
    }

    isSnakePosition(pos) {
        return this.snake.some(seg => seg.x === pos.x && seg.y === pos.y);
    }

    isObstaclePosition(pos) {
        return this.obstacles.some(obs => obs.x === pos.x && obs.y === pos.y);
    }

    setDirection(direction) {
        if (!Direction.isOpposite(direction, this.direction)) {
            this.nextDirection = direction;
        }
    }

    checkCollision(pos) {
        return pos.x < 0 || pos.x >= SnakeGame.GRID_WIDTH ||
               pos.y < 0 || pos.y >= SnakeGame.GRID_HEIGHT ||
               this.isSnakePosition(pos) ||
               this.isObstaclePosition(pos);
    }

    update() {
        this.foodEaten = false;
        this.collisionOccurred = false;
        this.lastUpdateTime = Date.now();

        if (this.gameOver || this.slowCounter > 0) {
            if (this.slowCounter > 0) this.slowCounter--;
            return;
        }

        this.direction = this.nextDirection;
        const newHead = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        if (this.checkCollision(newHead)) {
            this.collisionOccurred = true;
            this.gameOver = true;
            return;
        }

        this.snake.unshift(newHead);

        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.foodEaten = true;
            this.score += this.food.special ? 50 : 10;
            if (this.food.special) this.slowCounter = 2;

            const speedLevel = Math.floor(this.score / 100);
            if (speedLevel > 0 && this.difficulty !== 'hard') {
                this.updateInterval = Math.max(200,
                    SnakeGame.DIFFICULTY[this.difficulty] - (speedLevel * 20));
            }

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
            gameOver: this.gameOver,
            obstacles: this.obstacles,
            difficulty: this.difficulty,
            lastUpdateTime: this.lastUpdateTime
        };
    }
}
