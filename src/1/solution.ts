/* 
https://adventofcode.com/2023/day/1

approach:

For each line, use indexOf and lastIndexOf 
to extract the indices of all the possible digit 
substrings, and choose the appropriate ones. 
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l);

const wordToDigit = new Map([
  ['one', '1'],
  ['two', '2'],
  ['three', '3'],
  ['four', '4'],
  ['five', '5'],
  ['six', '6'],
  ['seven', '7'],
  ['eight', '8'],
  ['nine', '9'],
]);

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const words = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
];

function calculateValues(substrings: string[]) {
  return lines.reduce((sum, line) => {
    const [first, last] = substrings.reduce(
      ([first, last], str) => {
        const idx1 = line.indexOf(str);
        const idx2 = line.lastIndexOf(str);

        return [
          idx1 > -1 && idx1 < first.idx ? { idx: idx1, str } : first,
          idx2 > -1 && idx2 > last.idx ? { idx: idx2, str } : last,
        ];
      },
      [
        { idx: line.length + 1, str: '0' },
        { idx: -1, str: '0' },
      ]
    );

    const d1 = wordToDigit.get(first.str) || first.str;
    const d2 = wordToDigit.get(last.str) || last.str;

    return sum + Number(d1 + d2);
  }, 0);
}

console.log('part 1:', calculateValues(digits));
console.log('part 2:', calculateValues(digits.concat(words)));
