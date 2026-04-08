import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

// ===== TYPES =====

interface Profile {
  name: string;
  age: number;
  color: string;
  colorHex: string;
  shadowHex: string;
  icon: string;
}

interface Module {
  label: string;
  icon: string;
  color: string;
  btnClass: string;
  desc: string;
}

interface AdditionQuestion {
  type: "addition";
  a: number;
  b: number;
  answer: number;
  c1: string;
  c2: string;
}

interface MultiplicationQuestion {
  type: "multiplication";
  a: number;
  b: number;
  answer: number;
  c1: string;
}

interface FractionQuestion {
  type: "fraction";
  num: number;
  den: number;
  answer: string;
  choices: string[];
  c1: string;
}

interface DivisionQuestion {
  type: "division";
  total: number;
  groups: number;
  answer: number;
  c1: string;
}

type Question =
  | AdditionQuestion
  | MultiplicationQuestion
  | FractionQuestion
  | DivisionQuestion;

type Screen = "home" | "modules" | "game" | "results";
type Difficulty = "easy" | "hard";
type ProfileKey = "lea" | "emma";
type ModuleKey = "addition" | "multiplication" | "fraction" | "division";

interface AppState {
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

// ===== CONSTANTS =====

const PROFILES: Record<ProfileKey, Profile> = {
  lea: {
    name: "Izia",
    age: 6,
    color: "var(--pink)",
    colorHex: "#F785B1",
    shadowHex: "#D06090",
    icon: "fa-wand-magic-sparkles",
  },
  emma: {
    name: "Rose",
    age: 8,
    color: "var(--teal)",
    colorHex: "#1A9E8F",
    shadowHex: "#127A6E",
    icon: "fa-bolt",
  },
};

const MODULES: Record<ModuleKey, Module> = {
  addition: {
    label: "Additions",
    icon: "fa-plus",
    color: "var(--red)",
    btnClass: "btn-red",
    desc: "Compter les briques",
  },
  multiplication: {
    label: "Multiplications",
    icon: "fa-xmark",
    color: "var(--green)",
    btnClass: "btn-green",
    desc: "Des rangées de briques",
  },
  fraction: {
    label: "Fractions",
    icon: "fa-chart-pie",
    color: "var(--orange)",
    btnClass: "btn-orange",
    desc: "Des parts de plaque",
  },
  division: {
    label: "Divisions",
    icon: "fa-arrows-split-up-and-left",
    color: "var(--blue)",
    btnClass: "btn-blue",
    desc: "Partager les briques",
  },
};

const LEGO_COLORS = [
  "#D01012",
  "#00852B",
  "#0057A8",
  "#FE8A18",
  "#F5CD2F",
  "#F785B1",
  "#1A9E8F",
  "#8B5E3C",
];

const TOTAL_QUESTIONS = 8;

// ===== UTILITY FUNCTIONS =====

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function darken(hex: string, pct: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = 1 - pct / 100;
  const r = Math.max(0, Math.round((n >> 16) * f));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * f));
  const b = Math.max(0, Math.round((n & 0xff) * f));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

const App = () => {
  // ===== STATE =====
  const [state, setState] = useState<AppState>({
    screen: "home",
    profile: null,
    module: null,
    difficulty: "easy",
    questions: [],
    qIndex: 0,
    score: 0,
    attempts: 0,
    locked: false,
  });

  // ===== REFS =====
  const answerInputRef = useRef<HTMLInputElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const confettiAnimIdRef = useRef<number | null>(null);
  const confettiParticlesRef = useRef<any[]>([]);

  // ===== EFFECTS =====

  // Focus answer input when in game
  useEffect(() => {
    if (state.screen === "game") {
      setTimeout(() => {
        answerInputRef.current?.focus();
      }, 100);
    }
  }, [state.screen, state.qIndex]);

  // Init confetti canvas
  useEffect(() => {
    const canvas = confettiCanvasRef.current;
    if (canvas) {
      confettiCtxRef.current = canvas.getContext("2d");
      resizeConfetti();
      window.addEventListener("resize", resizeConfetti);
    }
    return () => {
      window.removeEventListener("resize", resizeConfetti);
    };
  }, []);

  // ===== SOUND =====
  const playSound = useCallback((type: "correct" | "wrong" | "star") => {
    try {
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      if (type === "correct") {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + i * 0.1 + 0.3,
          );
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
      } else if (type === "wrong") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = 220;
        osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "star") {
        [880, 1047, 1319].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + i * 0.12 + 0.2,
          );
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.2);
        });
      }
    } catch (e) {
      // Ignore audio errors
    }
  }, []);

  // ===== CONFETTI =====
  function resizeConfetti() {
    const canvas = confettiCanvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  const animateConfetti = useCallback(() => {
    const ctx = confettiCtxRef.current;
    const canvas = confettiCanvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiParticlesRef.current = confettiParticlesRef.current.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.rotation += p.rotSpeed;
      p.life -= 0.006;

      if (p.life > 0 && p.y < canvas.height + 50) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        return true;
      }
      return false;
    });

    if (confettiParticlesRef.current.length > 0) {
      confettiAnimIdRef.current = requestAnimationFrame(animateConfetti);
    } else {
      confettiAnimIdRef.current = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const spawnConfetti = useCallback(() => {
    const colors = [
      "#D01012",
      "#F5CD2F",
      "#00852B",
      "#0057A8",
      "#FE8A18",
      "#F785B1",
      "#1A9E8F",
    ];

    for (let i = 0; i < 55; i++) {
      confettiParticlesRef.current.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 7,
        vy: Math.random() * 3 + 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1,
      });
    }

    if (!confettiAnimIdRef.current) {
      confettiAnimIdRef.current = requestAnimationFrame(animateConfetti);
    }
  }, [animateConfetti]);

  // ===== BRICK RENDERING =====
  function brickHTML(color: string, delayIdx?: number) {
    const s = darken(color, 22);
    const style: React.CSSProperties = {
      ["--c" as any]: color,
      ["--s" as any]: s,
      ...(delayIdx !== undefined
        ? { ["--d" as any]: `${(delayIdx * 0.04).toFixed(2)}s` }
        : {}),
    };
    return (
      <div className="brick" style={style}>
        <div className="stud"></div>
      </div>
    );
  }

  function brickRowHTML(count: number, color: string, startIdx?: number): any {
    const si = startIdx || 0;
    return (
      <div className="brick-row">
        {Array.from({ length: count }, (_, i) => brickHTML(color, si + i))}
      </div>
    );
  }

  // ===== QUESTION GENERATION =====
  function generateQuestions(
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

  // ===== VISUAL RENDERING =====
  function renderVisual(q: Question) {
    switch (q.type) {
      case "addition":
        return renderAdditionVisual(q);
      case "multiplication":
        return renderMultiplicationVisual(q);
      case "fraction":
        return renderFractionVisual(q);
      case "division":
        return renderDivisionVisual(q);
    }
  }

  function renderAdditionVisual(q: AdditionQuestion) {
    return (
      <div className="visual-area">
        <div className="visual-row">{brickRowHTML(q.a, q.c1, 0)}</div>
        <div className="brick-group-label">
          {q.a} brique{q.a > 1 ? "s" : ""}
        </div>
        <div className="operator">+</div>
        <div className="visual-row">{brickRowHTML(q.b, q.c2, q.a)}</div>
        <div className="brick-group-label">
          {q.b} brique{q.b > 1 ? "s" : ""}
        </div>
        <div className="operator">=</div>
        <div className="operator" style={{ color: "var(--orange)" }}>
          ?
        </div>
      </div>
    );
  }

  function renderMultiplicationVisual(q: MultiplicationQuestion) {
    const rows = [];
    let idx = 0;
    for (let r = 0; r < q.a; r++) {
      rows.push(brickRowHTML(q.b, q.c1, idx));
      idx += q.b;
    }
    return (
      <div className="visual-area" style={{ gap: "6px" }}>
        {rows}
        <div className="brick-group-label" style={{ marginTop: "8px" }}>
          <i
            className="fa-solid fa-arrow-right"
            style={{ marginRight: "4px" }}
          ></i>
          {q.a} rangée{q.a > 1 ? "s" : ""} de {q.b} briques
        </div>
      </div>
    );
  }

  function renderFractionVisual(q: FractionQuestion) {
    let pw = 72,
      ph = 52,
      studsPerSection = 3;
    if (q.den >= 5) {
      pw = 58;
      ph = 48;
      studsPerSection = 2;
    }
    if (q.den >= 6) {
      pw = 52;
      ph = 44;
      studsPerSection = 2;
    }

    const sections = [];
    for (let i = 0; i < q.den; i++) {
      const colored = i < q.num;
      const c = colored ? q.c1 : "#C8C0B8";
      const s = colored ? darken(q.c1, 22) : "#A09890";

      const studs = [];
      for (let j = 0; j < studsPerSection; j++) {
        studs.push(
          <div
            key={j}
            className="plate-stud"
            style={{ ["--c" as any]: c, ["--s" as any]: s }}
          ></div>,
        );
      }

      sections.push(
        <div
          key={i}
          className="plate-section"
          style={{
            ["--c" as any]: c,
            ["--s" as any]: s,
            ["--pw" as any]: `${pw}px`,
            ["--ph" as any]: `${ph}px`,
          }}
        >
          {studs}
        </div>,
      );
    }

    return (
      <div className="visual-area" style={{ gap: "14px" }}>
        <div className="fraction-plate">{sections}</div>
        <div className="brick-group-label">
          <i
            className="fa-solid fa-circle-question"
            style={{ marginRight: "4px" }}
          ></i>
          Quelle fraction est colorée ?
        </div>
      </div>
    );
  }

  function renderDivisionVisual(q: DivisionQuestion) {
    return (
      <div className="visual-area" style={{ gap: "8px" }}>
        <div className="visual-row" style={{ alignItems: "stretch" }}>
          {Array.from({ length: q.groups }, (_, g) => {
            const idx = g * q.answer;
            return (
              <div
                key={g}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                  alignItems: "center",
                }}
              >
                {g > 0 && <div className="div-separator"></div>}
                {brickRowHTML(q.answer, q.c1, idx)}
                {q.groups <= 6 && (
                  <div
                    className="brick-group-label"
                    style={{ fontSize: "0.75rem" }}
                  >
                    groupe {g + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="brick-group-label" style={{ marginTop: "6px" }}>
          <i
            className="fa-solid fa-arrow-right"
            style={{ marginRight: "4px" }}
          ></i>
          {q.total} briques partagées en {q.groups} groupes
        </div>
      </div>
    );
  }

  // ===== QUESTION TEXT =====
  function renderQuestionText(q: Question) {
    switch (q.type) {
      case "addition":
        return (
          <p
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.3rem",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Combien en total ?<br />
            <span style={{ color: "var(--muted)", fontSize: "1.1rem" }}>
              {q.a} + {q.b} = ?
            </span>
          </p>
        );
      case "multiplication":
        return (
          <p
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.3rem",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Combien de briques ?<br />
            <span style={{ color: "var(--muted)", fontSize: "1.1rem" }}>
              {q.a} × {q.b} = ?
            </span>
          </p>
        );
      case "fraction":
        return (
          <p
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.2rem",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Choisis la bonne fraction :
          </p>
        );
      case "division":
        return (
          <p
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: "1.3rem",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Combien par groupe ?<br />
            <span style={{ color: "var(--muted)", fontSize: "1.1rem" }}>
              {q.total} ÷ {q.groups} = ?
            </span>
          </p>
        );
    }
  }

  // ===== ANSWER AREA =====
  function renderAnswerArea(q: Question) {
    if (q.type === "fraction") {
      return (
        <div className="fraction-choices">
          {q.choices.map((choice) => (
            <button
              key={choice}
              className="fraction-choice"
              onClick={() => submitFraction(choice)}
            >
              {choice}
            </button>
          ))}
        </div>
      );
    }

    return (
      <>
        <input
          ref={answerInputRef}
          type="number"
          className="answer-input"
          placeholder="?"
          autoComplete="off"
          inputMode="numeric"
          onKeyDown={(e) => {
            if (e.key === "Enter") submitNumeric();
          }}
        />
        <button
          className="btn btn-teal btn-full"
          style={{ marginTop: "10px" }}
          onClick={submitNumeric}
        >
          <i className="fa-solid fa-check"></i> Valider
        </button>
      </>
    );
  }

  // ===== GAME LOGIC =====
  function selectProfile(name: ProfileKey) {
    setState({
      ...state,
      profile: name,
      difficulty: name === "lea" ? "easy" : "hard",
      screen: "modules",
    });
  }

  function goHome() {
    setState({
      ...state,
      screen: "home",
      profile: null,
      module: null,
    });
  }

  function startGame(module: ModuleKey) {
    setState({
      ...state,
      module,
      qIndex: 0,
      score: 0,
      attempts: 0,
      locked: false,
      questions: generateQuestions(module, state.difficulty),
      screen: "game",
    });
  }

  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "correct" | "wrong" | "retry" | "answer"
  >("correct");
  const [feedbackText, setFeedbackText] = useState("");

  function hideFeedback() {
    setShowFeedback(false);
  }

  function bounceBricks() {
    document
      .querySelectorAll(".brick")
      .forEach((b) => b.classList.add("bounce"));
  }

  function shakeBricks() {
    document
      .querySelectorAll(".brick")
      .forEach((b) => b.classList.add("shake"));
    setTimeout(() => {
      document
        .querySelectorAll(".brick")
        .forEach((b) => b.classList.remove("shake"));
    }, 500);
  }

  function shakeInput() {
    const input = answerInputRef.current;
    if (input) {
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 500);
    }
  }

  function submitNumeric() {
    if (state.locked) return;
    const input = answerInputRef.current;
    if (!input) return;

    const val = input.value.trim();
    if (val === "") return;

    const numVal = parseInt(val, 10);
    if (isNaN(numVal)) return;

    const q = state.questions[state.qIndex];

    if (
      (q.type === "addition" ||
        q.type === "multiplication" ||
        q.type === "division") &&
      numVal === q.answer
    ) {
      setState({ ...state, locked: true, score: state.score + 1, attempts: 0 });
      playSound("correct");
      setFeedbackType("correct");
      setFeedbackText("Bravo !");
      setShowFeedback(true);
      bounceBricks();
      spawnConfetti();
      setTimeout(() => {
        hideFeedback();
        nextQuestion();
      }, 1500);
    } else {
      const newAttempts = state.attempts + 1;
      if (newAttempts >= 2) {
        setState({ ...state, locked: true, attempts: newAttempts });
        playSound("wrong");
        setFeedbackType("answer");
        setFeedbackText(`La réponse était ${q.answer}`);
        setShowFeedback(true);
        shakeBricks();
        setTimeout(() => {
          hideFeedback();
          nextQuestion();
        }, 2500);
      } else {
        setState({ ...state, attempts: newAttempts });
        playSound("wrong");
        setFeedbackType("retry");
        setFeedbackText("Essaie encore !");
        setShowFeedback(true);
        shakeBricks();
        input.value = "";
        shakeInput();
        setTimeout(() => {
          hideFeedback();
          input.focus();
        }, 500);
      }
    }
  }

  function submitFraction(choice: string) {
    if (state.locked) return;
    const q = state.questions[state.qIndex] as FractionQuestion;

    const btns = document.querySelectorAll(".fraction-choice");
    btns.forEach((btn) => {
      btn.classList.add("disabled");
      if ((btn as HTMLElement).textContent === choice && choice === q.answer) {
        btn.classList.add("correct");
      } else if (
        (btn as HTMLElement).textContent === choice &&
        choice !== q.answer
      ) {
        btn.classList.add("wrong");
      }
    });

    if (choice === q.answer) {
      setState({ ...state, locked: true, score: state.score + 1, attempts: 0 });
      playSound("correct");
      setFeedbackType("correct");
      setFeedbackText("Bravo !");
      setShowFeedback(true);
      bounceBricks();
      spawnConfetti();
      setTimeout(() => {
        hideFeedback();
        nextQuestion();
      }, 1500);
    } else {
      const newAttempts = state.attempts + 1;
      if (newAttempts >= 2) {
        setState({ ...state, locked: true, attempts: newAttempts });
        playSound("wrong");
        // Show correct answer
        btns.forEach((btn) => {
          if ((btn as HTMLElement).textContent === q.answer) {
            btn.classList.add("correct");
          }
        });
        setFeedbackType("answer");
        setFeedbackText(`C'était ${q.answer}`);
        setShowFeedback(true);
        setTimeout(() => {
          hideFeedback();
          nextQuestion();
        }, 2500);
      } else {
        setState({ ...state, attempts: newAttempts });
        playSound("wrong");
        setFeedbackType("retry");
        setFeedbackText("Essaie encore !");
        setShowFeedback(true);
        // Re-enable buttons except clicked one
        setTimeout(() => {
          btns.forEach((btn) => {
            btn.classList.remove("disabled", "wrong");
            if ((btn as HTMLElement).textContent === choice) {
              (btn as HTMLElement).style.opacity = "0.4";
            }
          });
          hideFeedback();
        }, 500);
      }
    }
  }

  function nextQuestion() {
    const newIndex = state.qIndex + 1;
    if (newIndex >= TOTAL_QUESTIONS) {
      setState({ ...state, screen: "results" });
      playSound("star");
      spawnConfetti();
      setTimeout(spawnConfetti, 400);
    } else {
      setState({ ...state, qIndex: newIndex, attempts: 0, locked: false });
      // Clear input
      if (answerInputRef.current) {
        answerInputRef.current.value = "";
      }
    }
  }

  // ===== SCREEN RENDERING =====
  function renderHome() {
    const titleColors = [
      "#D01012",
      "#F5CD2F",
      "#00852B",
      "#0057A8",
      "#FE8A18",
      "#F785B1",
      "#1A9E8F",
      "#8B5E3C",
      "#D01012",
      "#F5CD2F",
    ];
    const letters = "Lego Maths";

    return (
      <div className="fade-in home-container">
        <div className="title-lego home-title">
          {letters.split("").map((letter, i) =>
            letter === " " ? (
              <span key={i}>&nbsp;</span>
            ) : (
              <span
                key={i}
                style={{ color: titleColors[i % titleColors.length] }}
              >
                {letter}
              </span>
            ),
          )}
        </div>
        <p className="subtitle home-subtitle">
          Apprends les maths en jouant avec des briques !
        </p>
        <div className="home-buttons">
          <button
            className="btn btn-pink btn-full fade-in fade-in-delay-2"
            onClick={() => selectProfile("lea")}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i> Izia — 6 ans
          </button>
          <button
            className="btn btn-teal btn-full fade-in fade-in-delay-3"
            onClick={() => selectProfile("emma")}
          >
            <i className="fa-solid fa-bolt"></i> Rose — 8 ans
          </button>
        </div>
        <div className="fade-in fade-in-delay-4 home-decor">
          {Array.from({ length: 12 }, (_, i) =>
            brickHTML(LEGO_COLORS[i % LEGO_COLORS.length]),
          )}
        </div>
      </div>
    );
  }

  function renderModules() {
    if (!state.profile) return null;

    const p = PROFILES[state.profile];
    const moduleKeys: ModuleKey[] = [
      "addition",
      "multiplication",
      "fraction",
      "division",
    ];
    const delays = [
      "fade-in-delay-1",
      "fade-in-delay-2",
      "fade-in-delay-3",
      "fade-in-delay-4",
    ];

    return (
      <div>
        <button
          className="btn btn-outline modules-back fade-in"
          onClick={goHome}
        >
          <i className="fa-solid fa-arrow-left"></i> Retour
        </button>
        <div className="modules-header fade-in">
          <div className="avatar" style={{ background: p.color }}>
            <i className={`fa-solid ${p.icon}`}></i>
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontWeight: 700,
                fontSize: "1.3rem",
              }}
            >
              {p.name}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {p.age} ans — Niveau{" "}
              {state.difficulty === "easy" ? "Débutant" : "Avancé"}
            </div>
          </div>
        </div>
        <p className="fade-in modules-title">Choisis un exercice :</p>
        <div className="modules-list">
          {moduleKeys.map((key, i) => {
            const m = MODULES[key];
            return (
              <button
                key={key}
                className={`card module-card fade-in ${delays[i]}`}
                style={{ borderColor: m.color }}
                onClick={() => startGame(key)}
              >
                <div
                  className="module-icon module-card-icon"
                  style={{ background: m.color }}
                >
                  <i className={`fa-solid ${m.icon}`}></i>
                </div>
                <div className="module-card-text">
                  <div className="module-card-title">{m.label}</div>
                  <div className="module-card-desc">{m.desc}</div>
                </div>
                <i className="fa-solid fa-chevron-right module-card-arrow"></i>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderGame() {
    const q = state.questions[state.qIndex];
    const m = state.module ? MODULES[state.module] : null;
    const progress = (state.qIndex / TOTAL_QUESTIONS) * 100;

    if (!q || !m) return null;

    return (
      <div>
        <div className="fade-in game-header">
          <button
            className="btn btn-outline"
            style={{ padding: "8px 12px", fontSize: "0.85rem" }}
            onClick={() => setShowQuitModal(true)}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 600,
              fontSize: "1rem",
              color: m.color,
            }}
          >
            <i
              className={`fa-solid ${m.icon}`}
              style={{ marginRight: "4px" }}
            ></i>
            {m.label}
          </div>
          <div className="score-badge">
            <i className="fa-solid fa-star"></i> {state.score}/{TOTAL_QUESTIONS}
          </div>
        </div>

        <div className="progress-bar fade-in game-progress">
          <div
            className="progress-fill"
            style={{ width: `${progress}%`, background: m.color }}
          ></div>
        </div>

        <div className="fade-in game-question-num">
          Question {state.qIndex + 1} sur {TOTAL_QUESTIONS}
        </div>

        <div className="card fade-in game-visual-card" id="visual-card">
          {renderVisual(q)}
        </div>

        <div className="fade-in fade-in-delay-1 game-question-text">
          {renderQuestionText(q)}
        </div>

        <div
          className="fade-in fade-in-delay-2 game-answer-area"
          id="answer-area"
        >
          {renderAnswerArea(q)}
        </div>

        <div
          className={`feedback-overlay ${showFeedback ? "show" : ""}`}
          id="feedback-overlay"
        >
          <div
            className={`feedback-text ${feedbackType === "correct" ? "feedback-correct" : feedbackType === "wrong" ? "feedback-wrong" : feedbackType === "retry" ? "feedback-retry" : "feedback-answer"}`}
          >
            {feedbackText}
          </div>
        </div>
      </div>
    );
  }

  function renderResults() {
    if (!state.profile || !state.module) return null;

    const m = MODULES[state.module];
    const p = PROFILES[state.profile];
    const pct = state.score / TOTAL_QUESTIONS;

    let message: string;
    if (pct === 1) {
      message = "Incroyable ! Tu es une championne !";
    } else if (pct >= 0.75) {
      message = "Bravo ! C'est super bien !";
    } else if (pct >= 0.5) {
      message = "Bien joué ! Continue comme ça !";
    } else if (pct >= 0.25) {
      message = "Pas mal ! Tu t'améliores !";
    } else {
      message = "Continue de t'entraîner, tu vas y arriver !";
    }

    return (
      <div className="fade-in results-container">
        <div className="results-header">
          <div
            className="avatar"
            style={{
              background: p.color,
              width: "72px",
              height: "72px",
              fontSize: "1.8rem",
              margin: "0 auto 12px",
            }}
          >
            <i className={`fa-solid ${p.icon}`}></i>
          </div>
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 700,
              fontSize: "1.3rem",
            }}
          >
            {p.name} — {m.label}
          </div>
        </div>

        <div className="results-stars">
          {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
            <span
              key={i}
              className={`star ${i < state.score ? "filled" : "empty"}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <i className="fa-solid fa-star"></i>
            </span>
          ))}
        </div>

        <div className="card results-score">
          <div
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 700,
              fontSize: "2rem",
              color: m.color,
              marginBottom: "4px",
            }}
          >
            {state.score} / {TOTAL_QUESTIONS}
          </div>
          <div className="results-message">{message}</div>
        </div>

        <div className="results-buttons">
          <button
            className={`btn ${m.btnClass} btn-full`}
            onClick={() => startGame(state.module as ModuleKey)}
          >
            <i className="fa-solid fa-rotate-right"></i> Rejouer
          </button>
          <button
            className="btn btn-outline btn-full"
            onClick={() => setState({ ...state, screen: "modules" })}
          >
            <i className="fa-solid fa-grid-2"></i> Autres exercices
          </button>
          <button className="btn btn-outline btn-full" onClick={goHome}>
            <i className="fa-solid fa-house"></i> Accueil
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <>
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>
      <div className="bg-blob blob-4"></div>
      <canvas ref={confettiCanvasRef} id="confetti-canvas"></canvas>

      {state.screen === "home" && renderHome()}
      {state.screen === "modules" && renderModules()}
      {state.screen === "game" && renderGame()}
      {state.screen === "results" && renderResults()}

      {showQuitModal && (
        <div
          className="quit-modal-overlay"
          onClick={() => setShowQuitModal(false)}
        >
          <div className="card quit-modal-content">
            <p className="quit-modal-text">Arrêter l'exercice ?</p>
            <div className="quit-modal-buttons">
              <button
                className="btn btn-outline quit-modal-btn"
                onClick={() => setShowQuitModal(false)}
              >
                Continuer
              </button>
              <button
                className="btn btn-red quit-modal-btn"
                onClick={() => {
                  setShowQuitModal(false);
                  setState({ ...state, screen: "modules" });
                }}
              >
                Arrêter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
