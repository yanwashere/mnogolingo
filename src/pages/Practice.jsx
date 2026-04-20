import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/authService';
import { idiomsService } from '../utils/idiomsService';
import Flashcard from '../components/Flashcard';
import FillTheBlank from '../components/FillTheBlank';
import TranslateSentence from '../components/TranslateSentence';
import '../styles/Practice.css';

export default function Practice() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [idioms, setIdioms] = useState([]);
  const [exerciseType, setExerciseType] = useState('flashcard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { user: currentUser } = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const { data } = await idiomsService.getIdioms(currentUser.id);
        setIdioms(data || []);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="practice-page">
      <header className="page-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Назад
        </button>
        <h1>Практика</h1>
      </header>

      <div className="exercise-selector">
        <button
          className={`exercise-btn ${exerciseType === 'flashcard' ? 'active' : ''}`}
          onClick={() => setExerciseType('flashcard')}
        >
          🎴 Флэшкарты
        </button>
        <button
          className={`exercise-btn ${exerciseType === 'fillblank' ? 'active' : ''}`}
          onClick={() => setExerciseType('fillblank')}
        >
          ✏️ Заполни пропуск
        </button>
        <button
          className={`exercise-btn ${exerciseType === 'translate' ? 'active' : ''}`}
          onClick={() => setExerciseType('translate')}
        >
          🌐 Переведи
        </button>
      </div>

      <div className="exercise-container">
        {exerciseType === 'flashcard' && (
          <Flashcard idioms={idioms} userId={user?.id} />
        )}
        {exerciseType === 'fillblank' && (
          <FillTheBlank idioms={idioms} userId={user?.id} />
        )}
        {exerciseType === 'translate' && (
          <TranslateSentence idioms={idioms} userId={user?.id} />
        )}
      </div>
    </div>
  );
}
