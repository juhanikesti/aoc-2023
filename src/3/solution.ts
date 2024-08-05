/* 
https://adventofcode.com/2023/day/3

approach:

Use regex to parse all numbers from the input.
Get all symbols (except digits and '.') near the numbers.
Store the symbols along with the number(s) that are around them.
If a number has symbols around it, store it as a part number.

For part 1, just calculate the sum of the part numbers. 

For part 2, sum together the gear ratios of symbols that
have exactly 2 numbers around them. 
*/
import fs from 'fs';

const fileName = process.argv[2];
const rows = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((s) => s);

const partNumbers: number[] = [];

//key is coordinates encoded to string: 'x y'
const symbols: Map<string, { char: string; adjacentNumbers: number[] }> =
  new Map();

//extract part numbers, and symbols next to numbers
rows.forEach((row, y) =>
  Array.from(row.matchAll(/\d+/g)).forEach((match) => {
    const numberString = match[0];
    const num = Number(numberString);
    const length = numberString.length;
    const x = match.index || 0;

    let isPartNumber = false;

    for (let cy = y - 1; cy <= y + 1; cy++) {
      for (let cx = x - 1; cx <= x + length; cx++) {
        if (!rows[cy]?.[cx]?.match(/[^.0-9]/)) continue;

        const coords = `${cx} ${cy}`;
        const char = rows[cy][cx];
        const symbolObj = symbols.get(coords);

        isPartNumber = true;
        if (symbolObj) symbolObj.adjacentNumbers.push(num);
        else symbols.set(coords, { char, adjacentNumbers: [num] });
      }
    }

    if (isPartNumber) partNumbers.push(num);
  })
);

function partNumbersSum() {
  return partNumbers.reduce((sum, num) => sum + num, 0);
}

function gearRatiosSum() {
  return Array.from(symbols.values()).reduce(
    (sum, { char, adjacentNumbers }) => {
      if (char !== '*' || adjacentNumbers.length !== 2) return sum;
      else return sum + adjacentNumbers[0] * adjacentNumbers[1];
    },
    0
  );
}

console.log('part 1:', partNumbersSum());
console.log('part 2:', gearRatiosSum());
