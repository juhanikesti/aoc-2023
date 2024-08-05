/*
https://adventofcode.com/2023/day/10

approach:

Traverse through the pipes, counting their amount.

For part 1, the pipes make a loop, so the furthest point 
is half the total amount of loop tiles away from start.

For part 2, Have a representation of the entire 
area that is initially filled with nothing/unknown. 

While traversing through the loop, mark the tiles containing a loop pipe. 
Also mark both sides of the loops are being either left or right side of 
the loop in the representation. 

When this is done, the entire pipe loop is surrounded by tiles marked to 
be on either left or right side of the loop. Now it is possible to use 
flood-fill to make every tile one of 3 types: pipe, left side, or right side. 

Now it is possible to figure out which side is inside 
the loop, and count the amount of tiles on that side. 
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l);

const height = lines.length;
const width = lines[0].length;

type Coordinates = [number, number];

function sameCoordinates(
  [x1, y1]: Coordinates,
  [x2, y2]: Coordinates
): boolean {
  return x1 === x2 && y1 === y2;
}

function getStringTile([x, y]: Coordinates): string | undefined {
  return lines[y]?.[x];
}

//A and B are left and right wrt. to the direction the pipe is traversed in.
//Either side could end up being outside or inside.
enum Tile {
  UNKNOWN,
  PIPE,
  A,
  B,
}

let tiles: Tile[][] = Array.from(Array(height), () =>
  new Array(width).fill(Tile.UNKNOWN)
);

function tileChar(tile: Tile) {
  switch (tile) {
    case Tile.UNKNOWN:
      return '\x1b[90m.';
    case Tile.PIPE:
      return '\x1b[90m#';
    case Tile.A:
      return '\x1b[94mA';
    case Tile.B:
      return '\x1b[93mB';
  }
}

function printTiles() {
  tiles
    .map((row) => row.reduce((s, t) => s + tileChar(t), ''))
    .forEach((row) => console.log(row));
  process.stdout.write('\x1b[0m');
}

//enum values set up such that you can
//negate a direction to get its opposite
//e.g. -UP becomes DOWN
enum Direction {
  UP = -1,
  DOWN = 1,
  LEFT = -2,
  RIGHT = 2,
}

function toDirection([x, y]: Coordinates, direction: Direction): Coordinates {
  switch (direction) {
    case Direction.UP:
      return [x, y - 1];
    case Direction.DOWN:
      return [x, y + 1];
    case Direction.LEFT:
      return [x - 1, y];
    case Direction.RIGHT:
      return [x + 1, y];
  }
}

function findS(): Coordinates {
  for (let i = 0; i < height; i++) {
    const S = lines[i].indexOf('S');
    if (S >= 0) return [S, i];
  }

  throw new Error('no S found');
}

type Connection = {
  tile: Coordinates;
  from: Direction;
};

//for when you don't know what kind of a pipe the tile is
function getConnections(fromTile: Coordinates): Connection[] {
  const directions: [Direction, string[]][] = [
    [Direction.UP, ['|', 'F', '7']],
    [Direction.DOWN, ['|', 'L', 'J']],
    [Direction.RIGHT, ['-', '7', 'J']],
    [Direction.LEFT, ['-', 'F', 'L']],
  ];

  return directions.flatMap(([direction, accepted]) => {
    const neighbour = getStringTile(toDirection(fromTile, direction));
    if (!neighbour || !accepted.includes(neighbour)) return [];

    return { tile: toDirection(fromTile, direction), from: -direction };
  });
}

enum Pipe {
  V = 1,
  H,
  TL,
  TR,
  BL,
  BR,
}

const charToPipe = new Map([
  ['|', Pipe.V],
  ['-', Pipe.H],
  ['F', Pipe.TL],
  ['7', Pipe.TR],
  ['L', Pipe.BL],
  ['J', Pipe.BR],
]);

//returns the directions that specific pipe connects to
function pipeNeighbours(pipe: Pipe): [Direction, Direction] {
  switch (pipe) {
    case Pipe.V:
      return [Direction.UP, Direction.DOWN];
    case Pipe.H:
      return [Direction.LEFT, Direction.RIGHT];
    case Pipe.TL:
      return [Direction.DOWN, Direction.RIGHT];
    case Pipe.TR:
      return [Direction.DOWN, Direction.LEFT];
    case Pipe.BL:
      return [Direction.UP, Direction.RIGHT];
    case Pipe.BR:
      return [Direction.UP, Direction.LEFT];
  }
}

//returns tiles on the [left, right] side of the pipe
//when traveling from the specified direction
function pipeSides(pipe: Pipe, from: Direction): [Direction[], Direction[]] {
  let sides: [Direction[], Direction[]];
  switch (pipe) {
    case Pipe.V: //from bottom
      sides = [[Direction.LEFT], [Direction.RIGHT]];
      switch (from) {
        case Direction.DOWN:
          return sides;
        case Direction.UP:
          return [sides[1], sides[0]];
        default:
      }
    case Pipe.H: //from left
      sides = [[Direction.UP], [Direction.DOWN]];
      switch (from) {
        case Direction.LEFT:
          return sides;
        case Direction.RIGHT:
          return [sides[1], sides[0]];
        default:
      }
    case Pipe.TL: //from bottom
      sides = [[Direction.LEFT, Direction.UP], []];
      switch (from) {
        case Direction.DOWN:
          return sides;
        case Direction.RIGHT:
          return [sides[1], sides[0]];
        default:
      }
    case Pipe.TR: //from bottom
      sides = [[], [Direction.UP, Direction.RIGHT]];
      switch (from) {
        case Direction.DOWN:
          return sides;
        case Direction.LEFT:
          return [sides[1], sides[0]];
        default:
      }
    case Pipe.BL: //from top
      sides = [[], [Direction.LEFT, Direction.DOWN]];
      switch (from) {
        case Direction.UP:
          return sides;
        case Direction.RIGHT:
          return [sides[1], sides[0]];
        default:
      }
    case Pipe.BR: //from top
      sides = [[Direction.RIGHT, Direction.DOWN], []];
      switch (from) {
        case Direction.UP:
          return sides;
        case Direction.LEFT:
          return [sides[1], sides[0]];
        default:
      }
  }

  throw new Error(`can't enter ${pipe} from ${from}`);
}

//sets the specified tile to the specified side (in/out)
function setSide([x, y]: Coordinates, side: Tile.A | Tile.B) {
  if (y >= 0 && y < height && x >= 0 && x < width && tiles[y][x] !== Tile.PIPE)
    tiles[y][x] = side;
}

function setSides(tile: Coordinates, pipe: Pipe, from: Direction) {
  const [left, right] = pipeSides(pipe, from);
  left.forEach((direction) => setSide(toDirection(tile, direction), Tile.A));
  right.forEach((direction) => setSide(toDirection(tile, direction), Tile.B));
}

function travelPipe({ tile, from }: Connection): Direction | undefined {
  const pipe = charToPipe.get(getStringTile(tile) || '');
  if (!pipe) return;

  tiles[tile[1]][tile[0]] = Tile.PIPE;
  setSides(tile, pipe, from);

  return pipeNeighbours(pipe).find((dir) => dir !== from);
}

//get the start of the loop (and its pipe type),
//and set the tiles accordingly
const S = findS();
const [Sconnnection1, Sconnection2] = getConnections(S);
let Stype: Pipe;
if (-Sconnnection1.from === Direction.UP) {
  if (-Sconnection2.from === Direction.DOWN) {
    Stype = Pipe.V;
  } else if (-Sconnection2.from === Direction.LEFT) {
    Stype = Pipe.BR;
  } else {
    Stype = Pipe.BL;
  }
} else if (-Sconnnection1.from === Direction.DOWN) {
  if (-Sconnection2.from === Direction.LEFT) {
    Stype = Pipe.TR;
  } else {
    Stype = Pipe.TL;
  }
} else Stype = Pipe.H;
tiles[S[1]][S[0]] = Tile.PIPE;
setSides(S, Stype, -Sconnection2.from);

//traverse through the pipe, setting left and right sides accordingly
let nextConnection = Sconnnection1;
while (!sameCoordinates(nextConnection.tile, S)) {
  const nextDirection = travelPipe(nextConnection);
  if (!nextDirection)
    throw new Error('cannot proceed from ' + nextConnection.tile.toString());

  nextConnection = {
    tile: toDirection(nextConnection.tile, nextDirection),
    from: -nextDirection,
  };
}

//run it twice to make sure some corners don't get left unfilled
for (let i = 0; i < 2; i++) {
  //flood-fill unknown tiles with the correct side
  tiles.forEach((row, tileY) => {
    row.forEach((tile, tileX) => {
      if (tile !== Tile.A && tile !== Tile.B) return;

      for (let x = tileX + 1; tiles[tileY]?.[x] === Tile.UNKNOWN; x++) {
        tiles[tileY][x] = tile;
      }
      for (let x = tileX - 1; tiles[tileY]?.[x] === Tile.UNKNOWN; x--) {
        tiles[tileY][x] = tile;
      }
      for (let y = tileY + 1; tiles[y]?.[tileX] === Tile.UNKNOWN; y++) {
        tiles[y][tileX] = tile;
      }
      for (let y = tileY - 1; tiles[y]?.[tileX] === Tile.UNKNOWN; y--) {
        tiles[y][tileX] = tile;
      }
    });
  });
}

const numPipe = tiles.reduce(
  (sum, row) => sum + row.reduce((s, t) => s + (t === Tile.PIPE ? 1 : 0), 0),
  0
);
const numA = tiles.reduce(
  (sum, row) => sum + row.reduce((s, t) => s + (t === Tile.A ? 1 : 0), 0),
  0
);
const numB = tiles.reduce(
  (sum, row) => sum + row.reduce((s, t) => s + (t === Tile.B ? 1 : 0), 0),
  0
);

printTiles();
console.log('part 1:', numPipe / 2);

const part2 =
  tiles[0][0] === Tile.A ? numB : tiles[0][0] === Tile.B ? numA : null;

console.log(
  'part 2:',
  part2 !== null ? part2 : 'could not automatically detect which side is inside'
);

console.log('  side \x1b[94mA\x1b[0m:', numA, 'tiles');
console.log('  side \x1b[93mB\x1b[0m:', numB, 'tiles');
