import type {
  Question,
  AdditionQuestion,
  MultiplicationQuestion,
  FractionQuestion,
  DivisionQuestion,
  ModuleKey,
  Difficulty,
} from "./types";
import { LEGO_COLORS, TOTAL_QUESTIONS } from "./constants";

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function darken(hex: string, pct: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = 1 - pct / 100;
  const r = Math.max(0, Math.round((n >> 16) * f));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * f));
  const b = Math.max(0, Math.round((n & 0xff) * f));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

export function generateQuestions(
  module: ModuleKey,
  difficulty: Difficulty,
): Question[] {
  const qs: Question[] = [];
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    qs.push(generateOneQuestion(module, difficulty));
  }
  return qs;
}

function generateOneQuestion(module: ModuleKey, diff: Difficulty): Question {
  const c1 = LEGO_COLORS[randInt(0, 3)];
  let c2 = LEGO_COLORS[randInt(4, 7)];
  while (c2 === c1) c2 = LEGO_COLORS[randInt(4, 7)];

  switch (module) {
    case "addition":
      return genAddition(diff, c1, c2);
    case "multiplication":
      return genMultiplication(diff, c1);
    case "fraction":
      return genFraction(diff, c1);
    case "division":
      return genDivision(diff, c1);
  }
}

function genAddition(
  diff: Difficulty,
  c1: string,
  c2: string,
): AdditionQuestion {
  let a: number, b: number;
  if (diff === "easy") {
    a = randInt(1, 6);
    b = randInt(1, 6);
  } else {
    a = randInt(3, 15);
    b = randInt(3, 15);
  }
  return { type: "addition", a, b, answer: a + b, c1, c2 };
}

function genMultiplication(
  diff: Difficulty,
  c1: string,
): MultiplicationQuestion {
  let a: number, b: number;
  if (diff === "easy") {
    const tables = [2, 3, 5];
    a = tables[randInt(0, 2)];
    b = randInt(1, 5);
    if (a * b > 15) {
      b = Math.min(b, Math.floor(15 / a));
    }
  } else {
    const tables = [4, 6, 7, 8];
    a = tables[randInt(0, 3)];
    b = randInt(2, Math.min(6, Math.floor(36 / a)));
  }
  return { type: "multiplication", a, b, answer: a * b, c1 };
}

function genFraction(diff: Difficulty, c1: string): FractionQuestion {
  let num: number, den: number;
  if (diff === "easy") {
    den = [2, 3, 4][randInt(0, 2)];
    num = randInt(1, den - 1);
  } else {
    den = [3, 4, 5, 6][randInt(0, 3)];
    num = randInt(1, den - 1);
  }
  const correct = `${num}/${den}`;
  const choices = [correct];
  const used = new Set([correct]);
  let tries = 0;
  while (choices.length < 4 && tries < 50) {
    tries++;
    let n: number, d: number;
    const t = randInt(0, 2);
    if (t === 0) {
      n = randInt(1, den);
      d = den;
    } else if (t === 1) {
      n = num;
      d = [2, 3, 4, 5, 6][randInt(0, 4)];
      if (n >= d) d = n + randInt(1, 3);
    } else {
      n = randInt(1, 4);
      d = randInt(2, 6);
      if (n >= d) {
        n = 1;
        d = randInt(2, 5);
      }
    }
    const key = `${n}/${d}`;
    if (!used.has(key) && n > 0 && d > 1 && n < d) {
      used.add(key);
      choices.push(key);
    }
  }
  while (choices.length < 4) {
    choices.push(`${randInt(1, 2)}/${randInt(3, 6)}`);
  }
  return {
    type: "fraction",
    num,
    den,
    answer: correct,
    choices: shuffle(choices),
    c1,
  };
}

function genDivision(diff: Difficulty, c1: string): DivisionQuestion {
  let groups: number, perGroup: number;
  if (diff === "easy") {
    groups = randInt(2, 3);
    perGroup = randInt(1, 5);
  } else {
    groups = randInt(2, 6);
    perGroup = randInt(2, 8);
    if (groups * perGroup > 36) perGroup = Math.floor(36 / groups);
  }
  const total = groups * perGroup;
  return {
    type: "division",
    total,
    groups,
    answer: perGroup,
    c1,
  };
}
