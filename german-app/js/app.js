// app.js — ядро приложения: данные, роутинг, инициализация
const App = (() => {
  const LEVEL_META = {
    A1: { icon: 'sprout', label: 'A1', color: '#7cc576' },
    A2: { icon: 'leaf', label: 'A2', color: '#4a9d5f' },
    B1: { icon: 'tree', label: 'B1', color: '#2f6b3e' },
    B2: { icon: 'blossom', label: 'B2', color: '#8b5cf6' },
  };

  const TOPIC_ORDER = {
    A1: ['Приветствия и знакомство', 'Числа, даты, время', 'Семья и друзья', 'Еда и напитки', 'Город и транспорт', 'Дом и квартира', 'Хобби и свободное время', 'Покупки и одежда', 'Профессии и работа', 'Погода и времена года'],
    A2: ['Путешествия и отпуск', 'Здоровье и тело', 'Образование и учёба', 'Распорядок дня', 'Праздники и традиции', 'В ресторане и кафе', 'Чувства и эмоции', 'Природа и животные', 'Спорт и фитнес', 'Дружба и отношения'],
    B1: ['Работа и карьера', 'Технологии и медиа', 'Экология и окружающая среда', 'Культура и искусство', 'Жизнь в Германии', 'Политика и общество', 'Мечты и планы на будущее', 'Конфликты и решения', 'Здоровый образ жизни', 'Подготовка к экзамену B1'],
    B2: ['Наука и технологии', 'Экономика и финансы', 'Право и общество', 'Медиа и журналистика', 'Философия и мировоззрение', 'Литература и искусство', 'Глобальные проблемы человечества', 'Психология и отношения', 'Карьера и профессиональное развитие', 'Академическая жизнь и наука'],
  };

  let ALL_WORDS = [];
  let deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });
  window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; });

  function canInstall() { return !!deferredInstallPrompt; }
  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function promptInstall() {
    if (!deferredInstallPrompt) return Promise.resolve(false);
    deferredInstallPrompt.prompt();
    return deferredInstallPrompt.userChoice.then(choice => {
      deferredInstallPrompt = null;
      return choice.outcome === 'accepted';
    });
  }
  let WORDS_BY_ID = {};
  let LESSONS = []; // { id, level, topic, index, title, words: [] }

  function buildWordBank() {
    ALL_WORDS = [].concat(WORDS_A1 || [], WORDS_A2 || [], WORDS_B1 || [], WORDS_B2 || []);
    WORDS_BY_ID = {};
    ALL_WORDS.forEach(w => { WORDS_BY_ID[w.id] = w; });
  }

  function buildLessons() {
    LESSONS = [];
    Object.keys(TOPIC_ORDER).forEach(level => {
      const topics = TOPIC_ORDER[level];
      topics.forEach(topic => {
        const words = ALL_WORDS.filter(w => w.level === level && w.topic === topic);
        if (!words.length) return;
        const chunkSize = 7;
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize) chunks.push(words.slice(i, i + chunkSize));
        chunks.forEach((chunk, idx) => {
          LESSONS.push({
            id: `${level}__${topic}__${idx}`,
            level, topic, index: idx,
            title: `${topic} — урок ${idx + 1}`,
            words: chunk,
          });
        });
      });
    });
  }

  function getWordsByLevel(level) { return ALL_WORDS.filter(w => w.level === level); }
  function getTopicsForLevel(level) {
    return TOPIC_ORDER[level].map(topic => {
      const words = ALL_WORDS.filter(w => w.level === level && w.topic === topic);
      const lessons = LESSONS.filter(l => l.level === level && l.topic === topic);
      const doneCount = lessons.filter(l => Progress.isLessonDone(l.id)).length;
      return { topic, wordCount: words.length, lessonCount: lessons.length, doneCount };
    });
  }
  function getLessonsForTopic(level, topic) { return LESSONS.filter(l => l.level === level && l.topic === topic); }
  function getLesson(id) { return LESSONS.find(l => l.id === id); }

  function totalWordCount() {
    return ALL_WORDS.length || 1;
  }

  function overallProgressPercent() {
    const total = totalWordCount();
    const learned = Progress.getState().wordsLearnedCount;
    return Math.min(100, Math.round((learned / total) * 100));
  }

  function currentLevel() {
    const learned = Progress.getState().wordsLearnedCount;
    const a1 = (WORDS_A1 || []).length;
    const a2 = (WORDS_A2 || []).length;
    const b1 = (WORDS_B1 || []).length;
    if (learned < a1) return 'A1';
    if (learned < a1 + a2) return 'A2';
    if (learned < a1 + a2 + b1) return 'B1';
    return 'B2';
  }

  function pickWordOfDay() {
    let id = Progress.getWordOfDay();
    if (id && WORDS_BY_ID[id]) return WORDS_BY_ID[id];
    if (!ALL_WORDS.length) return null;
    const learnedIds = Object.keys(Progress.getState().wordProgress);
    const candidates = ALL_WORDS.filter(w => !learnedIds.includes(w.id));
    const pool = candidates.length ? candidates : ALL_WORDS;
    const w = pool[Math.floor(Math.random() * pool.length)];
    Progress.setWordOfDay(w.id);
    return w;
  }

  // ---- Роутинг ----
  function parseHash() {
    const hash = location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/').filter(Boolean).map(p => decodeURIComponent(p));
    return parts;
  }

  function navigate(path) {
    location.hash = '#/' + path;
  }

  function renderRoute() {
    const parts = parseHash();
    const route = parts[0] || 'dashboard';
    UI.setActiveNav(route);
    switch (route) {
      case 'dashboard': UI.renderDashboard(); break;
      case 'lessons':
        if (parts[1] && parts[2]) UI.renderLessonList(parts[1], parts[2]);
        else if (parts[1]) UI.renderTopicList(parts[1]);
        else UI.renderLevelSelect();
        break;
      case 'lesson': UI.renderLessonDetail(parts[1]); break;
      case 'dictionary': UI.renderDictionary(); break;
      case 'mycards': UI.renderMyCards(); break;
      case 'handbook':
        if (parts[1]) UI.renderHandbookChapter(parts[1]);
        else UI.renderHandbook();
        break;
      case 'grammar':
        if (parts[1]) UI.renderGrammarDetail(parts[1]);
        else UI.renderGrammarList();
        break;
      case 'listening': UI.renderListening(); break;
      case 'phrasebook': UI.renderPhrasebook(); break;
      case 'tests': UI.renderTests(); break;
      case 'exam':
        if (parts[1] === 'reading' && parts[2]) UI.renderReadingDetail(parts[2]);
        else if (parts[1] === 'writing' && parts[2]) UI.renderWritingDetail(parts[2]);
        else if (parts[1] === 'speaking' && parts[2]) UI.renderSpeakingDetail(parts[2]);
        else UI.renderExam(parts[1]);
        break;
      case 'daily': UI.renderDaily(); break;
      case 'achievements': UI.renderAchievements(); break;
      default: UI.renderDashboard();
    }
    const view = document.getElementById('app-view');
    if (view) {
      view.classList.remove('view-anim');
      void view.offsetWidth;
      view.classList.add('view-anim');
    }
    window.scrollTo(0, 0);
  }

  function applyTheme() {
    const theme = Progress.getState().settings.theme;
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    const cur = Progress.getState().settings.theme;
    const next = cur === 'dark' ? 'light' : 'dark';
    Progress.setTheme(next);
    applyTheme();
  }

  function init() {
    Progress.load();
    Progress.touchStreak();
    buildWordBank();
    buildLessons();
    applyTheme();
    UI.renderShell();
    window.addEventListener('hashchange', renderRoute);
    if (!location.hash) navigate('dashboard');
    renderRoute();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  return {
    LEVEL_META, TOPIC_ORDER, init, navigate, renderRoute, applyTheme, toggleTheme,
    getWordsByLevel, getTopicsForLevel, getLessonsForTopic, getLesson,
    overallProgressPercent, currentLevel, pickWordOfDay, totalWordCount,
    canInstall, isStandalone, isIOS, promptInstall,
    get ALL_WORDS() { return ALL_WORDS; },
    get WORDS_BY_ID() { return WORDS_BY_ID; },
    get LESSONS() { return LESSONS; },
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
