import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../utils/authService';
import { idiomsService } from '../utils/idiomsService';
import '../styles/Idioms.css';

export default function Idioms() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [idioms, setIdioms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    chineseText: '',
    pinyin: '',
    translation: '',
    example: '',
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.chineseText ||
      !formData.pinyin ||
      !formData.translation
    ) {
      alert('Заполните все обязательные поля');
      return;
    }

    setLoading(true);
    const { data, error } = await idiomsService.addIdiom(
      user.id,
      formData.chineseText,
      formData.pinyin,
      formData.translation,
      formData.example
    );

    if (error) {
      alert('Ошибка при добавлении идиомы');
    } else {
      setIdioms([...idioms, data[0]]);
      setFormData({ chineseText: '', pinyin: '', translation: '', example: '' });
    }
    setLoading(false);
  };

  const handleDelete = async (idId) => {
    if (!confirm('Удалить эту идиому?')) return;

    setLoading(true);
    const { error } = await idiomsService.deleteIdiom(idId);

    if (error) {
      alert('Ошибка при удалении');
    } else {
      setIdioms(idioms.filter((i) => i.id !== idId));
    }
    setLoading(false);
  };

  if (loading && idioms.length === 0) return <div className="loading">Загрузка...</div>;

  return (
    <div className="idioms-page">
      <header className="page-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Назад
        </button>
        <h1>Управление идиомами</h1>
      </header>

      <div className="idioms-container">
        <div className="form-section">
          <h2>Добавить новую идиому</h2>
          <form onSubmit={handleSubmit} className="idiom-form">
            <div className="form-group">
              <label>Китайский текст *</label>
              <input
                type="text"
                name="chineseText"
                placeholder="например: 卧虎藏龙"
                value={formData.chineseText}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Пиньинь *</label>
              <input
                type="text"
                name="pinyin"
                placeholder="например: wò hǔ cáng lóng"
                value={formData.pinyin}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Перевод/значение *</label>
              <input
                type="text"
                name="translation"
                placeholder="например: скрытые таланты"
                value={formData.translation}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Пример (необязательно)</label>
              <input
                type="text"
                name="example"
                placeholder="Пример использования в предложении"
                value={formData.example}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Добавляю...' : 'Добавить идиому'}
            </button>
          </form>
        </div>

        <div className="idioms-list">
          <h2>Мои идиомы ({idioms.length})</h2>
          {idioms.length === 0 ? (
            <p className="empty">Нет добавленных идиом</p>
          ) : (
            <div className="idioms-grid">
              {idioms.map((idiom) => (
                <div key={idiom.id} className="idiom-card">
                  <div className="idiom-chinese">{idiom.chinese_text}</div>
                  <div className="idiom-pinyin">{idiom.pinyin}</div>
                  <div className="idiom-translation">{idiom.translation}</div>
                  {idiom.example && (
                    <div className="idiom-example">
                      <small>Пример: {idiom.example}</small>
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(idiom.id)}
                    className="delete-btn"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
