import { useState } from 'react';
import { authService } from '../utils/authService';
import '../styles/Auth.css';

export default function Auth({ onAuthSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = isSignUp
        ? await authService.signup(username, password)
        : await authService.login(username, password);

      if (authError) {
        setError(authError.message);
      } else {
        onAuthSuccess();
      }
    } catch (err) {
      setError('Ошибка при аутентификации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>MnogoLingo</h1>
        <p className="subtitle">Учи китайские идиомы</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : isSignUp ? 'Создать аккаунт' : 'Войти'}
          </button>
        </form>

        <p className="toggle-auth">
          {isSignUp ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="link-btn"
          >
            {isSignUp ? 'Войти' : 'Создать'}
          </button>
        </p>
      </div>
    </div>
  );
}
