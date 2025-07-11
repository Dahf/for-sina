import './LoadingSpinner.css';

export function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Lädt...</p>
    </div>
  );
} 