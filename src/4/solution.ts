/*
https://adventofcode.com/2023/day/4

approach:

For each row (card), extract the numbers with regex and 
check how many winning numbers are in the card numbers. 

For part 1, sum the powers of the scores. 

For part 2, keep track of the amounts of each card, and iterate through 
the cards, incrementing each won card by the amount of the winning card.
Then calculate the sum of the amounts of cards.
*/
import fs from 'fs';

const fileName = process.argv[2];
const rows = fs
  .readFileSync(fileName)
  .toString()
  .split(/\n/)
  .filter((s) => s);

const cardScores = rows.map((row) => {
  const winners = Array.from(row.matchAll(/\d+(?=.*\|)(?!.*:)/g)).map((m) =>
    Number(m[0])
  );
  const numbers = Array.from(row.matchAll(/\d+(?<=\|.*)/g)).map((m) =>
    Number(m[0])
  );

  return winners.reduce(
    (score, winner) => score + (numbers.includes(winner) ? 1 : 0),
    0
  );
});

console.log(
  'part 1:',
  cardScores.reduce(
    (sum, score) => sum + (score ? Math.pow(2, score - 1) : 0),
    0
  )
);

const cardAmounts = cardScores.map(() => 1);
for (let card = 0; card < cardScores.length; card++) {
  for (
    let rewardCard = card + 1;
    rewardCard < card + 1 + cardScores[card] && rewardCard < cardAmounts.length;
    rewardCard++
  ) {
    cardAmounts[rewardCard] += cardAmounts[card];
  }
}

console.log(
  'part 2:',
  cardAmounts.reduce((sum, score) => sum + score, 0)
);
