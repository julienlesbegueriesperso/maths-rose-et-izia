interface QuitModalProps {
  onContinue: () => void;
  onQuit: () => void;
}

export function QuitModal({ onContinue, onQuit }: QuitModalProps) {
  return (
    <div className="quit-modal-overlay" onClick={onContinue}>
      <div className="card quit-modal-content">
        <p className="quit-modal-text">Arrêter l'exercice ?</p>
        <div className="quit-modal-buttons">
          <button className="btn btn-outline quit-modal-btn" onClick={onContinue}>
            Continuer
          </button>
          <button className="btn btn-red quit-modal-btn" onClick={onQuit}>
            Arrêter
          </button>
        </div>
      </div>
    </div>
  );
}
