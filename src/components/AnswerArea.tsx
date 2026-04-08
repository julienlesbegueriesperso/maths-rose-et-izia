import type { Question } from "../types";

interface AnswerAreaProps {
  q: Question;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmitNumeric: () => void;
  onSubmitFraction: (choice: string) => void;
}

export function AnswerArea({ q, inputRef, onSubmitNumeric, onSubmitFraction }: AnswerAreaProps) {

  if (q.type === "fraction") {
    return (
      <div className="fraction-choices">
        {q.choices.map((choice) => (
          <button
            key={choice}
            className="fraction-choice"
            onClick={() => onSubmitFraction(choice)}
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
        ref={inputRef}
        type="number"
        className="answer-input"
        placeholder="?"
        autoComplete="off"
        inputMode="numeric"
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmitNumeric();
        }}
      />
      <button
        className="btn btn-teal btn-full"
        style={{ marginTop: "10px" }}
        onClick={onSubmitNumeric}
      >
        <i className="fa-solid fa-check"></i> Valider
      </button>
    </>
  );
}
