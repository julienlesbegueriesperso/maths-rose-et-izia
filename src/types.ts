export interface Profile {
  name: string;
  age: number;
  color: string;
  colorHex: string;
  shadowHex: string;
  icon: string;
}

export interface Module {
  label: string;
  icon: string;
  color: string;
  btnClass: string;
  desc: string;
}

export interface AdditionQuestion {
  type: "addition";
  a: number;
  b: number;
  answer: number;
  c1: string;
  c2: string;
}

export interface MultiplicationQuestion {
  type: "multiplication";
  a: number;
  b: number;
  answer: number;
  c1: string;
}

export interface FractionQuestion {
  type: "fraction";
  num: number;
  den: number;
  answer: string;
  choices: string[];
  c1: string;
}

export interface DivisionQuestion {
  type: "division";
  total: number;
  groups: number;
  answer: number;
  c1: string;
}

export type Question =
  | AdditionQuestion
  | MultiplicationQuestion
  | FractionQuestion
  | DivisionQuestion;

export type Screen = "home" | "modules" | "game" | "results";
export type Difficulty = "easy" | "hard";
export type ProfileKey = "lea" | "emma";
export type ModuleKey = "addition" | "multiplication" | "fraction" | "division";

export interface AppState {
  screen: Screen;
  profile: ProfileKey | null;
  module: ModuleKey | null;
  difficulty: Difficulty;
  questions: Question[];
  qIndex: number;
  score: number;
  attempts: number;
  locked: boolean;
}

export type FeedbackType = "correct" | "wrong" | "retry" | "answer";
