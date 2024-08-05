/*
https://adventofcode.com/2023/day/25

approach: 

Implement Karger's algorithm: 
https://en.wikipedia.org/wiki/Karger%27s_algorithm

The graph is represented as a (vertex -> array of neighbors) map. During an 
edge contraction, the 2 vertices to be merged are removed from the map. A new 
vertex representing the merged one with the neighbors set to be both of the 
previous vertices' neighbors (sans the two vertices themselves) is added to 
the map. Then, the neighbors are gone through, and any mention of the previous 
two vertices are replaced by the new one. This will lead to some neighbors 
being in the array multiple times, which represents a "multi-edge" as a result 
of the contraction. 

When the map is contracted to just 2 vertices, if the cut is a minimum cut
(its size is 3 as per the problem description)(the cut size is the amount of 
edges left in either of the remaining vertices), the two contracted vertices 
represent the 2 disconnected groups for the answer. 

The algorithm has an element of randomness to it, so if a 
minimum cut was not found, keep trying until it is found. 
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l);

const connectionsOriginal = new Map<string, Set<string>>();
lines.forEach((line) => {
  const labels = Array.from(line.matchAll(/[^\s:]+/g)).map((m) => m[0]);
  const [main, ...others] = labels;

  const oldMain = connectionsOriginal.get(main);
  if (oldMain) others.forEach((o) => oldMain.add(o));
  else connectionsOriginal.set(main, new Set(others));

  others.forEach((other) => {
    const oldOther = connectionsOriginal.get(other);
    if (oldOther) oldOther.add(main);
    else connectionsOriginal.set(other, new Set([main]));
  });
});

function copyOriginalConnections() {
  return new Map(
    Array.from(connectionsOriginal).map(([l, s]) => [l, Array.from(s)])
  );
}

function randomEntry<S, T>(fromMap: Map<S, T>) {
  const k = Array.from(fromMap);
  return k[Math.floor(Math.random() * k.length)];
}

let connections: Map<string, string[]>;

function contractRandomEdge() {
  const [label1, connections1] = randomEntry(connections);
  const label2 = connections1[Math.floor(Math.random() * connections1.length)];
  const connections2 = connections.get(label2);
  if (!connections2) throw new Error('could not find ' + label2);

  connections.delete(label1);
  connections.delete(label2);

  const newLabel = label1 + '-' + label2;
  const newConnections = connections1
    .concat(connections2)
    .filter((l) => l !== label1 && l !== label2);
  connections.set(newLabel, newConnections);

  newConnections.forEach((connectionLabel1) => {
    connections.set(
      connectionLabel1,
      connections
        .get(connectionLabel1)
        ?.flatMap((connectionLabel2) =>
          connectionLabel2 === label1 || connectionLabel2 === label2
            ? newLabel
            : connectionLabel2
        ) || []
    );
  });
}

while (true) {
  connections = copyOriginalConnections();

  console.time('try');
  while (connections.size > 2) {
    contractRandomEdge();
  }
  console.timeEnd('try');

  const first = Array.from(connections.values())[0];
  if (first.length > 3) {
    console.log('cut size', first.length, '> 3, retrying...');
  } else {
    console.log(`cut size ${first.length}, finished`);
    break;
  }
}

const sides = Array.from(connections.keys());
console.log('sides:');
console.log(sides[0], '\n');
console.log(sides[1]);
console.log(
  'answer:',
  (Array.from(sides[0].matchAll(/-/g)).length + 1) *
    (Array.from(sides[1].matchAll(/-/g)).length + 1)
);
