import type {
  Question,
  AdditionQuestion,
  MultiplicationQuestion,
  FractionQuestion,
  DivisionQuestion,
} from "../../types";
import { BrickRow } from "../Brick";
import { darken } from "../../utils";

export function renderAdditionVisual(q: AdditionQuestion) {
  return (
    <div className="visual-area">
      <div className="visual-row">{BrickRow({ count: q.a, color: q.c1, startIdx: 0 })}</div>
      <div className="brick-group-label">
        {q.a} brique{q.a > 1 ? "s" : ""}
      </div>
      <div className="operator">+</div>
      <div className="visual-row">{BrickRow({ count: q.b, color: q.c2, startIdx: q.a })}</div>
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

export function renderMultiplicationVisual(q: MultiplicationQuestion) {
  const rows = [];
  let idx = 0;
  for (let r = 0; r < q.a; r++) {
    rows.push(BrickRow({ count: q.b, color: q.c1, startIdx: idx }));
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

export function renderFractionVisual(q: FractionQuestion) {
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

export function renderDivisionVisual(q: DivisionQuestion) {
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
              {BrickRow({ count: q.answer, color: q.c1, startIdx: idx })}
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

export function renderVisual(q: Question) {
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
