/*
https://adventofcode.com/2023/day/24

approach: 

For part 1, implementing a 2D intersection finder is quite trivial, and I just 
use it to check every pair of rays. 

Part 2 is more of a math problem, so I decided to use math tools to solve it 
instead of code. Here's the way I solved it: 

I got quite far myself, but could not figure it out in the end, thanks to /u/evouga's
explanation I was able to finish it:
https://old.reddit.com/r/adventofcode/comments/18pnycy/2023_day_24_solutions/kepu26z/

Take 3 linearly independent lines from the data. 
Each line i has its known: 
  starting positions Pi (= [ xi,  yi,  zi])
  velocities         Vi (= [dxi, dyi, dzi])
The thrown rock has unknown:
  starting position P (= [ x,  y,  z])
  velocity          V (= [dx, dy, dz])

For each line, there is some time ti, during 
which it intersects with the rock line:
  P + ti*V = Pi + ti*Vi
=> P - Pi = -ti * (V - Vi)

Since ti is a scalar, vectors (P - Pi) and (Vi - V) have to be linearly 
dependent, so their cross product (marked A x B) has to equal 0:
  (P - Pi) x (V - Vi) = [0,0,0]

This is a system of bilinear equations, but it is possible to get a linear one.
=> P x V - P x Vi - Pi x V + Pi x Vi = [0,0,0]
=> P x V  =  P x Vi + Pi x (V - Vi)

(P x V) is a constant, so for line i,j, linear system of equations:
P x Vi + Pi x (V - Vi) = P x Vj + Pj x (V - Vj)

Now it's just a matter of expanding that equation for two different pairs of 
lines/rays and solving the resulting linear system of equations (6 equations 
and variables). 
*/
import fs from 'fs';

const fileName = process.argv[2];
const matches = fs
  .readFileSync(fileName)
  .toString()
  .matchAll(/(\d+), (\d+), (\d+) @ (-?\d+), (-?\d+), (-?\d+)/g);

/*
const xMin = 7;
const xMax = 27;
const yMin = 7;
const yMax = 27;
*/

const xMin = 200000000000000;
const xMax = 400000000000000;
const yMin = 200000000000000;
const yMax = 400000000000000;

type Hailstone = {
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  dz: number;
};

const hailstones: Hailstone[] = Array.from(matches).map((result) => {
  const [x, y, z, dx, dy, dz] = result.slice(1, 7).map((s) => parseInt(s));
  return { x, y, z, dx, dy, dz };
});

type Line2D = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const lines2D = hailstones.map(({ x, y, dx, dy }): Line2D => {
  return { x1: x, y1: y, x2: x + dx, y2: y + dy };
});

function isInBounds2D(x: number, y: number) {
  return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
}

function check2Dintersection(
  { x1, y1, x2, y2 }: Line2D,
  { x1: x3, y1: y3, x2: x4, y2: y4 }: Line2D
) {
  /*
  https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line_segment
  Though t and u are used to ensure that the intersection is "in the present", 
  instead of checking whether they are within the segments. In case of no 
  intersection, infinities are encountered, which obviously are out of bounds. 
  */
  const t =
    ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) /
    ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
  const u =
    ((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) /
    ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
  return (
    t > 0 &&
    u < 0 &&
    isInBounds2D(x1 + t * (x2 - x1), y1 + t * (y2 - y1))
  );
}

let count = 0;
lines2D.forEach((line1, i) => {
  lines2D.slice(i + 1).forEach((line2) => {
    if (check2Dintersection(line1, line2)) {
      count++;
    }
  });
});

console.log('part 1:', count);

const h1 = hailstones[0];
const h2 =
  hailstones.find(
    (h) => h.dx / h1.dx !== h.dy / h1.dy || h.dy / h1.dy !== h.dz / h1.dz
  ) || hailstones[1];
const h3 =
  hailstones.find(
    (h) =>
      (h.dx / h1.dx !== h.dy / h1.dy || h.dy / h1.dy !== h.dz / h1.dz) &&
      (h.dx / h2.dx !== h.dy / h2.dy || h.dy / h2.dy !== h.dz / h2.dz)
  ) || hailstones[2];

console.log('3 linearly independent lines for part 2:');
console.log(h1);
console.log(h2);
console.log(h3);
