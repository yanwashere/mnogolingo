import { useState, useEffect } from 'react';
import { idiomsService } from '../utils/idiomsService';
import '../styles/Flashcard.css';

export default function Flashcard({ idioms, userId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learned, setLearned] = useState({});

  useEffect(() => {
    const loadProgress = async () => {
      const { data } = await idiomsService.getProgress(userId);
      const learnedMap = {};
      data?.forEach((p) => {
        learnedMap[p.idiom_id] = p.is_learned;
      });
      setLearned(learnedMap);
    };
    loadProgress();
  }, [userId]);

  if (idioms.length === 0) {
    return <div className="empty-exercise">Нет идиом для практики</div>;
  }

  const current = idioms[currentIndex];
  const isCurrentLearned = learned[current?.id];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % idioms.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + idioms.length) % idioms.length);
  };

  const handleMark = async (isLearned) => {
    await idiomsService.updateProgress(userId, current.id, isLearned);
    setLearned((prev) => ({
      ...prev,
      [current.id]: isLearned,
    }));
  };

  return (
    <div className="flashcard-container">
      <div className="flashcard-progress">
        {currentIndex + 1} / {idioms.length}
      </div>

      <div
        className={`flashcard ${isFlipped ? 'flipped' : ''} ${isCurrentLearned ? 'learned' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <div className="flashcard-chinese">{current?.chinese_text}</div>
            <div className="flashcard-pinyin">{current?.pinyin}</div>
            <small className="flip-hint">Нажми для переворота</small>
          </div>
          <div className="flashcard-back">
            <div className="flashcard-translation">{current?.translation}</div>
            {current?.example && (
              <div className="flashcard-example">
                <small>Пример: {current.example}</small>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flashcard-controls">
        <button onClick={handlePrev} className="nav-btn">
          ← Назад
        </button>
        <div className="mark-buttons">
          <button
            onClick={() => handleMark(false)}
            className={`mark-btn forgotten ${!isCurrentLearned ? 'active' : ''}`}
          >
            ❌ Забыл
          </button>
          <button
            onClick={() => handleMark(true)}
            className={`mark-btn learned ${isCurrentLearned ? 'active' : ''}`}
          >
            ✅ Помню
          </button>
        </div>
        <button onClick={handleNext} className="nav-btn">
          Дальше →
        </button>
      </div>
    </div>
  );
}
