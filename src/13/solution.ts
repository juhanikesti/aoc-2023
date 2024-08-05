/*
https://adventofcode.com/2023/day/13

approach:

Transpose the patterns, so reflections 
can all be checked in only one direction. 

Compare each consecutive 2 lines to see if they match. If they do, store 
the index of the first line as a possible reflection point. Then check if 
it is an actual reflection by comparing further lines until edge of pattern 
is reached. 

For part 2, keep a track of whether there has been a smudge (two 
corresponding lines have exactly one character mismatch), and if 
there has been exactly one, count the reflection as valid. 
*/
import fs from 'fs';

const fileName = process.argv[2];
const patterns = fs
  .readFileSync(fileName)
  .toString()
  .split('\n\n')
  .filter((p) => p)
  .map((p) => p.split('\n').filter((l) => l));

//probably could be more efficient/elegant,
//but this works well enough for this problem
function transpose(pattern: string[]) {
  const matrix = pattern.map((l) => Array.from(l));
  const result = Array.from(
    Array(matrix[0].length),
    () => new Array(matrix.length)
  );

  matrix.forEach((row, i) => row.forEach((char, j) => (result[j][i] = char)));

  return result.map((l) => l.reduce((s, c) => s + c, ''));
}

const patternsTranspose = patterns.map(transpose);

//whether the strings are exactly one character different
function isSmudged(str1: string, str2: string): boolean {
  let difference = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) {
      difference++;
      if (difference > 1) return false;
    }
  }

  return difference === 1;
}

function findReflections(patterns: string[][]) {
  const reflections: number[] = [];
  const reflectionsSmudged: number[] = [];

  patterns.forEach((pattern) => {
    const patternSize = pattern.length;

    //[index of line before reflection, is smudge "available"]
    const reflectionPoints: [number, boolean][] = [];
    for (let i = 0; i < patternSize - 1; i++) {
      const str1 = pattern[i];
      const str2 = pattern[i + 1];
      if (str1 === str2) reflectionPoints.push([i, true]);
      else if (isSmudged(str1, str2)) reflectionPoints.push([i, false]);
    }

    reflectionPoints.forEach(([r, s]) => {
      let smudgeAvailable = s;

      for (let i = r - 1; i >= 0; i--) {
        const j = r + r - i + 1;
        if (j >= patternSize) break;

        const str1 = pattern[i];
        const str2 = pattern[j];
        if (str1 !== str2) {
          if (smudgeAvailable && isSmudged(str1, str2)) {
            smudgeAvailable = false;
          } else {
            return;
          }
        }
      }

      (smudgeAvailable ? reflections : reflectionsSmudged).push(r + 1);
    });
  });

  return [reflections, reflectionsSmudged];
}

function sum(arr: number[]) {
  return arr.reduce((s, n) => s + n, 0);
}

const [horizontal, horizontalSmudged] = findReflections(patterns);
const [vertical, verticalSmudged] = findReflections(patternsTranspose);

console.log('part 1:', sum(vertical) + 100 * sum(horizontal));
console.log('part 2:', sum(verticalSmudged) + 100 * sum(horizontalSmudged));
