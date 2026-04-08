import type { Question } from "../types";

export function renderQuestionText(q: Question) {
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
