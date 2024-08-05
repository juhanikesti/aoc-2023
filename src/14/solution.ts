/*
https://adventofcode.com/2023/day/14

approach:

When rolling the rocks north, a number array with a length of the width of the 
grid is created to represent the next position og a rolling rock should there 
be one. When a '#'-character is encountered, the next position for that colum 
is set one south of it. When a 'O'-character is encountered, it is moved to 
the position indicated by the position array, and the array's value at that 
colum is incremented by 1. 

For part 2, to roll the rocks in different cardinals, just rotate the grid, so 
that the desired cardinal is now north, and apply gravity towards north. Each 
"spin cycle" means the grid is rotated 90 degrees clockwise and has gravity 
applied to it 4 times. 

To avoid a lot of simulation, save the results of each spin cycle, and for
each new cycle, compare it to previous ones. If there is a previous result
that matches the current one, that means a loop is encountered, and the final
result will be one of the results in the loop. 
*/
import fs from 'fs';

const fileName = process.argv[2];
const grid = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l)
  .map((l) => Array.from(l));

//room for improvement, but not needed for this one
function spinClockwise(grid: string[][]) {
  const rows = grid.length;
  const cols = grid[0].length;
  const result = Array.from(Array(cols), () => new Array(rows));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][rows - i - 1] = grid[i][j];
    }
  }

  return result;
}

//assumes they are the same size
function isEqual(grid1: string[][], grid2: string[][]) {
  for (let i = 0; i < grid1.length; i++) {
    for (let j = 0; j < grid1.length; j++) {
      if (grid1[i][j] !== grid2[i][j]) return false;
    }
  }

  return true;
}

function totalLoadNorth(grid: string[][]) {
  return grid.reduce(
    (loadTotal, line, i) =>
      loadTotal +
      line.reduce(
        (loadLine, char) => loadLine + (char === 'O' ? grid.length - i : 0),
        0
      ),
    0
  );
}

function gravityNorth(grid: string[][]) {
  const result = grid.map((l) => l.slice());
  const positions: number[] = Array(grid[0].length).fill(0);

  grid.forEach((line, i) => {
    line.forEach((char, j) => {
      if (char === '#') positions[j] = i + 1;
      else if (char === 'O') {
        result[i][j] = '.';
        result[positions[j]][j] = 'O';
        positions[j]++;
      }
    });
  });

  return result;
}

function clockwiseGravity(grid: string[][]) {
  return gravityNorth(spinClockwise(grid));
}

function cycle(grid: string[][]) {
  return clockwiseGravity(
    clockwiseGravity(clockwiseGravity(clockwiseGravity(grid)))
  );
}

console.log('part 1:', totalLoadNorth(gravityNorth(grid)));

const prev = [
  clockwiseGravity(clockwiseGravity(clockwiseGravity(gravityNorth(grid)))),
];
let curr = cycle(prev[0]);
let sameIndex = -1;
while (sameIndex < 0) {
  prev.push(curr);
  curr = cycle(curr);
  sameIndex = prev.findIndex((m) => isEqual(m, curr));
}

const pattern = prev.slice(sameIndex);
const patternSize = pattern.length;

const lastPattern = pattern[(1000000000 - sameIndex - 1) % patternSize];
console.log('part 2:', totalLoadNorth(spinClockwise(lastPattern)));
console.log('  same at', sameIndex, ' pattern size', patternSize);
