/*
https://adventofcode.com/2023/day/22

approach:

Apply gravity to each brick from lowest to highest, saving their positions, 
which are then used in the gravity calculation of the higher bricks. Also save 
possible other bricks that the brick lands on as supports. Use these supports 
to calculate, for each brick, the other bricks that they directly support. 

Using the previously obtained information, for each brick, starting from 
the highest one, calculate the other bricks that will collapse if this 
brick is removed. This is done by first adding any other bricks only 
directly supported by this brick (and the bricks they collapse) to the 
collapsing list (any bricks supported by >1 bricks are supported by some 
other brick next to this one). Then, the bricks directly supported by 
the other bricks collapsed by this one are repeatedly gone through to see 
whether all their supports are in the collapse list, and add them to it 
if so. This is repeated until no new bricks are collapsed in a loop. 
*/
import fs from 'fs';

const fileName = process.argv[2];
const matches = fs
  .readFileSync(fileName)
  .toString()
  .matchAll(/(\d+),(\d+),(\d+)~(\d+),(\d+),(\d+)/g);

// a1 smaller, a2 larger
type Brick = {
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;
};

type SettledBrick = {
  supports: number[]; //brick ids directly supporting this
  supporting: number[]; //brick ids directly supported by this
  collapsing: number[]; //brick ids that would collapse if this one was removed
};

const bricks = Array.from(matches)
  .map<Brick>((result) => {
    const [x1, y1, z1, x2, y2, z2] = result.slice(1).map((s) => Number(s));
    return {
      x1: Math.min(x1, x2),
      y1: Math.min(y1, y2),
      z1: Math.min(z1, z2),
      x2: Math.max(x1, x2),
      y2: Math.max(y1, y2),
      z2: Math.max(z1, z2),
    };
  })
  .sort((a, b) => a.z1 - b.z1);

const { xMax, yMax, zMax } = bricks.reduce(
  ({ xMax, yMax, zMax }, { x1, y1, z1, x2, y2, z2 }) => ({
    xMax: Math.max(x1, x2, xMax),
    yMax: Math.max(y1, y2, yMax),
    zMax: Math.max(z1, z2, zMax),
  }),
  { xMax: 0, yMax: 0, zMax: 0 }
);

/*
Assuming all other bricks below this one have been placed, returns the brick's
z-coordinate after it has fallen, as well as ids of any bricks that end up 
directly supporting it. 
*/
function finalZ(
  { x1, y1, z1, x2, y2 }: Brick,
  grid: number[][][]
): {
  z: number;
  supports: number[];
} {
  let z = z1;
  let found = false;
  const supportSet = new Set<number>();
  while (!found && z > 0) {
    z--;

    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const block = grid[z][y][x];
        if (block >= 0) {
          found = true;
          supportSet.add(block);
        }
      }
    }
  }

  z += Number(found);

  return { z, supports: Array.from(supportSet) };
}

//applies gravity to a brick, and places it in the grid
function placeBrick(
  id: number,
  { x1, y1, z1, x2, y2, z2 }: Brick,
  grid: number[][][]
): SettledBrick {
  const { z: z1New, supports } = finalZ({ x1, y1, z1, x2, y2, z2 }, grid);
  const z2New = z1New + z2 - z1;

  for (let z = z1New; z <= z2New; z++) {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        grid[z][y][x] = id;
      }
    }
  }

  return {
    supports,
    supporting: [],
    collapsing: [],
  };
}

function settleBricks(bricks: Brick[]): SettledBrick[] {
  //grid[z][y][x]
  const grid: number[][][] = Array.from(Array(zMax + 1)).map(() =>
    Array.from(Array(yMax + 1)).map(() =>
      Array.from(Array(xMax + 1)).map(() => -1)
    )
  );

  const result = bricks.map((brick, id) => placeBrick(id, brick, grid));

  //calculate supporting for all bricks
  result.forEach((brick, brickId) => {
    brick.supports.forEach((supportId) =>
      result[supportId].supporting.push(brickId)
    );
  });

  //calculate collapsing for all bricks
  for (const brick of result.toReversed()) {
    //brick ids that will collapse along with this one
    const collapsing: number[] = [];

    //id -> (remaining) supports
    const possibleCollapsing = new Map<number, number[]>();

    //adds brick id into collapsing and its
    //supported brick ids into possibleCollapsing
    function addCollapse(collapseId: number) {
      collapsing.push(collapseId);
      possibleCollapsing.delete(collapseId);

      result[collapseId].supporting.forEach((supportingId) => {
        if (!possibleCollapsing.has(supportingId)) {
          possibleCollapsing.set(supportingId, result[supportingId].supports);
        }
      });
    }

    //add trivially collapsing bricks
    brick.supporting.forEach((id) => {
      const supportingBrick = result[id];

      //supported by a brick next to this one, will not collapse
      if (supportingBrick.supports.length > 1) return;

      [id, ...supportingBrick.collapsing].forEach(addCollapse);
    });

    let changed = true;
    while (changed) {
      changed = false;
      Array.from(possibleCollapsing).forEach(([possible, supports]) => {
        const standingSupports = supports.filter(
          (s) => !collapsing.includes(s)
        );

        if (!standingSupports.length) {
          changed = true;
          addCollapse(possible);
        } else {
          possibleCollapsing.set(possible, standingSupports);
        }
      });
    }

    brick.collapsing = collapsing;
  }

  return result;
}

const settledBricks = settleBricks(bricks);

const [part1, part2] = settledBricks.reduce(
  ([total1, total2], { collapsing }) => [
    total1 + Number(!collapsing.length),
    total2 + collapsing.length,
  ],
  [0, 0]
);

console.log('part 1:', part1);
console.log('part 2:', part2);
