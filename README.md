# MnogoLingo

Локальное приложение для изучения китайских идиом. Как Duolingo, но для вас и ваших друзей.

## Возможности

- 📝 Добавление собственных идиом с пиньинь и переводом
- 🎴 Интерактивные флэшкарты
- ✏️ Упражнения "Заполни пропуск"
- 🌐 Упражнения на перевод
- 📊 Отслеживание личного прогресса
- 👥 Совместное использование с друзьями (каждый видит свой прогресс)

## Быстрый старт

### 1. Создать Supabase проект

1. Перейти на [supabase.com](https://supabase.com) и создать бесплатный аккаунт
2. Создать новый проект
3. Скопировать **Project URL** и **Anon Key** из настроек проекта

### 2. Настроить базу данных

В SQL Editor вашего Supabase проекта выполнить:

```sql
-- Create idioms table
CREATE TABLE idioms (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chinese_text TEXT NOT NULL,
  pinyin TEXT NOT NULL,
  translation TEXT NOT NULL,
  example TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user progress table
CREATE TABLE user_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idiom_id BIGINT NOT NULL REFERENCES idioms(id) ON DELETE CASCADE,
  is_learned BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, idiom_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE idioms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policy for idioms (users can only see their own)
CREATE POLICY "Users can manage their own idioms" ON idioms
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy for user_progress
CREATE POLICY "Users can manage their own progress" ON user_progress
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 3. Настроить .env.local

1. Скопировать `.env.local.example` в `.env.local` (или создать новый)
2. Вставить ваши значения:
   ```
   VITE_SUPABASE_URL=ваш_project_url
   VITE_SUPABASE_ANON_KEY=ваш_anon_key
   ```

### 4. Установить зависимости и запустить

```bash
npm install
npm run dev
```

Приложение будет доступно на http://localhost:5173

## Развёртывание на GitHub Pages

### 1. Создать репозиторий

Создать публичный репозиторий на GitHub с именем `mnogolingo` (или другим)

### 2. Добавить GitHub Actions workflow

Создать файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 3. Добавить secrets в GitHub

1. Перейти в Settings → Secrets and variables → Actions
2. Добавить:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 4. Настроить GitHub Pages

1. Settings → Pages
2. Выбрать "Deploy from a branch"
3. Выбрать ветку `gh-pages` и папку `/ (root)`

## Использование

1. Зарегистрироваться / войти
2. Добавить идиомы в разделе "Управление идиомами"
3. Выбрать тип упражнения в разделе "Практика"
4. Отслеживать прогресс на дашборде

## Структура проекта

```
src/
├── components/       # Компоненты упражнений
├── pages/           # Страницы приложения
├── utils/           # Сервисы (Supabase, Auth)
├── styles/          # CSS файлы
├── App.jsx          # Главный компонент с роутингом
└── main.jsx         # Точка входа
```

## Лицензия

MIT
