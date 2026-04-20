import { useState, useEffect } from 'react';
import { idiomsService } from '../utils/idiomsService';
import '../styles/Exercise.css';

export default function FillTheBlank({ idioms, userId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState('');
  const [correct, setCorrect] = useState(0);

  if (idioms.length === 0) {
    return <div className="empty-exercise">Нет идиом для практики</div>;
  }

  const shuffled = [...idioms].sort(() => Math.random() - 0.5);
  const current = shuffled[currentIndex];
  const options = [current, ...shuffled.slice(1, 4)]
    .sort(() => Math.random() - 0.5);

  const handleAnswer = async (idiom) => {
    if (idiom.id === current.id) {
      setFeedback('✅ Правильно!');
      setCorrect((prev) => prev + 1);
      await idiomsService.updateProgress(userId, current.id, true);
      setTimeout(() => handleNext(), 1500);
    } else {
      setFeedback('❌ Неправильно, попробуй еще');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handleNext = () => {
    setSelected('');
    setFeedback('');
    setCurrentIndex((prev) => (prev + 1) % shuffled.length);
  };

  return (
    <div className="exercise-container">
      <div className="exercise-progress">
        {currentIndex + 1} / {shuffled.length}
        <span className="score">Правильно: {correct}</span>
      </div>

      <div className="blank-exercise">
        <p className="exercise-text">
          Выбери правильную идиому для перевода: <strong>{current?.translation}</strong>
        </p>

        <div className="options-grid">
          {options.map((idiom) => (
            <button
              key={idiom.id}
              onClick={() => handleAnswer(idiom)}
              className={`option-btn ${selected === idiom.id ? 'selected' : ''}`}
            >
              <div className="option-chinese">{idiom.chinese_text}</div>
              <div className="option-pinyin">{idiom.pinyin}</div>
            </button>
          ))}
        </div>

        {feedback && <div className="feedback">{feedback}</div>}

        {!feedback && currentIndex === shuffled.length - 1 && (
          <div className="exercise-complete">
            <h3>Упражнение завершено!</h3>
            <p>Правильных ответов: {correct}/{shuffled.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
