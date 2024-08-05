/*
https://adventofcode.com/2023/day/6

approach:

Distance traveled in the race is:
distance (mm) = timeHeld (ms) * 1 (mm/ms^2) * (time (ms) - timeHeld (ms))

This is a quadratic polynomial wrt. timeHeld:
timeHeld^2 - time * timeHeld + distance = 0

The winning threshold distance and the quadratic formula can be used 
to get the two hold time thresholds between which the race will be won. 
These thresholds need to be rounded away from the winning side 
due to only being able to hold the button in 1ms increments. 

The difference of the quantized winning thresholds decremented by 1 is
the winning margin of the race (the answer). The decrementation is due
to both of the thresholds being rounded away from the winning side. 

If only using integers was necessary, 
the thresholds could also be found with binary search. 
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs.readFileSync(fileName).toString().split('\n');

const times = Array.from(lines[0].matchAll(/\d+/g)).map((m) => Number(m[0]));
const distances = Array.from(lines[1].matchAll(/\d+/g)).map((m) =>
  Number(m[0])
);

function margin(time: number, distance: number) {
  return (
    Math.ceil((time + Math.sqrt(time * time - 4 * distance)) / 2) -
    Math.floor((time - Math.sqrt(time * time - 4 * distance)) / 2) -
    1
  );
}

console.log(
  'part 1:',
  times.reduce((result, time, i) => result * margin(time, distances[i]), 1)
);

console.log(
  'part 2:',
  margin(
    Number(times.reduce((str, num) => str + num, '')),
    Number(distances.reduce((str, num) => str + num, ''))
  )
);
