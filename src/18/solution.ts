/*
https://adventofcode.com/2023/day/18

approach:

This solution assumes that the first instruction is a right- or left-wards 
one, and that the perimiter is dug in a generally clockwise direction. 

Since all turns are 90 degrees, the area can be divided into 
horizontal slices, where each slize has some fixed width. 

To obtain all width changes, go through all instructions 2 at a time 
(a horizontal one and a vertical one), noting down the width change 
from the horizontal instruction, and the row of the next width change 
(ie. the starting row of the next slice). 

These width changes are then sorted ascendingly by their starting row, so 
that the width of each slice can be calculated from the previous width.
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l);

type Instruction = {
  direction: string;
  length: number;
};

function lagoonSize(instructions: Instruction[]) {
  const edges: {
    startingRow: number;
    widthChange: number;
  }[] = [];

  let nextRow = 0;
  for (let i = 0; i < instructions.length; i += 2) {
    const ins1 = instructions[i]; //RL
    const ins2 = instructions[i + 1]; //UD

    const continueDirection =
      instructions.at(i - 2)?.direction === ins1.direction;

    const positive =
      Number(edges.at(-1)?.widthChange) > 0
        ? continueDirection
        : !continueDirection;

    let widthChange = ins1.length;

    //if there is a "hill" or a "pit", to accomodate its edges
    if (instructions.at(i - 1)?.direction !== ins2.direction) {
      if (
        (positive && ins2.direction === 'D') ||
        (!positive && ins2.direction === 'U')
      )
        widthChange++;
      else widthChange--;
    }

    edges.push({
      startingRow: nextRow,
      widthChange: positive ? widthChange : -widthChange,
    });
    nextRow += (ins2.direction === 'U' ? -1 : 1) * ins2.length;
  }

  edges.sort((a, b) => a.startingRow - b.startingRow);

  let sliceWidth = edges[0].widthChange;
  let size = sliceWidth * (edges[1].startingRow - edges[0].startingRow + 1);

  for (let i = 1; i < edges.length - 1; i++) {
    const { startingRow, widthChange } = edges[i];
    const nextEdge = edges[i + 1];

    if (widthChange >= 0) size += widthChange; //to include the borders

    sliceWidth += widthChange;
    size += (nextEdge.startingRow - startingRow) * sliceWidth;
  }

  return size;
}

console.log(
  'part 1:',
  lagoonSize(
    lines.flatMap((l) => {
      const result = l.match(/^([RDLU]) (\d+)/);
      if (!result) return [];

      return [
        {
          direction: result[1],
          length: Number(result[2]),
        },
      ];
    })
  )
);

console.log(
  'part 2:',
  lagoonSize(
    lines.flatMap((l) => {
      const result = l.match(/\(#(.{5})(.)\)$/);
      if (!result) return [];

      const direction = result[2]
        .replace('0', 'R')
        .replace('1', 'D')
        .replace('2', 'L')
        .replace('3', 'U');
      const length = parseInt(result[1], 16);

      return [{ direction, length }];
    })
  )
);
