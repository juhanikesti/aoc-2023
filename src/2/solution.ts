/*
https://adventofcode.com/2023/day/2

approach:

Map all lines to an array of color-amount pairs. 

For part 1, check whether any of the amounts 
go over the specified amount of that color.

For part 2, find the maximum amount of each color.
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l);

const cubes = lines.map((line) => {
  const pulls = line.matchAll(/(\d+) ((?:red)|(?:green)|(?:blue))/g);

  return Array.from(pulls).map((pull) => ({
    amount: Number(pull[1]),
    color: pull[2],
  }));
});

function numPossibleGames(amounts: Map<string, number>) {
  return cubes.reduce((sum, game, idx) => {
    if (game.find(({ color, amount }) => (amounts.get(color) || 0) < amount))
      return sum;
    else return sum + idx + 1;
  }, 0);
}

function minPossibleCubes() {
  return cubes.reduce((sum, game) => {
    const minCubes = new Map([
      ['red', 0],
      ['green', 0],
      ['blue', 0],
    ]);

    game.forEach(({ amount, color }) => {
      if ((minCubes.get(color) || 0) < amount) minCubes.set(color, amount);
    });

    return sum + Array.from(minCubes.values()).reduce((p, n) => p * n, 1);
  }, 0);
}

console.log(
  'part 1:',
  numPossibleGames(
    new Map([
      ['red', 12],
      ['green', 13],
      ['blue', 14],
    ])
  )
);

console.log('part 2:', minPossibleCubes());
