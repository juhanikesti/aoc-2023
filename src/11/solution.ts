/*
https://adventofcode.com/2023/day/11

approach:

Calculate all galaxy coordinates, and then, from them, 
calculate which columns and rows don't have galaxies.

A galaxy's coordinates can now be expanded by a positive integer N, by
adding N * empty rows/columns before the galaxy to its y/x coordinate. 
This also kind of moves the origin of the coordinate system, but that
does not matter for the distance calculations. 

The distance calculation is just the difference of 
coordinates, since diagonal movements are not allowed.
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l)
  .map((s) => Array.from(s));

type Coordinates = [number, number];

const rowGalaxies = Array(lines.length).fill(0);
const colGalaxies = Array(lines[0].length).fill(0);

let imageCoordinates = lines.flatMap((line, y) => {
  const lineGalaxyCoordinates = line.flatMap<Coordinates>((char, x) => {
    if (char === '#') {
      rowGalaxies[y]++;
      colGalaxies[x]++;
      return [[x, y]];
    } else {
      return [];
    }
  });

  if (lineGalaxyCoordinates.length) return lineGalaxyCoordinates;
  else return [];
});

const emptyRows = rowGalaxies.flatMap((n, i) => (n ? [] : i));
const emptyCols = colGalaxies.flatMap((n, i) => (n ? [] : i));

function expand(
  coordinates: Coordinates[],
  expansionMult: number
): Coordinates[] {
  const padAmount = expansionMult - 1;

  return coordinates.map(([x, y]) => {
    const padRows =
      (emptyRows.findIndex((e) => y < e) + 1 || emptyRows.length + 1) - 1;
    const padCols =
      (emptyCols.findIndex((e) => x < e) + 1 || emptyCols.length + 1) - 1;

    return [y + padRows * padAmount, x + padCols * padAmount];
  });
}

function galaxyDistance([x1, y1]: Coordinates, [x2, y2]: Coordinates) {
  return Math.abs(y2 - y1) + Math.abs(x2 - x1);
}

function shortestPathsSum(coordinates: Coordinates[]) {
  let result = 0;

  coordinates.forEach((galaxy1, i) => {
    coordinates.slice(i + 1).forEach((galaxy2) => {
      result += galaxyDistance(galaxy1, galaxy2);
    });
  });

  return result;
}

console.log('part 1:', shortestPathsSum(expand(imageCoordinates, 2)));
//console.log('part 2 (100x):', shortestPathsSum(expand(imageCoordinates, 100)));
console.log('part 2:', shortestPathsSum(expand(imageCoordinates, 1000000)));
