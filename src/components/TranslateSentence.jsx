import { useState } from 'react';
import { idiomsService } from '../utils/idiomsService';
import '../styles/Exercise.css';

export default function TranslateSentence({ idioms, userId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (idioms.length === 0) {
    return <div className="empty-exercise">Нет идиом для практики</div>;
  }

  const shuffled = [...idioms].sort(() => Math.random() - 0.5);
  const current = shuffled[currentIndex];

  const handleCheck = async () => {
    const normalizedAnswer = userAnswer.toLowerCase().trim();
    const normalizedCorrect = current.translation.toLowerCase().trim();

    if (normalizedAnswer === normalizedCorrect) {
      setFeedback('✅ Правильно!');
      setCorrect((prev) => prev + 1);
      await idiomsService.updateProgress(userId, current.id, true);
      setTimeout(() => handleNext(), 1500);
    } else {
      setShowAnswer(true);
      setFeedback('❌ Неправильно');
    }
  };

  const handleNext = () => {
    setUserAnswer('');
    setFeedback('');
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % shuffled.length);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  return (
    <div className="exercise-container">
      <div className="exercise-progress">
        {currentIndex + 1} / {shuffled.length}
        <span className="score">Правильно: {correct}</span>
      </div>

      <div className="translate-exercise">
        <div className="translate-box">
          <p className="translate-label">Переведи идиому:</p>
          <div className="chinese-text">{current?.chinese_text}</div>
          <div className="pinyin-text">{current?.pinyin}</div>
        </div>

        <input
          type="text"
          placeholder="Введи перевод..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={feedback === '✅ Правильно!'}
          className="translate-input"
        />

        <div className="translate-buttons">
          <button onClick={handleCheck} className="check-btn" disabled={!userAnswer}>
            Проверить
          </button>
          {showAnswer && (
            <button onClick={handleNext} className="next-btn">
              Дальше
            </button>
          )}
        </div>

        {feedback && (
          <div className="feedback">
            {feedback}
            {showAnswer && <p className="correct-answer">Ответ: {current?.translation}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
