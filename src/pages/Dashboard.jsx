import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/authService';
import { idiomsService } from '../utils/idiomsService';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [idioms, setIdioms] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { user: currentUser } = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: idiomsData } = await idiomsService.getIdioms(
          currentUser.id
        );
        const { data: progressData } = await idiomsService.getProgress(
          currentUser.id
        );

        setIdioms(idiomsData || []);
        setProgress(progressData || []);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const learnedCount = progress.filter((p) => p.is_learned).length;
  const totalCount = idioms.length;

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-title">
          <h1>MnogoLingo</h1>
          <p>Китайские идиомы</p>
        </div>
        <div className="header-user">
          <span>{user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Выход
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{totalCount}</div>
            <div className="stat-label">Идиом всего</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{learnedCount}</div>
            <div className="stat-label">Выучено</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0}%
            </div>
            <div className="stat-label">Прогресс</div>
          </div>
        </div>

        <div className="actions-grid">
          <button
            onClick={() => navigate('/idioms')}
            className="action-btn primary"
          >
            ➕ Добавить идиомы
          </button>
          <button
            onClick={() => navigate('/practice')}
            className="action-btn primary"
            disabled={totalCount === 0}
          >
            📚 Практика
          </button>
          <button
            onClick={() => navigate('/flashcards')}
            className="action-btn secondary"
            disabled={totalCount === 0}
          >
            🎴 Флэшкарты
          </button>
        </div>

        {totalCount === 0 && (
          <div className="empty-state">
            <p>Добавьте первую идиому, чтобы начать обучение</p>
          </div>
        )}
      </div>
    </div>
  );
}
