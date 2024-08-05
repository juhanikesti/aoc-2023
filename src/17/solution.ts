/*
https://adventofcode.com/2023/day/17

approach:

Slightly modified Dijkstra's pathfinding algorihm. Keep track of 
each currently found possible path in a min-heap ordered by each 
path's total current heat loss. These paths have their coordinates, 
total current heat loss, and last direction moved in recorded. 
Initially, this heap has 2 paths with a 0 heat loss starting from 
the top-left corner going down and right. When a path is popped 
from the heap, calculate all possible moves if it turned right or 
left (these are lengths 1, 2, 3 for part 1 and 4, 5, 6, 7, 8, 9, 10 
for part 2), and add them to the heap.

Also, for each tile in the grid, and for each approach direction, 
keep track of the lowest heat loss recorded (initially Infinity). 
If a path arrives on a tile with a lower recorded heat loss from
that direction, the path is discarded, as a better one has already
been found. 
*/
import fs from 'fs';
import { Heap } from '../utils/heap';

const fileName = process.argv[2];
const grid = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l)
  .map((l) => Array.from(l).map((n) => Number(n)));

const gridHeight = grid.length;
const gridWidth = grid[0].length;

enum Direction {
  UP = 0,
  DOWN,
  LEFT,
  RIGHT,
}

function toDirection(
  y: number,
  x: number,
  direction: Direction
): [number, number] {
  switch (direction) {
    case Direction.UP:
      return [y - 1, x];
    case Direction.DOWN:
      return [y + 1, x];
    case Direction.LEFT:
      return [y, x - 1];
    case Direction.RIGHT:
      return [y, x + 1];
  }
}

function moves(fromDirection: Direction, moveLengths: number[]) {
  return (
    fromDirection === Direction.UP || fromDirection === Direction.DOWN
      ? [Direction.LEFT, Direction.RIGHT]
      : [Direction.DOWN, Direction.UP]
  ).flatMap((dir) => moveLengths.map<[Direction, number]>((len) => [dir, len]));
}

type Path = {
  x: number;
  y: number;
  totalLoss: number;
  direction: Direction;
};

function lowestHeatLoss(allowedMoveLengths: number[]) {
  const paths = new Heap<Path>(
    (a, b) => a.totalLoss < b.totalLoss,
    {
      x: 0,
      y: 0,
      totalLoss: 0,
      direction: Direction.DOWN,
    },
    {
      x: 0,
      y: 0,
      totalLoss: 0,
      direction: Direction.RIGHT,
    }
  );

  const tiles: [number, number, number, number][][] = grid.map((r) =>
    r.map(() => [Infinity, Infinity, Infinity, Infinity])
  );

  while (true) {
    const path = paths.remove();
    if (!path) throw new Error('no path to end found');
    if (path.x === gridWidth - 1 && path.y === gridHeight - 1) {
      return path.totalLoss;
    }

    moves(path.direction, allowedMoveLengths).forEach(([direction, length]) => {
      let { x, y, totalLoss } = path;

      //could be faster if calculated together (in eg. the moves function),
      //but not necessary for this
      for (let i = 0; i < length; i++) {
        [y, x] = toDirection(y, x, direction);
        totalLoss += grid[y]?.[x];
        if (isNaN(totalLoss)) return;
      }

      if (tiles[y][x][direction] <= totalLoss) return;

      tiles[y][x][direction] = totalLoss;
      paths.add({ x, y, totalLoss, direction });
    });
  }
}

console.log('part 1:', lowestHeatLoss([1, 2, 3]));
console.log('part 2:', lowestHeatLoss([4, 5, 6, 7, 8, 9, 10]));
