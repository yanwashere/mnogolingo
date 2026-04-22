import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { authService } from '../utils/authService';
import { idiomsService } from '../utils/idiomsService';
import '../styles/Idioms.css';

function parseRow(row) {
  const get = (...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== '') return String(row[k]).trim();
    }
    return '';
  };
  return {
    chineseText: get('chinese_text', 'chineseText', 'chinese', 'Chinese', '汉字', 'idiom'),
    pinyin: get('pinyin', 'Pinyin', 'пиньинь'),
    translation: get('translation', 'Translation', 'meaning', 'Meaning', 'перевод', 'Перевод'),
    example: get('example', 'Example', 'пример', 'Пример'),
  };
}

function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const isJson = file.name.endsWith('.json');

    reader.onload = (e) => {
      try {
        let rows;
        if (isJson) {
          rows = JSON.parse(e.target.result);
          if (!Array.isArray(rows)) rows = [rows];
        } else {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(ws);
        }
        const idioms = rows.map(parseRow).filter(r => r.chineseText && r.pinyin && r.translation);
        resolve(idioms);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

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
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.chineseText || !formData.pinyin || !formData.translation) {
      alert('Заполните все обязательные поля');
      return;
    }
    setLoading(true);
    const { data, error } = await idiomsService.addIdiom(
      user.id, formData.chineseText, formData.pinyin, formData.translation, formData.example
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    setImportStatus({ state: 'parsing' });
    try {
      const parsed = await parseFile(file);
      if (parsed.length === 0) {
        setImportStatus({ state: 'error', message: 'Не найдено подходящих строк. Проверь заголовки колонок.' });
        return;
      }
      setImportStatus({ state: 'confirm', idioms: parsed });
    } catch (err) {
      setImportStatus({ state: 'error', message: 'Не удалось прочитать файл: ' + err.message });
    }
  };

  const handleImportConfirm = async () => {
    const toImport = importStatus.idioms;
    setImportStatus({ state: 'importing' });
    const { data, error } = await idiomsService.addIdioms(user.id, toImport);
    if (error) {
      setImportStatus({ state: 'error', message: 'Ошибка при импорте: ' + error.message });
    } else {
      setIdioms((prev) => [...data, ...prev]);
      setImportStatus({ state: 'success', count: data.length });
    }
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

          <div className="import-section">
            <h2>Импорт из файла</h2>
            <p className="import-hint">
              Поддерживаются <strong>.xlsx</strong> и <strong>.json</strong>.<br />
              Колонки: <code>chinese_text</code>, <code>pinyin</code>, <code>translation</code>, <code>example</code>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              className="submit-btn"
              onClick={() => fileInputRef.current.click()}
              disabled={importStatus?.state === 'importing'}
            >
              Выбрать файл
            </button>

            {importStatus?.state === 'parsing' && (
              <p className="import-msg">Читаю файл...</p>
            )}
            {importStatus?.state === 'confirm' && (
              <div className="import-confirm">
                <p>Найдено идиом: <strong>{importStatus.idioms.length}</strong></p>
                <button className="submit-btn" onClick={handleImportConfirm}>
                  Импортировать
                </button>
                <button className="delete-btn" style={{ marginLeft: '0.5rem' }} onClick={() => setImportStatus(null)}>
                  Отмена
                </button>
              </div>
            )}
            {importStatus?.state === 'importing' && (
              <p className="import-msg">Импортирую...</p>
            )}
            {importStatus?.state === 'success' && (
              <p className="import-msg success">Импортировано: {importStatus.count} идиом</p>
            )}
            {importStatus?.state === 'error' && (
              <p className="import-msg error">{importStatus.message}</p>
            )}
          </div>
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
                  <button onClick={() => handleDelete(idiom.id)} className="delete-btn">
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
