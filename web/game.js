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
    static DIFFICULTY = {
        easy: 600,
        normal: 500,
        hard: 350
    };

    constructor(difficulty = 'normal') {
        this.difficulty = difficulty;
        this.updateInterval = SnakeGame.DIFFICULTY[difficulty];
        this.foodEaten = false;
        this.collisionOccurred = false;
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

        if (this.difficulty === 'hard') {
            this.generateObstacles();
        }
        this.food = this.spawnFood();
    }

    generateObstacles() {
        this.obstacles = [];
        const obstacleCount = 8;
        for (let i = 0; i < obstacleCount; i++) {
            let newObstacle;
            do {
                newObstacle = {
                    x: Math.floor(Math.random() * SnakeGame.GRID_WIDTH),
                    y: Math.floor(Math.random() * SnakeGame.GRID_HEIGHT)
                };
            } while (this.isSnakePosition(newObstacle) ||
                     (newObstacle.x === this.food.x && newObstacle.y === this.food.y) ||
                     this.isObstaclePosition(newObstacle));
            this.obstacles.push(newObstacle);
        }
    }

    isObstaclePosition(pos) {
        return this.obstacles.some(obs => obs.x === pos.x && obs.y === pos.y);
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
        return this.snake.some(segment => segment.x === pos.x && segment.y === pos.y);
    }

    setDirection(direction) {
        if (!Direction.isOpposite(direction, this.direction)) {
            this.nextDirection = direction;
        }
    }

    update() {
        this.foodEaten = false;
        this.collisionOccurred = false;

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
                this.updateInterval = Math.max(200, SnakeGame.DIFFICULTY[this.difficulty] - (speedLevel * 20));
            }

            this.food = this.spawnFood();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(pos) {
        return pos.x < 0 || pos.x >= SnakeGame.GRID_WIDTH ||
               pos.y < 0 || pos.y >= SnakeGame.GRID_HEIGHT ||
               this.isSnakePosition(pos) ||
               this.isObstaclePosition(pos);
    }

    getState() {
        return {
            snake: this.snake,
            food: this.food,
            score: this.score,
            gameOver: this.gameOver,
            obstacles: this.obstacles,
            difficulty: this.difficulty
        };
    }
}
