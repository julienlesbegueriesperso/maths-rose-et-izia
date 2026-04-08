import type { ProfileKey, ModuleKey, Difficulty } from "../types";
import { PROFILES, MODULES } from "../constants";

interface ModulesScreenProps {
  profile: ProfileKey;
  difficulty: Difficulty;
  onBack: () => void;
  onSelectModule: (module: ModuleKey) => void;
}

export function ModulesScreen({
  profile,
  difficulty,
  onBack,
  onSelectModule,
}: ModulesScreenProps) {
  const p = PROFILES[profile];
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
        onClick={onBack}
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
            {difficulty === "easy" ? "Débutant" : "Avancé"}
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
              onClick={() => onSelectModule(key)}
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
