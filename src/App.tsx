import { useState, useCallback } from "react";
import "./App.css";

import type {
  Screen,
  ProfileKey,
  ModuleKey,
  Difficulty,
  Question,
} from "./types";
import { TOTAL_QUESTIONS } from "./constants";
import { generateQuestions } from "./utils";
import { useConfetti } from "./hooks/useConfetti";
import { useSound } from "./hooks/useSound";
import type { SoundType } from "./hooks/useSound";

import {
  HomeScreen,
  ModulesScreen,
  GameScreen,
  ResultsScreen,
  QuitModal,
} from "./components";

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

const App = () => {
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

  const [showQuitModal, setShowQuitModal] = useState(false);

  const { canvasRef, spawnConfetti } = useConfetti();
  const { playSound } = useSound();

  const playSoundEffect = useCallback(
    (type: SoundType) => {
      playSound(type);
    },
    [playSound],
  );

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

  function handleNextQuestion(updatedScore: number) {
    const newIndex = state.qIndex + 1;
    if (newIndex >= TOTAL_QUESTIONS) {
      setState({ ...state, screen: "results", score: updatedScore });
      playSoundEffect("star");
      spawnConfetti();
      setTimeout(spawnConfetti, 400);
    } else {
      setState({
        ...state,
        qIndex: newIndex,
        attempts: 0,
        locked: false,
        score: updatedScore,
      });
    }
  }

  function handleQuit() {
    setState({ ...state, screen: "modules" });
  }

  function handleGoToModules() {
    setState({ ...state, screen: "modules" });
  }

  return (
    <>
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>
      <div className="bg-blob blob-4"></div>
      <canvas ref={canvasRef} id="confetti-canvas"></canvas>

      {state.screen === "home" && (
        <HomeScreen onSelectProfile={selectProfile} />
      )}
      {state.screen === "modules" && state.profile && (
        <ModulesScreen
          profile={state.profile}
          difficulty={state.difficulty}
          onBack={goHome}
          onSelectModule={startGame}
        />
      )}
      {state.screen === "game" && state.module && (
        <GameScreen
          module={state.module}
          questions={state.questions}
          qIndex={state.qIndex}
          score={state.score}
          attempts={state.attempts}
          locked={state.locked}
          onQuit={() => setShowQuitModal(true)}
          onNext={handleNextQuestion}
          onCorrect={() => {
            playSoundEffect("correct");
            spawnConfetti();
          }}
          onWrong={() => {
            playSoundEffect("wrong");
          }}
        />
      )}
      {state.screen === "results" && state.profile && state.module && (
        <ResultsScreen
          profile={state.profile}
          module={state.module}
          score={state.score}
          onReplay={() => startGame(state.module!)}
          onModules={handleGoToModules}
          onHome={goHome}
        />
      )}

      {showQuitModal && (
        <QuitModal
          onContinue={() => setShowQuitModal(false)}
          onQuit={() => {
            setShowQuitModal(false);
            handleQuit();
          }}
        />
      )}
    </>
  );
};

export default App;
