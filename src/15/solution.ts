/*
https://adventofcode.com/2023/day/15

approach:

Straightforward implementation of the algorithms in the problem description. 

For part 2, the hash function will output a value from 0 to 255, so use a 256-
long array to represent each box. Each box is an array of lenses, which are
removed and replaced with the splice method of the array. 
*/
import fs from 'fs';

const fileName = process.argv[2];
const seq = fs.readFileSync(fileName).toString().split('\n')[0].split(',');

function hashASCII(str: string) {
  return Array.from(str).reduce(
    (prev, char) => ((prev + char.charCodeAt(0)) * 17) % 256,
    0
  );
}

console.log(
  'part 1:',
  seq.reduce((prev, str) => prev + hashASCII(str), 0)
);

type Lens = {
  label: string;
  focal: number;
};

type Instruction = Lens & {
  hash: number;
  isPlace: boolean;
};

const instructions = seq.flatMap<Instruction>((instruction) => {
  const m = instruction.match(/^([a-z]*)([-=])(\d*)$/);
  if (!m) return [];

  return [
    {
      label: m[1],
      hash: hashASCII(m[1]),
      isPlace: m[2] === '=',
      focal: Number(m[3]) || -1,
    },
  ];
});

const boxes = Array.from(Array(256), () => new Array());

instructions.forEach(({ label, hash, isPlace, focal }) => {
  let lenses = boxes[hash];
  const oldLensIdx = lenses.findIndex((l) => l.label === label);

  if (oldLensIdx !== -1) {
    if (!isPlace) lenses.splice(oldLensIdx, 1);
    else lenses.splice(oldLensIdx, 1, { label, focal });
  } else if (isPlace) {
    lenses.push({ label, focal });
  }
});

console.log(
  'part 2:',
  boxes.reduce(
    (sum, lenses, box) =>
      sum +
      lenses.reduce(
        (powers, { focal }, slot) => powers + (box + 1) * (slot + 1) * focal,
        0
      ),
    0
  )
);
