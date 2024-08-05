/*
https://adventofcode.com/2023/day/7

approach:

Use 2 different card orderings (for tiebreakers) 
for whether the joker-rule is used or not. 

Each hand is assigned a score based on how good it is according to 
the list below, with jokers (if in use) added to the highest amount 
of cards, because it will always produce the best result. 

scores:
  five of a kind:  6
  four of a kind:  5
  full house:      4 (3+1)
  three of a kind: 3
  two pair:        2 (1+1)
  one pair:        1
  high card:       0
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs
  .readFileSync(fileName)
  .toString()
  .split('\n')
  .filter((l) => l);

const players = lines.map((l) => {
  const [hand, bid] = l.split(' ');
  return { hand, bid: Number(bid) };
});

const cardValueMap = new Map(
  ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'].map(
    (c, i) => [c, i]
  )
);
const cardValueMapJokers = new Map(
  ['J', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'Q', 'K', 'A'].map(
    (c, i) => [c, i]
  )
);
function cardValue(card: string, useJokers?: boolean) {
  const res = useJokers ? cardValueMapJokers.get(card) : cardValueMap.get(card);
  if (res === undefined) return -1;
  return res;
}

function scoreHand(hand: string, useJokers?: boolean) {
  const amountMap = new Map<string, number>();

  for (const card of hand) {
    amountMap.set(card, (amountMap.get(card) || 0) + 1);
  }

  const numJokers = amountMap.get('J') || 0;
  if (useJokers) {
    if (numJokers > 3) return 6;
    amountMap.delete('J');
  }

  const amounts = Array.from(amountMap.values());

  if (useJokers) {
    amounts.sort((a, b) => b - a);
    amounts[0] += numJokers;
  }

  let score = 0;

  amounts.forEach((n) => {
    if (n < 2) return;
    if (n === 2) return (score += 1);
    if (n === 3) return (score += 3);
    return (score += n + 1);
  });

  return score;
}

function tieBreaker(a: string, b: string, useJokers?: boolean) {
  for (let i = 0; i < a.length; i++) {
    const difference = cardValue(a[i], useJokers) - cardValue(b[i], useJokers);
    if (difference) return difference;
  }

  return 0;
}

function calculateWinnings(useJokers?: boolean) {
  return players
    .map(({ hand, bid }) => ({ hand, bid, score: scoreHand(hand, useJokers) }))
    .sort((a, b) => a.score - b.score || tieBreaker(a.hand, b.hand, useJokers))
    .map(({ bid }, rank) => (rank + 1) * bid);
}

console.log(
  'part 1:',
  calculateWinnings().reduce((sum, winning) => sum + winning, 0)
);
console.log(
  'part 2:',
  calculateWinnings(true).reduce((sum, winning) => sum + winning, 0)
);
