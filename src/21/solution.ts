/*
https://adventofcode.com/2023/day/21

approach:

I looked at the input data, and made some assumptions 
based on it that have convenient consequences:
1. The tile of the garden given in the input 
   is always an odd-sidelength square. 
2. The start is always in the middle.
3. The maximum steps is exactly N * sidelength + floor(sidelength/2), 
   where N is a (large) integer. 
4. The edge columns and rows, and the middle column and row, 
   are always devoid of obstacles 

Implement a function that returns the amount of plots that can be reached 
with even and odd number of steps, with a possibility to define the maximum 
number of steps. I did this with a BFS that terminates when enough nodes 
are traversed. 

Part 1 is trivially solved by this. 

For part 2, due to the assumptions, the iput pattern tiles nicely. It's just 
a matter of calculating the different amounts of the repeating tile patterns 
and adding their possible end plots together.

With some more math (subtraction), the amount of different calls to
the pathdinding function could probably be reduced from 13 to 5.
*/
import fs from 'fs';
import { Heap } from '../utils/heap';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l)
  .map((l) => Array.from(l));

//assume square input
const tileSize = lines.length;
const midPoint = Math.floor(tileSize / 2);

function neighborPlots(y: number, x: number): [number, number][] {
  return [
    [y - 1, x],
    [y + 1, x],
    [y, x - 1],
    [y, x + 1],
  ];
}

function pathfind(start: [number, number], maxLength: number) {
  const available = lines.map((line) => line.map((char) => char !== '#'));
  const paths = new Heap<{ y: number; x: number; length: number }>(
    (a, b) => a.length < b.length
  );
  paths.add({ y: start[0], x: start[1], length: 0 });
  available[start[0]][start[1]] = false;

  let even = 1,
    odd = 0;

  while (true) {
    const path = paths.remove();
    if (!path) break;
    if (path.length >= maxLength) continue;

    neighborPlots(path.y, path.x).forEach(([y, x]) => {
      if (!available[y]?.[x]) return;
      available[y][x] = false;

      const length = path.length + 1;

      if (length % 2) {
        odd++;
      } else {
        even++;
      }

      paths.add({ y, x, length });
    });
  }
  return { even, odd };
}

console.log('part 1:', pathfind([midPoint, midPoint], 64).even);

const maxSteps2 = 26501365;

const cornerStarPositions: [number, number][] = [
  [midPoint, tileSize - 1],
  [tileSize - 1, midPoint],
  [midPoint, 0],
  [0, midPoint],
];
const sideStartPositions: [number, number][] = [
  [tileSize - 1, tileSize - 1],
  [tileSize - 1, 0],
  [0, 0],
  [0, tileSize - 1],
];

const middle = pathfind([midPoint, midPoint], Number.MAX_VALUE);

const [left, top, right, bottom] = cornerStarPositions.map((start) =>
  pathfind(start, tileSize - 1)
);

const [topLeftBig, topRightBig, bottomRightBig, bottomLeftBig] =
  sideStartPositions.map((start) => pathfind(start, tileSize + midPoint - 1));
const [topLeftSmall, topRightSmall, bottomRightSmall, bottomLeftSmall] =
  sideStartPositions.map((start) => pathfind(start, midPoint - 1));

//how many full tiles between center and corner tiles (non-inclusive)
const tileRadius = Math.floor(maxSteps2 / tileSize) - 1;

//how many tiles on the diagonal sides (not counting the corners)
const sidesBig = tileRadius;
const sidesSmall = sidesBig + 1;

//how many even/odd full tiles
let evens = 1,
  odds = 0;
for (let n = 1; n <= tileRadius; n++) {
  if (n % 2) odds += 4 * n;
  else evens += 4 * n;
}

const answer =
  left.even +
  top.even +
  right.even +
  bottom.even +
  sidesBig *
    (topLeftBig.odd +
      topRightBig.odd +
      bottomRightBig.odd +
      bottomLeftBig.odd) +
  sidesSmall *
    (topLeftSmall.even +
      topRightSmall.even +
      bottomRightSmall.even +
      bottomLeftSmall.even) +
  evens * middle.odd +
  odds * middle.even;

console.log('part 2:', answer);
