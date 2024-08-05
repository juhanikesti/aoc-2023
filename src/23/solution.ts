/*
https://adventofcode.com/2023/day/23

approach:

Go through the entire map, noting down the possible movements from each 
tile. Use that to pathfind all possible paths and pick the longest. 

For part 1, basic pathfinding is enough. 

For part 2, the map consists of long "tunnels" with few intersections. The 
pathfinding can be sped up by reducing the map to just its intersections 
(and start and end points), and pathfinding between those. 

Intersections can be found when searching for the tile movements. After that, 
basic pathfinding can be used from the intersection to find all connected 
intersections (and distances to them). 

There is quite a lot of similar (but not necessarily repeated) code 
between the implementations, due to the problems being just different 
enough to warrant slight changes at every step that make combining the 
implementations quite awkward and unintuitive. 
*/
import fs from 'fs';

const fileName = process.argv[2];
const tiles = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l)
  .map((l) => Array.from(l));

const height = tiles.length;
const width = tiles[0].length;

//part 1
function longestPathDirected() {
  const up: [number, number] = [-1, 0];
  const down: [number, number] = [1, 0];
  const left: [number, number] = [0, -1];
  const right: [number, number] = [0, 1];

  function neighborDirections(tile: string): [number, number][] {
    switch (tile) {
      case '.':
        return [up, down, left, right];
      case 'v':
        return [down];
      case '>':
        return [right];
      case '<':
        return [left];
      case '^':
        return [up];
      case '#':
        return [];
      default:
        throw new Error('tile not recognized: ' + tile);
    }
  }

  const neighborTiles: [number, number][][][] = tiles.map((line, y) =>
    line.map((tile, x) => {
      if (tile === '#') return [];

      return neighborDirections(tile).flatMap<[number, number]>(
        ([yDir, xDir]) => {
          const yN = y + yDir;
          const xN = x + xDir;

          if (
            yN < height &&
            yN >= 0 &&
            xN < width &&
            xN >= 0 &&
            tiles[yN][xN] !== '#'
          ) {
            return [[yN, xN]];
          } else {
            return [];
          }
        }
      );
    })
  );

  type Path = {
    x: number;
    y: number;
    visited: string[];
  };

  const [yStart, xStart] = [0, tiles[0].indexOf('.')];
  const [yEnd, xEnd] = [height - 1, tiles[height - 1].indexOf('.')];
  const paths: Path[] = [
    { x: xStart, y: yStart, visited: [`${xStart} ${yStart}`] },
  ];

  let longest: Path = { x: -1, y: -1, visited: [] };

  while (true) {
    const path = paths.pop();
    if (!path) break;

    const newNeighbors = neighborTiles[path.y][path.x].flatMap(([y, x]) => {
      const coordStr = `${x} ${y}`;
      if (path.visited.includes(coordStr)) return [];
      else return [{ x, y, visited: path.visited.concat(coordStr) }];
    });

    if (!newNeighbors.length) {
      if (
        path.y === yEnd &&
        path.x === xEnd &&
        path.visited.length > longest.visited.length
      )
        longest = path;
      continue;
    }

    paths.push(...newNeighbors);
  }

  return longest;
}

//part 2
function longestPathUndirected() {
  type Intersection = {
    x: number;
    y: number;
    neighbors: { id: number; distance: number }[];
  };

  //includes start (first element) and end (last element)
  const intersections: Intersection[] = [];
  const neighborTiles: [number, number][][][] = tiles.map((line, y) =>
    line.map((tile, x) => {
      if (tile === '#') return [];

      const u: [number, number] = [y - 1, x];
      const d: [number, number] = [y + 1, x];
      const l: [number, number] = [y, x - 1];
      const r: [number, number] = [y, x + 1];

      const neighborTiles = [u, d, l, r].filter(
        ([yN, xN]) =>
          yN < height &&
          yN >= 0 &&
          xN < width &&
          xN >= 0 &&
          tiles[yN][xN] !== '#'
      );

      if (neighborTiles.length !== 2)
        intersections.push({ x, y, neighbors: [] });

      return neighborTiles;
    })
  );

  //find intersection neighbors, could be more efficient (or even finished
  //with part 1), but runtime is dominated by latter pathdinding anyway
  intersections.forEach(({ x, y, neighbors: intersectionNeighbors }, i) => {
    const paths = [{ x, y, visited: [`${x} ${y}`] }];
    const foundIntersections: { id: number; distance: number }[] = [];

    while (true) {
      const path = paths.pop();
      if (!path) break;

      const neighbors = neighborTiles[path.y][path.x].flatMap(([yN, xN]) => {
        const coordStr = `${xN} ${yN}`;
        if (path.visited.includes(coordStr)) return [];

        const intersectionId = intersections.findIndex(
          ({ x: xI, y: yI }) => yN === yI && xN === xI
        );
        if (intersectionId >= 0) {
          foundIntersections.push({
            id: intersectionId,
            distance: path.visited.length - 1,
          });
          return [];
        }

        return [{ x: xN, y: yN, visited: path.visited.concat(coordStr) }];
      });

      if (!neighbors.length) {
        continue;
      }

      paths.push(...neighbors);
    }

    intersectionNeighbors.push(...foundIntersections);
  });

  type Path = {
    intersection: number;
    length: number;
    visited: number[];
  };

  const pathsOpen: Path[] = [{ intersection: 0, length: -1, visited: [0] }];
  const pathsFinished: Path[] = [];

  while (true) {
    const path = pathsOpen.pop();
    if (!path) break;

    const nextPaths = intersections[path.intersection].neighbors.flatMap(
      ({ id: neighbor, distance }) => {
        if (path.visited.includes(neighbor)) return [];

        return [
          {
            intersection: neighbor,
            length: path.length + 1 + distance,
            visited: path.visited.concat(neighbor),
          },
        ];
      }
    );

    if (!nextPaths.length) {
      if (path.intersection === intersections.length - 1)
        pathsFinished.push({ ...path, length: path.length + 1 });
      continue;
    }

    pathsOpen.push(...nextPaths);
  }

  pathsFinished.sort((a, b) => b.length - a.length);
  return pathsFinished[0];
}

console.log('part 1:', longestPathDirected().visited.length - 1);
console.log('part 2:', longestPathUndirected().length);
