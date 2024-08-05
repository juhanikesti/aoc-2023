/* 
https://adventofcode.com/2023/day/20

approach:

For part 1, just simulate the button presses 
with signals going into a FIFO queue. 

For part 2, I opted not to code a solution, since that would have required
making a lot of assumptions and observations about the input data. Instead, 
I make a dot file to be used with graphviz, to visualize the system and 
calculate the answer by hand. 

I used `dot -Tsvg graph.dot -o graph.svg` for my graph. 

The graph clearly separates into four different areas that happen to function 
as binary "mod counters". The LCM of their cycle lengths is the answer.
*/
import fs from 'fs';

const fileName = process.argv[2];
const lines = fs.readFileSync(fileName).toString().split('\n');

enum ModuleTypes {
  FLIPFLOP,
  CONJUNCTION,
}

type Module = {
  outputs: string[];
} & (
  | { module: ModuleTypes.FLIPFLOP; state: boolean }
  | { module: ModuleTypes.CONJUNCTION; inputs: Map<string, boolean> }
);

type Signal = {
  to: string;
  from: string;
  high: boolean;
};

const broadcasterOutputs: string[] = [];
const modules = new Map<string, Module>();
const signals: Signal[] = [];

lines.forEach((line) => {
  const result = line.match(/^([%&]?)(\S+) -> (.*)$/);
  if (!result) return;

  const [_, prefix, label, outputString] = result;
  const outputs = outputString.split(', ');

  if (prefix === '%') {
    modules.set(label, {
      module: ModuleTypes.FLIPFLOP,
      outputs,
      state: false,
    });
  } else if (prefix === '&') {
    modules.set(label, {
      module: ModuleTypes.CONJUNCTION,
      outputs,
      inputs: new Map<string, boolean>(),
    });
  } else if (!prefix) {
    broadcasterOutputs.push(...outputs);
  }
});

//initialize conjunction inputs
Array.from(modules).forEach(([label, { outputs }]) => {
  outputs.forEach((outputLabel) => {
    const output = modules.get(outputLabel);
    if (output?.module === ModuleTypes.CONJUNCTION)
      output.inputs.set(label, false);
  });
});

function operateModule({ to, from, high }: Signal): Signal[] {
  const module = modules.get(to);
  if (module?.module === ModuleTypes.FLIPFLOP) {
    if (high) return [];

    module.state = !module.state;
    return module.outputs.map((label) => ({
      to: label,
      from: to,
      high: module.state,
    }));
  } else if (module?.module === ModuleTypes.CONJUNCTION) {
    module.inputs.set(from, high);
    const sendLow = Array.from(module.inputs.values()).reduce(
      (a, b) => a && b,
      true
    );

    return module.outputs.map((label) => ({
      to: label,
      from: to,
      high: !sendLow,
    }));
  }

  return [];
}

let lows = 0;
let highs = 0;
function recordRound(numSignals: [number, number]) {
  lows += numSignals[0];
  highs += numSignals[1];
}

for (let i = 0; i < 1000; i++) {
  const numSignals: [number, number] = [1, 0];
  signals.push(
    ...broadcasterOutputs.map((to) => ({
      to,
      from: 'broadcaster',
      high: false,
    }))
  );

  while (true) {
    const signal = signals.splice(0, 1).at(0);
    if (!signal) break;
    numSignals[Number(signal.high)]++;
    signals.push(...operateModule(signal));
  }

  recordRound(numSignals);
}

console.log('part 1:', lows * highs, `(${lows} low, ${highs} high)`);

const fileNameOut = process.argv[3] || 'graph.dot';
let str = 'digraph {\n';
str += 'BTN -> bro\n';
str += `bro -> {${broadcasterOutputs.reduce((s, o) => s + ',' + o)}}\n`;
Array.from(modules).forEach(([label, { module, outputs }]) => {
  str += `${label} -> {${outputs.reduce((s, o) => s + ',' + o)}}\n`;
  if (module === ModuleTypes.CONJUNCTION) str += `${label} [shape=Msquare]\n`;
});
str += '}\n';
fs.writeFileSync(fileNameOut, str);

console.log(fileNameOut, 'created for part 2');
