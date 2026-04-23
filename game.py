import random
from enum import Enum
from typing import List, Tuple


class Direction(Enum):
    UP = (0, -1)
    DOWN = (0, 1)
    LEFT = (-1, 0)
    RIGHT = (1, 0)


class SnakeGame:
    GRID_WIDTH = 10
    GRID_HEIGHT = 10

    def __init__(self):
        self.reset()

    def reset(self):
        self.snake = [(self.GRID_WIDTH // 2, self.GRID_HEIGHT // 2)]
        self.food = self._spawn_food()
        self.direction = Direction.RIGHT
        self.next_direction = Direction.RIGHT
        self.score = 0
        self.game_over = False

    def _spawn_food(self) -> Tuple[int, int]:
        while True:
            x = random.randint(0, self.GRID_WIDTH - 1)
            y = random.randint(0, self.GRID_HEIGHT - 1)
            if (x, y) not in self.snake:
                return (x, y)

    def set_direction(self, direction: Direction):
        opposite = {
            Direction.UP: Direction.DOWN,
            Direction.DOWN: Direction.UP,
            Direction.LEFT: Direction.RIGHT,
            Direction.RIGHT: Direction.LEFT,
        }
        if direction != opposite.get(self.direction):
            self.next_direction = direction

    def update(self):
        if self.game_over:
            return

        self.direction = self.next_direction
        dx, dy = self.direction.value
        head_x, head_y = self.snake[0]
        new_head = (head_x + dx, head_y + dy)

        if not (0 <= new_head[0] < self.GRID_WIDTH and 0 <= new_head[1] < self.GRID_HEIGHT):
            self.game_over = True
            return

        if new_head in self.snake:
            self.game_over = True
            return

        self.snake.insert(0, new_head)

        if new_head == self.food:
            self.score += 10
            self.food = self._spawn_food()
        else:
            self.snake.pop()

    def render(self) -> str:
        grid = [['⬜' for _ in range(self.GRID_WIDTH)] for _ in range(self.GRID_HEIGHT)]

        for x, y in self.snake:
            grid[y][x] = '🟩'

        head_x, head_y = self.snake[0]
        grid[head_y][head_x] = '🟢'

        food_x, food_y = self.food
        grid[food_y][food_x] = '🍎'

        result = '\n'.join([''.join(row) for row in grid])
        result += f"\n\nСчёт: {self.score}"
        return result
