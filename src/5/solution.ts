/*
https://adventofcode.com/2023/day/5

approach:

Fairly straightforward, with a layer represented by an array of objects 
defining a mapping range. Each seed (range) is traversed through the 
mappings, and at the end, the lowest is chosen. 

For part 2, the ranges are represented by {start, end}-objects, and 
are split in case they happen to be on a boundary of a mapping range
*/
import fs from 'fs';

const fileName = process.argv[2];
const sections = fs
  .readFileSync(fileName)
  .toString()
  .split('\n\n')
  .flatMap((s) => (s ? [s] : []));

type MapRange = {
  source: number;
  destination: number;
  length: number;
};

//both start and end inclusive
type SeedRange = {
  start: number;
  end: number;
};

const seedIndividuals = Array.from(sections[0].matchAll(/\d+/g)).map((m) =>
  Number(m[0])
);

const seedRanges: SeedRange[] = Array.from(
  sections[0].matchAll(/(\d+) (\d+)/g)
).map(([_, s, l]) => ({ start: Number(s), end: Number(s) + Number(l) - 1 }));

const maps: MapRange[][] = sections.slice(1).map((str) =>
  Array.from(str.matchAll(/(\d+) (\d+) (\d+)/g))
    .map(([_, d, s, l]) => ({
      destination: Number(d),
      source: Number(s),
      length: Number(l),
    }))
    //highest range first
    .sort((a, b) => b.source - a.source)
);

function traverseSeed(seed: number, layer: MapRange[]) {
  for (const { destination, source, length } of layer) {
    if (seed >= source && seed < source + length) {
      return destination + seed - source;
    }
  }
  return seed;
}

function traverseIndividualSeeds(seeds: number[]) {
  let result = seeds;

  maps.forEach((layer) => {
    result = result.map((seed) => traverseSeed(seed, layer));
  });

  return result;
}

function traverseRange(range: SeedRange, layer: MapRange[]) {
  const result: SeedRange[] = [];

  let end = range.end;
  while (end >= range.start) {
    const nextMap = layer.find(({ source }) => end >= source);
    if (!nextMap) {
      result.push({ start: range.start, end });
      break;
    }

    if (end >= nextMap.source + nextMap.length) {
      result.push({
        start: Math.max(nextMap.source + nextMap.length, range.start),
        end: end,
      });
      end = nextMap.source + nextMap.length - 1;
    }

    if (end >= range.start) {
      const mapOffset = nextMap.destination - nextMap.source;

      result.push({
        start: Math.max(nextMap.source, range.start) + mapOffset,
        end: end + mapOffset,
      });
      end = nextMap.source - 1;
    }
  }

  return result;
}

function traverseSeedRanges(seeds: SeedRange[]) {
  let result = seeds;

  maps.forEach((layer) => {
    result = result.flatMap((range) => traverseRange(range, layer));
  });

  return result;
}

console.log(
  'part 1:',
  traverseIndividualSeeds(seedIndividuals).reduce((best, curr) =>
    Math.min(best, curr)
  )
);

console.log(
  'part 2:',
  traverseSeedRanges(seedRanges).reduce(
    (best, curr) => Math.min(best, curr.start),
    Infinity
  )
);
