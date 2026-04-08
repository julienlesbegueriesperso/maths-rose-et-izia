import type { ProfileKey, ModuleKey } from "../types";
import { MODULES, PROFILES, TOTAL_QUESTIONS } from "../constants";

interface ResultsScreenProps {
  profile: ProfileKey;
  module: ModuleKey;
  score: number;
  onReplay: () => void;
  onModules: () => void;
  onHome: () => void;
}

export function ResultsScreen({
  profile,
  module,
  score,
  onReplay,
  onModules,
  onHome,
}: ResultsScreenProps) {
  const m = MODULES[module];
  const p = PROFILES[profile];
  const pct = score / TOTAL_QUESTIONS;

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
            className={`star ${i < score ? "filled" : "empty"}`}
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
          {score} / {TOTAL_QUESTIONS}
        </div>
        <div className="results-message">{message}</div>
      </div>

      <div className="results-buttons">
        <button
          className={`btn ${m.btnClass} btn-full`}
          onClick={onReplay}
        >
          <i className="fa-solid fa-rotate-right"></i> Rejouer
        </button>
        <button
          className="btn btn-outline btn-full"
          onClick={onModules}
        >
          <i className="fa-solid fa-grid-2"></i> Autres exercices
        </button>
        <button className="btn btn-outline btn-full" onClick={onHome}>
          <i className="fa-solid fa-house"></i> Accueil
        </button>
      </div>
    </div>
  );
}
