// progress.js — состояние приложения: XP, streak, прогресс слов, достижения
const Progress = (() => {
  const STORAGE_KEY = 'de_app_state_v1';

  const XP_LEVELS = [
    { name: 'Anfänger', min: 0 },
    { name: 'Schüler', min: 200 },
    { name: 'Lerner', min: 600 },
    { name: 'Sprecher', min: 1500 },
    { name: 'Kenner', min: 3000 },
    { name: 'Experte', min: 6000 },
  ];

  const ACHIEVEMENTS = [
    { id: 'first_word', title: 'Первое слово', desc: 'Выучи первое слово', icon: '🌱', check: s => s.wordsLearnedCount >= 1 },
    { id: 'words_10', title: '10 слов', desc: 'Выучи 10 слов', icon: '📚', check: s => s.wordsLearnedCount >= 10 },
    { id: 'words_50', title: '50 слов', desc: 'Выучи 50 слов', icon: '📖', check: s => s.wordsLearnedCount >= 50 },
    { id: 'words_100', title: '100 слов', desc: 'Выучи 100 слов', icon: '🎓', check: s => s.wordsLearnedCount >= 100 },
    { id: 'words_500', title: '500 слов', desc: 'Выучи 500 слов', icon: '🏆', check: s => s.wordsLearnedCount >= 500 },
    { id: 'words_1000', title: '1000 слов', desc: 'Выучи 1000 слов', icon: '👑', check: s => s.wordsLearnedCount >= 1000 },
    { id: 'words_2000', title: '2000 слов', desc: 'Выучи 2000 слов', icon: '💎', check: s => s.wordsLearnedCount >= 2000 },
    { id: 'words_3000', title: '3000 слов', desc: 'Выучи 3000 слов', icon: '💎', check: s => s.wordsLearnedCount >= 3000 },
    { id: 'words_all', title: 'Мастер словаря', desc: 'Выучи все слова курса', icon: '👑', check: s => typeof App !== 'undefined' && s.wordsLearnedCount >= App.totalWordCount() },
    { id: 'streak_3', title: 'Разогрев', desc: '3 дня подряд', icon: '🔥', check: s => s.streak >= 3 },
    { id: 'streak_7', title: 'Неделя', desc: '7 дней подряд', icon: '🔥', check: s => s.streak >= 7 },
    { id: 'streak_30', title: 'Месяц дисциплины', desc: '30 дней подряд', icon: '🔥', check: s => s.streak >= 30 },
    { id: 'streak_100', title: 'Железная воля', desc: '100 дней подряд', icon: '🔥', check: s => s.streak >= 100 },
    { id: 'lesson_1', title: 'Первый урок', desc: 'Заверши первый урок', icon: '✅', check: s => s.lessonsCompleted >= 1 },
    { id: 'lesson_10', title: 'Ученик', desc: 'Заверши 10 уроков', icon: '✅', check: s => s.lessonsCompleted >= 10 },
    { id: 'lesson_50', title: 'Прилежный', desc: 'Заверши 50 уроков', icon: '✅', check: s => s.lessonsCompleted >= 50 },
    { id: 'test_pass', title: 'Первый тест', desc: 'Сдай первый тест', icon: '📝', check: s => s.testsPassed >= 1 },
    { id: 'a1_done', title: 'A1 пройден', desc: 'Заверши уровень A1', icon: '🌱', check: s => s.levelsCompleted.includes('A1') },
    { id: 'a2_done', title: 'A2 пройден', desc: 'Заверши уровень A2', icon: '🌿', check: s => s.levelsCompleted.includes('A2') },
    { id: 'b1_done', title: 'B1 пройден', desc: 'Заверши уровень B1', icon: '🌳', check: s => s.levelsCompleted.includes('B1') },
    { id: 'b2_done', title: 'B2 пройден', desc: 'Заверши уровень B2', icon: '🎓', check: s => s.levelsCompleted.includes('B2') },
    { id: 'perfect_pronunciation', title: 'Идеальное произношение', desc: 'Получи 100% совпадение', icon: '🎤', check: s => s.perfectPronunciations >= 1 },
    { id: 'xp_1000', title: '1000 XP', desc: 'Набери 1000 очков опыта', icon: '⭐', check: s => s.xp >= 1000 },
    { id: 'daily_goal_streak', title: 'Настойчивость', desc: 'Выполни дневную цель 5 раз подряд', icon: '🎯', check: s => s.dailyGoalStreak >= 5 },
  ];

  function defaultState() {
    return {
      xp: 0,
      streak: 0,
      lastActiveDate: null,
      dailyGoalMinutes: 20,
      dailyMinutesToday: 0,
      dailyGoalStreak: 0,
      wordsLearnedCount: 0,
      lessonsCompleted: 0,
      testsPassed: 0,
      perfectPronunciations: 0,
      levelsCompleted: [],
      unlockedAchievements: [],
      wordProgress: {}, // wordId -> {ef, interval, reps, due, status}
      lessonProgress: {}, // lessonId -> {completedExercises: [], done: bool}
      settings: { theme: 'light', ttsRate: 0.9 },
      wordOfDayId: null,
      wordOfDayDate: null,
      myCards: [], // { id, addedAt } for dictionary words, or { id, custom:true, de, ru, transcription, example_de, example_ru, emoji, addedAt } for own words
    };
  }

  let state = load();
  let storageOK = true;

  function isStorageAvailable() {
    try {
      const testKey = '__de_app_storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    } catch (e) {
      return defaultState();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageOK = true;
    } catch (e) {
      storageOK = false;
    }
  }

  function isStorageOK() { return storageOK; }

  function exportBackup() {
    return JSON.stringify(state, null, 2);
  }

  function importBackup(jsonStr) {
    const parsed = JSON.parse(jsonStr);
    state = Object.assign(defaultState(), parsed);
    save();
    return state;
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function touchStreak() {
    const today = todayStr();
    if (state.lastActiveDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (state.lastActiveDate === yesterday) {
      state.streak += 1;
    } else {
      state.streak = 1;
    }
    state.lastActiveDate = today;
    state.dailyMinutesToday = 0;
    save();
  }

  function addXP(amount) {
    state.xp += amount;
    checkAchievements();
    save();
    return state.xp;
  }

  function addMinutes(min) {
    state.dailyMinutesToday += min;
    if (state.dailyMinutesToday >= state.dailyGoalMinutes) {
      // goal reached today (idempotent-ish, tracked via date)
    }
    save();
  }

  function getLevelInfo() {
    let current = XP_LEVELS[0];
    let next = XP_LEVELS[1];
    for (let i = 0; i < XP_LEVELS.length; i++) {
      if (state.xp >= XP_LEVELS[i].min) {
        current = XP_LEVELS[i];
        next = XP_LEVELS[i + 1] || null;
      }
    }
    return { current, next, xp: state.xp };
  }

  function checkAchievements() {
    const newly = [];
    ACHIEVEMENTS.forEach(a => {
      if (!state.unlockedAchievements.includes(a.id) && a.check(state)) {
        state.unlockedAchievements.push(a.id);
        newly.push(a);
      }
    });
    if (newly.length) save();
    return newly;
  }

  function markWordLearned(wordId, srData) {
    const existed = state.wordProgress[wordId];
    state.wordProgress[wordId] = srData;
    if (!existed || existed.status !== 'learned') {
      if (srData.status === 'learned' && (!existed || existed.status !== 'learned')) {
        state.wordsLearnedCount += 1;
      }
    }
    save();
  }

  function getWordProgress(wordId) {
    return state.wordProgress[wordId] || null;
  }

  function completeLesson(lessonId) {
    if (!state.lessonProgress[lessonId] || !state.lessonProgress[lessonId].done) {
      state.lessonsCompleted += 1;
    }
    state.lessonProgress[lessonId] = state.lessonProgress[lessonId] || {};
    state.lessonProgress[lessonId].done = true;
    save();
  }

  function isLessonDone(lessonId) {
    return !!(state.lessonProgress[lessonId] && state.lessonProgress[lessonId].done);
  }

  function passTest(testId) {
    state.testsPassed += 1;
    save();
  }

  function completeLevel(level) {
    if (!state.levelsCompleted.includes(level)) {
      state.levelsCompleted.push(level);
      save();
    }
  }

  function recordPerfectPronunciation() {
    state.perfectPronunciations += 1;
    save();
  }

  function setWordOfDay(wordId) {
    state.wordOfDayId = wordId;
    state.wordOfDayDate = todayStr();
    save();
  }

  function getWordOfDay() {
    if (state.wordOfDayDate === todayStr()) return state.wordOfDayId;
    return null;
  }

  function setTheme(theme) {
    state.settings.theme = theme;
    save();
  }

  // ---------- Мои карточки (личная колода, как в Anki) ----------
  function isInMyCards(id) {
    return state.myCards.some(c => c.id === id);
  }

  function addMyCardRef(wordId) {
    if (isInMyCards(wordId)) return;
    state.myCards.push({ id: wordId, addedAt: Date.now() });
    save();
  }

  function addMyCardCustom(card) {
    const id = 'custom-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    state.myCards.push({
      id, custom: true, addedAt: Date.now(),
      de: card.de, ru: card.ru,
      transcription: card.transcription || '',
      example_de: card.example_de || '',
      example_ru: card.example_ru || '',
      emoji: card.emoji || '📝',
    });
    save();
    return id;
  }

  function removeMyCard(id) {
    state.myCards = state.myCards.filter(c => c.id !== id);
    delete state.wordProgress[id];
    save();
  }

  function getMyCards() {
    return state.myCards;
  }

  function getState() { return state; }
  function resetAll() { state = defaultState(); save(); }

  return {
    load, save, touchStreak, addXP, addMinutes, getLevelInfo, checkAchievements,
    markWordLearned, getWordProgress, completeLesson, isLessonDone, passTest,
    completeLevel, recordPerfectPronunciation, setWordOfDay, getWordOfDay,
    setTheme, getState, resetAll, ACHIEVEMENTS, XP_LEVELS,
    isInMyCards, addMyCardRef, addMyCardCustom, removeMyCard, getMyCards,
    isStorageAvailable, isStorageOK, exportBackup, importBackup,
  };
})();
