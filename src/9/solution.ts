/*
https://adventofcode.com/2023/day/9

approach:

Fairly straightforward implementation of 
the algorithm described with the examples 
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l);

const data = lines.map((l) =>
  Array.from(l.matchAll(/[-\d]+/g)).map(([n]) => Number(n))
);

const dataSequences = data.map((history) => {
  const sequences = [history];

  while (!sequences.at(-1)?.every((n) => !n)) {
    const seq: number[] = [];
    const previousSeq = sequences[sequences.length - 1];

    for (let i = 0; i < previousSeq.length - 1; i++) {
      seq.push(previousSeq[i + 1] - previousSeq[i]);
    }

    sequences.push(seq);
  }

  return sequences;
});

function extrapolate(sequences: number[][], forwards: boolean) {
  const extrapolation = [0];

  for (let i = sequences.length - 2; i >= 0; i--) {
    const prev = sequences[i][forwards ? sequences[i].length - 1 : 0];
    const add = extrapolation[extrapolation.length - 1] * (forwards ? 1 : -1);

    extrapolation.push(prev + add);
  }

  return extrapolation[extrapolation.length - 1];
}

console.log(
  'part 1:',
  dataSequences.map((seq) => extrapolate(seq, true)).reduce((a, b) => a + b)
);
console.log(
  'part 2:',
  dataSequences.map((seq) => extrapolate(seq, false)).reduce((a, b) => a + b)
);
