import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './LoginForm.css';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);
      
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Für Sina ♥</h1>
        <p className="login-subtitle">
          {isSignUp ? 'Erstelle dein Konto' : 'Willkommen zurück'}
        </p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="E-Mail-Adresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Lädt...' : (isSignUp ? 'Registrieren' : 'Anmelden')}
          </button>
        </form>
        
        <div className="auth-switch">
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="switch-btn"
          >
            {isSignUp ? 'Bereits ein Konto? Anmelden' : 'Neu hier? Registrieren'}
          </button>
        </div>
      </div>
    </div>
  );
} 