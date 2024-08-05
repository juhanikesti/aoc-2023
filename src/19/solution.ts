/* 
https://adventofcode.com/2023/day/19

approach:

Instead of labeling the attributes x, m, a, s, use 0, 1, 2, 3,
so their amounts can easily be stored in an array

For part 1, just go through the workflows with 
each part, like the problem description suggests.

For part 2, instead of single numbers for attributes, consider possible ranges 
for each attribute. Hold all currently open workflows in some kind of a queue 
(I use an array), along with the ranges of attributes that can end up at that 
workflow. Until the queue is empty, pop a workflow from the queue, split its 
possible attribute ranges according to the workflow's rules, and put the new 
ranges in the queue along with the workflow they are sent to. If a range of 
attributes is accepted, add them to a result array.
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n\n')
  .map((h) => h.split('\n'));

//[x, m, a, s]
type Part = [number, number, number, number];

type Workflow = {
  rules: {
    letter: number;
    operator: string;
    amount: number;
    destination: string;
  }[];
  final: string;
};

enum Letter {
  X = 0,
  M,
  A,
  S,
}

function letterIdx(letter: string) {
  switch (letter) {
    case 'x':
      return Letter.X;
    case 'm':
      return Letter.M;
    case 'a':
      return Letter.A;
    case 's':
      return Letter.S;
    default:
      throw new Error('unkown letter:' + letter);
  }
}

const workflows = new Map<string, Workflow>(
  lines[0].flatMap((line) => {
    const result = line.match(/^(.*){(.*),([a-zA-Z]+)}$/);
    if (!result) return [];

    const [_, label, ruleString, final] = result;
    const rules = Array.from(
      ruleString.matchAll(/([xmas])([<>])(\d+):([a-zA-Z]+)/g)
    ).map(([_, letter, operator, amount, destination]) => ({
      letter: letterIdx(letter),
      operator,
      amount: Number(amount),
      destination,
    }));

    return [[label, { rules, final }]];
  })
);

const parts: Part[] = lines[1].flatMap((line) => {
  const result = line.match(/^{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}$/);
  if (!result) return [];

  const [_, x, m, a, s] = result;
  return [[Number(x), Number(m), Number(a), Number(s)]];
});

function operateWorkflow(part: Part, label: string): string {
  const workflow = workflows.get(label);
  if (!workflow) throw new Error('workflow not found: ' + label);

  for (let i = 0; i < workflow.rules.length; i++) {
    const { letter, operator, amount, destination } = workflow.rules[i];

    if (operator === '>') {
      if (part[letter] > amount) return destination;
    } else {
      if (part[letter] < amount) return destination;
    }
  }

  return workflow.final;
}

function acceptedParts(parts: Part[]): Part[] {
  return parts.filter((part) => {
    let nextLabel = 'in';

    while (true) {
      nextLabel = operateWorkflow(part, nextLabel);
      if (nextLabel === 'A') return true;
      if (nextLabel === 'R') return false;
    }
  });
}

console.log(
  'part 1:',
  acceptedParts(parts).reduce((sum, [x, m, a, s]) => sum + x + m + a + s, 0)
);

//both inclusive
type Section = {
  start: number;
  end: number;
};

type PartSection = [Section[], Section[], Section[], Section[]];

//return arrays do not include the value that is equal to the splitter
function split(sections: Section[], splitter: number) {
  const below: Section[] = [];
  const above: Section[] = [];

  sections.forEach((sec) => {
    if (sec.end < splitter) below.push(sec);
    else if (sec.start > splitter) above.push(sec);
    else {
      if (sec.start !== splitter)
        below.push({ start: sec.start, end: splitter - 1 });
      if (sec.end !== splitter)
        above.push({ start: splitter + 1, end: sec.end });
    }
  });

  return [below, above];
}

function acceptedPartRanges(): PartSection[] {
  const queue: { label: string; amounts: PartSection }[] = [
    {
      label: 'in',
      amounts: [
        [{ start: 1, end: 4000 }],
        [{ start: 1, end: 4000 }],
        [{ start: 1, end: 4000 }],
        [{ start: 1, end: 4000 }],
      ],
    },
  ];

  const result: PartSection[] = [];

  while (true) {
    const current = queue.pop();
    if (!current) break;
    if (current.label === 'R') continue;
    if (current.label === 'A') {
      result.push(current.amounts);
      continue;
    }

    const workflow = workflows.get(current.label);
    if (!workflow)
      throw new Error('no workflow found for label: ' + current.label);

    workflow.rules.forEach(({ letter, operator, amount, destination }) => {
      const greaterThan = operator === '>';

      const [below, above] = split(current.amounts[letter], amount);
      const [accept, reject] = greaterThan ? [above, below] : [below, above];
      reject.push({ start: amount, end: amount });

      current.amounts[letter] = reject;
      queue.push({
        label: destination,
        amounts: <PartSection>(
          current.amounts.map((sections, idx) =>
            idx === letter ? accept : sections
          )
        ),
      });
    });

    queue.push({ label: workflow.final, amounts: current.amounts });
  }

  return result;
}

const numAllAcceptedParts = acceptedPartRanges().reduce(
  (total, group) =>
    total +
    group.reduce(
      (groupTotal, letter) =>
        groupTotal *
        letter.reduce(
          (letterTotal, section) =>
            letterTotal + section.end - section.start + 1,
          0
        ),
      1
    ),
  0
);

console.log('part 2:', numAllAcceptedParts);
