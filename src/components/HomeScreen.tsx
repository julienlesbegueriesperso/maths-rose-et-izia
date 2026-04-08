import type { ProfileKey } from "../types";
import { LEGO_COLORS } from "../constants";
import { Brick } from "./Brick";

interface HomeScreenProps {
  onSelectProfile: (name: ProfileKey) => void;
}

export function HomeScreen({ onSelectProfile }: HomeScreenProps) {
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
          onClick={() => onSelectProfile("lea")}
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i> Izia — 6 ans
        </button>
        <button
          className="btn btn-teal btn-full fade-in fade-in-delay-3"
          onClick={() => onSelectProfile("emma")}
        >
          <i className="fa-solid fa-bolt"></i> Rose — 8 ans
        </button>
      </div>
      <div className="fade-in fade-in-delay-4 home-decor">
        {Array.from({ length: 12 }, (_, i) => (
          <Brick key={i} color={LEGO_COLORS[i % LEGO_COLORS.length]} />
        ))}
      </div>
    </div>
  );
}
