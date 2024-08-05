/*
https://adventofcode.com/2023/day/8

approach:

Simply travel the graph from each starting location, 
recording the amount of steps taken. 

For part 2, take the least common multiple of 
the steps of all possible starting locations. 
*/
import fs from 'fs';
import { lcmArray } from '../utils/math';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l);

const directions = Array.from(
  lines[0].slice().replace(/L/g, '0').replace(/R/g, '1')
).map((c) => Number(c));

const nodes = new Map<string, [string, string]>();
lines.forEach((line) => {
  const match = line.match(/^(\S{3}) = \((\S{3}), (\S{3})\)$/);

  if (match) nodes.set(match[1], [match[2], match[3]]);
});

const startingNodes = Array.from(nodes.keys()).filter((n) => n[2] === 'A');

const stepsRequired = startingNodes.map((start: string): [string, number] => {
  let location = start;
  let step = 0;
  while (location[2] !== 'Z') {
    const direction = directions[step % directions.length];
    const newLocation = nodes.get(location)?.[direction];
    if (!newLocation)
      throw new Error(`invalid location ${location} (from ${start})`);

    location = newLocation;
    step++;
  }

  return [start, step];
});

console.log('part 1:', stepsRequired.find((s) => s[0] === 'AAA')?.[1]);
console.log('part 2:', lcmArray(stepsRequired.map((s) => s[1])));
