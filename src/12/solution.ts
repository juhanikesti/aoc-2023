/*
https://adventofcode.com/2023/day/12

approach:

The input strings are split into the sections that only contain '#'- and '?'-
characters, so the '.'-characters do not have to be handled in the algorithm. 

I forgot that memoization existed, so instead of just memoizing a more 
straight-forward recursive solution, I created a binary search -esque 
recursive solution. For each recursion step, all possible positions of 
the middle-most group are calculated, and then the recursion step is 
applied for all of the right and left sides. For each possible location
of the middle group, multiply together the permutations of possible 
arrangements of groups on its left and right side to obtain number of 
possible permutations when the middle group is located there. 

Adding simple memoization after the fact provides a 5-10x time improvement, 
though even without it, the algorithm finishes in a human-viable time without 
any stack overflow problems (1-2min on my machine and input). 
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .flatMap<[string, number[]]>((l) => {
    if (!l) return [];
    const [s, g] = l.split(' ');
    return [[s, Array.from(g.matchAll(/\d+/g)).map((n) => Number(n))]];
  });

const data1 = lines.map<[string[], number[]]>(([s, g]) => [s.split(/\.+/), g]);
const data2 = lines.map<[string[], number[]]>(([s, g]) => [
  `${s}?${s}?${s}?${s}?${s}`.split(/\.+/),
  [...g, ...g, ...g, ...g, ...g],
]);

//calculates the sections before and after
//every possible position for the group
function splitSections(
  group: number,
  sections: string[]
): [string[], string[]][] {
  const result: [string[], string[]][] = [];
  sections.forEach((section, sectionIndex) => {
    if (section.length - group < 0) return;

    const sectionsBefore = sections.slice(0, sectionIndex);
    const sectionsAfter = sections.slice(sectionIndex + 1);

    for (let i = 0; i <= section.length - group; i++) {
      if (section[i + group] !== '#' && section[i - 1] !== '#') {
        result.push([
          [...sectionsBefore, section.slice(0, Math.max(i - 1, 0))],
          [section.slice(i + group + 1), ...sectionsAfter],
        ]);
      }
    }
  });

  return result;
}

function singlePermutations(group: number, sections: string[]): number {
  return sections.reduce(
    (sum, section) => Math.max(sum, sum + section.length - group + 1),
    0
  );
}

function singlePermutationsForce(group: number, section: string): number {
  if (section.length < group) return 0; //group does not fit
  const first = section.indexOf('#');
  const last = section.lastIndexOf('#');
  if (last - first >= group) return 0; //group too small to cover all

  return Math.min(
    group - (last - first),    //maximum possible
    first + 1,                 //beginning limits
    section.length - last,     //end limits
    section.length - group + 1 //section size limits
  );
}

const permutationMemo = new Map<string, number>();
function possiblePermutations(groups: number[], sections: string[]): number {
  const memoStr = JSON.stringify([groups, sections]);
  const resultPrev = permutationMemo.get(memoStr);
  if (resultPrev !== undefined) return resultPrev;

  const sectionsReal = sections.filter((s) => s);
  const sectionsForced = sectionsReal.filter((s) => s.includes('#'));
  const isForced = sectionsForced.length > 0;

  //trivially possible
  if (!groups.length && !isForced) {
    return 1;
  }

  //trivially impossible
  if (
    !groups.length ||
    !sectionsReal.length ||
    sectionsForced.length > groups.length //not exhaustive
  ) {
    return 0;
  }

  let result: number;
  if (groups.length === 1) {
    result = isForced
      ? singlePermutationsForce(groups[0], sectionsForced[0])
      : singlePermutations(groups[0], sectionsReal);
  } else {
    const middle = Math.floor(groups.length / 2);

    result = splitSections(groups[middle], sectionsReal).reduce(
      (sum, [before, after]) => {
        return (
          sum +
          possiblePermutations(groups.slice(0, middle), before) *
            possiblePermutations(groups.slice(middle + 1), after)
        );
      },
      0
    );
  }

  permutationMemo.set(memoStr, result);
  return result;
}

console.log(
  'part 1:',
  data1.reduce(
    (sum, [sections, groups]) => sum + possiblePermutations(groups, sections),
    0
  )
);
console.log(`calculating... (out of ${data2.length})`)
console.log(
  '\npart 2:',
  data2.reduce((sum, [sections, groups], i) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(String(i));

    return sum + possiblePermutations(groups, sections);
  }, 0)
);
