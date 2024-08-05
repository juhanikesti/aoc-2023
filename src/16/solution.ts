/*
https://adventofcode.com/2023/day/16

approach:

Fairly simple simulation of the situation, with each tile's energized state 
stored. Tiles also store the directions from which they've been energized, 
so that infinite loops can be avoided. 

For part 2, just simulate every possible beam and pick the best one. 
*/
import fs from 'fs';

const fileName = process.argv[2];
const grid = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l)
  .map((l) => Array.from(l));

//assume square grid
const gridSize = grid.length;

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

type Beam = {
  y: number;
  x: number;
  dir: Direction;
};

function toDirection({ y, x, dir }: Beam): [number, number] {
  switch (dir) {
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

function newDir({ y, x, dir }: Beam): Direction[] {
  switch (grid[y][x]) {
    case '.':
      return [dir];
    case '|':
      return dir === Direction.UP || dir === Direction.DOWN
        ? [dir]
        : [Direction.UP, Direction.DOWN];
    case '-':
      return dir === Direction.LEFT || dir === Direction.RIGHT
        ? [dir]
        : [Direction.LEFT, Direction.RIGHT];
    case '/':
      switch (dir) {
        case Direction.UP:
          return [Direction.RIGHT];
        case Direction.DOWN:
          return [Direction.LEFT];
        case Direction.LEFT:
          return [Direction.DOWN];
        case Direction.RIGHT:
          return [Direction.UP];
      }
    case '\\':
      switch (dir) {
        case Direction.UP:
          return [Direction.LEFT];
        case Direction.DOWN:
          return [Direction.RIGHT];
        case Direction.LEFT:
          return [Direction.UP];
        case Direction.RIGHT:
          return [Direction.DOWN];
      }
    default:
      throw new Error('tile not recognized:' + grid[y][x]);
  }
}

function energizedTiles(startingBeam: Beam) {
  const tiles: Set<Direction>[][] = grid.map((r) =>
    r.map(() => new Set<Direction>())
  );

  const lightBeams: Beam[] = [{ ...startingBeam }];

  while (lightBeams.length > 0) {
    for (let i = lightBeams.length - 1; i >= 0; i--) {
      const beam = lightBeams[i];
      const [yNew, xNew] = toDirection(beam);

      const energizedDirs = tiles[yNew]?.[xNew];
      if (!energizedDirs || energizedDirs.has(beam.dir)) {
        lightBeams.splice(i, 1);
        continue;
      }

      beam.x = xNew;
      beam.y = yNew;
      energizedDirs.add(beam.dir);

      const newDirs = newDir(beam);
      beam.dir = newDirs[0];

      if (newDirs.length > 1) {
        lightBeams.push({ ...beam, dir: newDirs[1] });
      }
    }
  }

  return tiles.reduce(
    (total, r) =>
      total + r.reduce((rowTotal, t) => rowTotal + Number(t.size > 0), 0),
    0
  );
}

console.log('part 1:', energizedTiles({ y: 0, x: -1, dir: Direction.RIGHT }));

const bestEnergized = Array.from(Array(gridSize))
  .flatMap<Beam>((_, i) => [
    { y: i, x: -1, dir: Direction.RIGHT },
    { y: i, x: gridSize, dir: Direction.LEFT },
    { y: -1, x: i, dir: Direction.DOWN },
    { y: gridSize, x: i, dir: Direction.UP },
  ])
  .reduce((bestEnergized, startingBeam) => {
    const result = energizedTiles(startingBeam);
    return result > bestEnergized ? result : bestEnergized;
  }, 0);

console.log('part 2:', bestEnergized);
