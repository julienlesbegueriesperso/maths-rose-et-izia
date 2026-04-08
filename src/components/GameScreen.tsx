import { useEffect, useState, useRef } from "react";
import type { Question, ModuleKey, FeedbackType } from "../types";
import { MODULES, TOTAL_QUESTIONS } from "../constants";
import { renderVisual } from "./visuals/GameVisuals";
import { renderQuestionText } from "./QuestionText";
import { AnswerArea } from "./AnswerArea";

interface GameScreenProps {
  module: ModuleKey;
  questions: Question[];
  qIndex: number;
  score: number;
  attempts: number;
  locked: boolean;
  onQuit: () => void;
  onNext: (score: number) => void;
  onCorrect: () => void;
  onWrong: (isLastAttempt: boolean) => void;
}

export function GameScreen({
  module,
  questions,
  qIndex,
  score,
  attempts,
  locked,
  onQuit,
  onNext,
  onCorrect,
  onWrong,
}: GameScreenProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("correct");
  const [feedbackText, setFeedbackText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const q = questions[qIndex];
  const m = MODULES[module];
  const progress = (qIndex / TOTAL_QUESTIONS) * 100;

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [qIndex]);

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
    const input = inputRef.current;
    if (input) {
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 500);
    }
  }

  function hideFeedback() {
    setShowFeedback(false);
  }

  function handleSubmitNumeric() {
    if (locked) return;
    const input = inputRef.current;
    if (!input) return;

    const val = input.value.trim();
    if (val === "") return;

    const numVal = parseInt(val, 10);
    if (isNaN(numVal)) return;

    const currentQ = questions[qIndex];

    if (
      (currentQ.type === "addition" ||
        currentQ.type === "multiplication" ||
        currentQ.type === "division") &&
      numVal === currentQ.answer
    ) {
      const newScore = score + 1;
      onCorrect();
      setFeedbackType("correct");
      setFeedbackText("Bravo !");
      setShowFeedback(true);
      bounceBricks();
      setTimeout(() => {
        hideFeedback();
        inputRef.current!.value = "";
        onNext(newScore);
      }, 1500);
    } else {
      const newAttempts = attempts + 1;
      if (newAttempts >= 1) {
        onWrong(true);
        setFeedbackType("answer");
        setFeedbackText(`La réponse était ${currentQ.answer}`);
        setShowFeedback(true);
        shakeBricks();
        setTimeout(() => {
          hideFeedback();
          inputRef.current!.value = "";
          onNext(score);
        }, 2500);
      } else {
        onWrong(false);
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

  function handleSubmitFraction(choice: string) {
    if (locked) return;
    const currentQ = questions[qIndex] as Question & { type: "fraction" };

    const btns = document.querySelectorAll(".fraction-choice");
    btns.forEach((btn) => {
      btn.classList.add("disabled");
      if ((btn as HTMLElement).textContent === choice && choice === currentQ.answer) {
        btn.classList.add("correct");
      } else if (
        (btn as HTMLElement).textContent === choice &&
        choice !== currentQ.answer
      ) {
        btn.classList.add("wrong");
      }
    });

    if (choice === currentQ.answer) {
      const newScore = score + 1;
      onCorrect();
      setFeedbackType("correct");
      setFeedbackText("Bravo !");
      setShowFeedback(true);
      bounceBricks();
      setTimeout(() => {
        hideFeedback();
        onNext(newScore);
      }, 1500);
    } else {
      const newAttempts = attempts + 1;
      if (newAttempts >= 1) {
        onWrong(true);
        btns.forEach((btn) => {
          if ((btn as HTMLElement).textContent === currentQ.answer) {
            btn.classList.add("correct");
          }
        });
        setFeedbackType("answer");
        setFeedbackText(`C'était ${currentQ.answer}`);
        setShowFeedback(true);
        setTimeout(() => {
          hideFeedback();
          onNext(score);
        }, 2500);
      } else {
        onWrong(false);
        setFeedbackType("retry");
        setFeedbackText("Essaie encore !");
        setShowFeedback(true);
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

  if (!q || !m) return null;

  return (
    <div>
      <div className="fade-in game-header">
        <button
          className="btn btn-outline"
          style={{ padding: "8px 12px", fontSize: "0.85rem" }}
          onClick={onQuit}
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
          <i className="fa-solid fa-star"></i> {score}/{TOTAL_QUESTIONS}
        </div>
      </div>

      <div className="progress-bar fade-in game-progress">
        <div
          className="progress-fill"
          style={{ width: `${progress}%`, background: m.color }}
        ></div>
      </div>

      <div className="fade-in game-question-num">
        Question {qIndex + 1} sur {TOTAL_QUESTIONS}
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
        <AnswerArea
          q={q}
          inputRef={inputRef}
          onSubmitNumeric={handleSubmitNumeric}
          onSubmitFraction={handleSubmitFraction}
        />
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
