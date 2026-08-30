// ui.js — рендеринг всех экранов приложения
const UI = (() => {
  const genderColor = g => g === 'der' ? 'blue' : g === 'die' ? 'red' : g === 'das' ? 'green' : '';
  const genderDot = g => g === 'der' ? '🔵' : g === 'die' ? '🔴' : g === 'das' ? '🟢' : '';

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  // ---------- ICON SET ----------
  // Единый набор line-иконок (вместо разношёрстных эмодзи) — рисуется через currentColor,
  // поэтому всегда выглядит одинаково на любой платформе/телефоне.
  const ICON_PATHS = {
    home: '<polyline points="4 11 12 4 20 11"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/>',
    lessons: '<path d="M12 6C10 4.6 6.5 4 3.5 4.8V18c3-0.8 6.5-0.2 8.5 1.2 2-1.4 5.5-2 8.5-1.2V4.8C17.5 4 14 4.6 12 6Z"/><line x1="12" y1="6" x2="12" y2="19.2"/>',
    dictionary: '<rect x="6" y="4.5" width="12" height="4" rx="1"/><rect x="5" y="9.5" width="14" height="4" rx="1"/><rect x="4" y="14.5" width="16" height="4" rx="1"/>',
    grammar: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><line x1="3.5" y1="10" x2="20.5" y2="10"/><line x1="9.5" y1="10" x2="9.5" y2="20"/>',
    listening: '<path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="3" y="14" width="4" height="6.5" rx="1.5"/><rect x="17" y="14" width="4" height="6.5" rx="1.5"/>',
    phrasebook: '<path d="M4 5.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H9.5l-4 3.5V17H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z"/>',
    tests: '<rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2.3" width="6" height="3.4" rx="1"/><polyline points="8.5 13 10.7 15.2 15.5 9.8"/>',
    daily: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.3"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    achievements: '<path d="M7 4h10v3.5a5 5 0 0 1-10 0V4Z"/><path d="M7 5H4.2v1.8a3 3 0 0 0 3 3"/><path d="M17 5h2.8v1.8a3 3 0 0 1-3 3"/><line x1="12" y1="12.5" x2="12" y2="16.5"/><line x1="8.7" y1="20" x2="15.3" y2="20"/><line x1="12" y1="16.5" x2="12" y2="20"/>',
    flame: '<path d="M12 2.2c1 3-2.8 4.2-2.8 8a2.8 2.8 0 0 0 5.6 0c0-.9-.7-1.7-.7-2.6 1.9 1.1 3.4 3.6 3.4 6.2a6 6 0 0 1-12 0c0-4.7 3.3-7 6.5-11.6Z"/>',
    star: '<path d="M12 2.5l2.7 5.9 6.4.8-4.7 4.5 1.2 6.4-5.6-3.1-5.6 3.1 1.2-6.4-4.7-4.5 6.4-.8Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><g stroke-linecap="round"><line x1="12" y1="2.5" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21.5"/><line x1="2.5" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21.5" y2="12"/><line x1="5" y1="5" x2="6.8" y2="6.8"/><line x1="17.2" y1="17.2" x2="19" y2="19"/><line x1="19" y1="5" x2="17.2" y2="6.8"/><line x1="6.8" y1="17.2" x2="5" y2="19"/></g>',
    moon: '<path d="M20 14.7A8.4 8.4 0 1 1 9.3 4a7 7 0 0 0 10.7 10.7Z"/>',
    sprout: '<path d="M12 21v-8"/><path d="M12 13c0-3.5-2.5-6-6.5-6.3C5.8 10.8 8.3 13 12 13Z"/><path d="M12 10c0-3 2-5 5.5-5.3C17.9 8.2 15.7 10.3 12 10Z"/>',
    leaf: '<path d="M5 19c9 1.5 14-3.5 14-13-9 0-13.5 4.5-14 13Z"/><path d="M5 19c1-4 3-7 8-10"/>',
    tree: '<path d="M12 21v-6"/><path d="M12 15l-5-5.2h3.1L7 5.5h3.6L9 2.5h6l-1.6 3h3.6l-3.1 4.3H17L12 15Z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><line x1="20" y1="20" x2="15.8" y2="15.8"/>',
    close: '<line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>',
    exam: '<path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="M6 10.3V16c0 1.4 2.7 2.8 6 2.8s6-1.4 6-2.8v-5.7"/><path d="M22 8v5.3"/>',
    reading: '<path d="M4 5.5c2.5-1.3 5.5-1.3 8 0v13c-2.5-1.3-5.5-1.3-8 0Z"/><path d="M20 5.5c-2.5-1.3-5.5-1.3-8 0v13c2.5-1.3 5.5-1.3 8 0Z"/>',
    writing: '<path d="M4 20.5 4.8 17 16.3 5.5a2 2 0 0 1 2.8 0l1.4 1.4a2 2 0 0 1 0 2.8L9 21.2 4 20.5Z"/><line x1="14.5" y1="7.3" x2="18.7" y2="11.5"/>',
    mic: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><line x1="12" y1="17.5" x2="12" y2="21"/><line x1="8.5" y1="21" x2="15.5" y2="21"/>',
    play: '<polygon points="6 4 20 12 6 20 6 4"/>',
    stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
    mycards: '<rect x="3" y="7" width="14" height="10" rx="2" fill="none"/><rect x="7" y="3" width="14" height="10" rx="2" fill="none"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7"/><path d="M6.5 7 7.3 19.5a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L18.5 7"/><line x1="10" y1="11" x2="10" y2="16"/><line x1="14" y1="11" x2="14" y2="16"/>',
    download: '<path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
    upload: '<path d="M12 21v-12"/><polyline points="7 9 12 4 17 9"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><line x1="11" y1="18.3" x2="13" y2="18.3"/>',
    handbook: '<path d="M4 5.5c2.5-1.3 5.5-1.3 8 0v13c-2.5-1.3-5.5-1.3-8 0Z"/><path d="M20 5.5c-2.5-1.3-5.5-1.3-8 0v13c2.5-1.3 5.5-1.3 8 0Z"/><path d="M9.5 4.3v4.2l1.5-1 1.5 1V4.3"/>',
    chevronLeft: '<polyline points="14.5 4.5 7 12 14.5 19.5"/>',
    chevronRight: '<polyline points="9.5 4.5 17 12 9.5 19.5"/>',
    blossom: '<circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none"/><circle cx="12" cy="6.3" r="3"/><circle cx="17" cy="9.2" r="3"/><circle cx="15.2" cy="15" r="3"/><circle cx="8.8" cy="15" r="3"/><circle cx="7" cy="9.2" r="3"/>',
  };
  function icon(name, extraClass = '') {
    const inner = ICON_PATHS[name] || '';
    return `<svg class="ui-icon ${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  }

  function view() { return document.getElementById('app-view'); }

  function toast(msg, type = 'info') {
    const box = document.getElementById('toast-box');
    const t = el(`<div class="toast toast-${type}">${msg}</div>`);
    box.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
  }

  function confetti() {
    const box = document.getElementById('confetti-box');
    const colors = ['#000000', '#dd0000', '#ffce00', '#7cc576'];
    for (let i = 0; i < 60; i++) {
      const p = el(`<div class="confetti-piece"></div>`);
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = (Math.random() * 0.4) + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(p);
      setTimeout(() => p.remove(), 2200);
    }
  }

  // ---------- SHELL / NAV ----------
  function renderShell() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div id="toast-box" class="toast-box"></div>
      <div id="confetti-box" class="confetti-box"></div>
      <div id="word-modal-overlay" class="modal-overlay hidden">
        <div class="modal-box" id="word-modal-box"></div>
      </div>
      <header class="topbar">
        <div class="brand"><span class="brand-badge">Ä</span> <span>BLFRT Schule</span></div>
        <div class="topbar-stats">
          <span class="stat" id="stat-streak">${icon('flame', 'ui-icon-flame')} 0</span>
          <span class="stat" id="stat-xp">${icon('star', 'ui-icon-star')} 0 XP</span>
          <button class="icon-btn" id="theme-toggle" title="Тема">${icon(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon')}</button>
        </div>
      </header>
      <div class="layout">
        <nav class="sidenav" id="sidenav">
          ${navItem('dashboard', 'home', 'Главная')}
          ${navItem('lessons', 'lessons', 'Уроки')}
          ${navItem('dictionary', 'dictionary', 'Словарь')}
          ${navItem('mycards', 'mycards', 'Мои карточки')}
          ${navItem('handbook', 'handbook', 'Методичка')}
          ${navItem('grammar', 'grammar', 'Грамматика')}
          ${navItem('listening', 'listening', 'Аудирование')}
          ${navItem('phrasebook', 'phrasebook', 'Разговорник')}
          ${navItem('tests', 'tests', 'Тесты')}
          ${navItem('exam', 'exam', 'Экзамен B1-B2')}
          ${navItem('daily', 'daily', 'Тренировка дня')}
          ${navItem('achievements', 'achievements', 'Достижения')}
        </nav>
        <main class="content" id="app-view"></main>
      </div>
      <nav class="bottomnav" id="bottomnav">
        ${bottomItem('dashboard', 'home')}
        ${bottomItem('lessons', 'lessons')}
        ${bottomItem('dictionary', 'dictionary')}
        ${bottomItem('tests', 'tests')}
        ${bottomItem('daily', 'daily')}
      </nav>
    `;
    document.getElementById('theme-toggle').addEventListener('click', () => {
      App.toggleTheme();
      document.getElementById('theme-toggle').innerHTML = icon(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon');
    });
    const overlay = document.getElementById('word-modal-overlay');
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeWordModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeWordModal();
    });
    updateTopStats();
  }

  function navItem(route, iconName, label) {
    return `<a href="#/${route}" class="nav-item" data-route="${route}"><span class="nav-icon">${icon(iconName)}</span><span>${label}</span></a>`;
  }
  function bottomItem(route, iconName) {
    return `<a href="#/${route}" class="bottom-item" data-route="${route}">${icon(iconName)}</a>`;
  }

  function setActiveNav(route) {
    document.querySelectorAll('.nav-item, .bottom-item').forEach(n => {
      n.classList.toggle('active', n.dataset.route === route);
    });
    updateTopStats();
  }

  function updateTopStats() {
    const s = Progress.getState();
    const streakEl = document.getElementById('stat-streak');
    const xpEl = document.getElementById('stat-xp');
    if (streakEl) streakEl.innerHTML = `${icon('flame', 'ui-icon-flame')} ${s.streak}`;
    if (xpEl) xpEl.innerHTML = `${icon('star', 'ui-icon-star')} ${s.xp} XP`;
  }

  function speakBtn(text, extraClass = '') {
    return `<button class="btn-speak ${extraClass}" data-speak="${encodeURIComponent(text)}" title="Прослушать">🔊</button>`;
  }

  function attachSpeakButtons(container) {
    container.querySelectorAll('[data-speak]').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); Speech.speak(decodeURIComponent(btn.dataset.speak)); });
    });
    container.querySelectorAll('.word-card[data-word-id]').forEach(card => {
      card.addEventListener('click', () => openWordModal(card.dataset.wordId));
    });
  }

  // ---------- WORD DETAIL MODAL ----------
  const POS_LABELS = {
    noun: 'существительное', verb: 'глагол', adjective: 'прилагательное',
    adverb: 'наречие', interjection: 'междометие', number: 'числительное',
  };

  function wordProgressText(p, context) {
    if (!p || p.status === 'new') {
      return context === 'mycards' ? 'Ещё не повторялось. Нажмите «Учить», чтобы начать.' : 'Ещё не изучалось — встретится в упражнениях урока.';
    }
    const dueDate = new Date(p.due).toLocaleDateString('ru-RU');
    if (p.status === 'learned') return `Выучено твёрдо ✅ (повторений: ${p.reps}). Следующее повторение: ${dueDate}.`;
    return `На повторении (повторений: ${p.reps}). Следующее повторение: ${dueDate}.`;
  }

  function openWordModal(wordId) {
    const w = App.ALL_WORDS.find(x => x.id === wordId) || Progress.getMyCards().find(c => c.id === wordId && c.custom);
    if (!w) return;
    const overlay = document.getElementById('word-modal-overlay');
    const box = document.getElementById('word-modal-box');
    const genderBadge = w.gender ? `<span class="gender-badge g-${genderColor(w.gender)}">${genderDot(w.gender)} ${w.gender}</span>` : '';
    const posLabel = POS_LABELS[w.partOfSpeech] || w.partOfSpeech || '';

    const formsHtml = w.forms ? `
      <div class="modal-section">
        <h4>Спряжение (Präsens)</h4>
        <table class="mini-table">
          <tr><td>ich</td><td><b>${w.forms.ich}</b></td><td>wir</td><td><b>${w.forms.wir}</b></td></tr>
          <tr><td>du</td><td><b>${w.forms.du}</b></td><td>ihr</td><td><b>${w.forms.ihr}</b></td></tr>
          <tr><td>er/sie/es</td><td><b>${w.forms['er/sie/es']}</b></td><td>sie/Sie</td><td><b>${w.forms['sie/Sie']}</b></td></tr>
        </table>
        ${w.perfekt ? `<div class="perfekt">Perfekt: <b>${w.perfekt}</b>${w.irregular ? ' <span class="muted">(неправильный глагол)</span>' : ''}</div>` : ''}
      </div>` : '';

    const nounHtml = (w.gender || w.plural) ? `
      <div class="modal-section">
        <h4>Существительное</h4>
        <div class="modal-noun-info">
          ${genderBadge}
          ${w.plural ? `<div class="word-plural">Множественное число: <b>${w.plural}</b></div>` : ''}
        </div>
      </div>` : '';

    const srsInfo = wordProgressText(Progress.getWordProgress(w.id));

    box.innerHTML = `
      <button class="modal-close" id="word-modal-close" title="Закрыть">${icon('close')}</button>
      <div class="modal-word-header">
        <div class="modal-word-emoji">${w.emoji || '📄'}</div>
        <div>
          <div class="modal-word-de">${w.de} ${genderBadge}</div>
          ${(posLabel || w.level || w.topic) ? `<div class="muted">${posLabel}${w.level ? ` · уровень ${w.level}` : ''}${w.topic ? ` · ${w.topic}` : ''}</div>` : w.custom ? '<div class="muted">Своя карточка</div>' : ''}
        </div>
      </div>

      <div class="modal-section">
        <h4>Произношение</h4>
        ${w.transcription ? `<div class="modal-pronounce-row"><span class="word-transcription">[${w.transcription}]</span></div>` : ''}
        <div class="speed-btns">
          <button class="chip" data-modal-speak="${encodeURIComponent(w.de)}" data-rate="0.6">🐢 Медленно</button>
          <button class="chip" data-modal-speak="${encodeURIComponent(w.de)}" data-rate="0.95">🚶 Нормально</button>
          <button class="chip" data-modal-speak="${encodeURIComponent(w.de)}" data-rate="1.3">🐇 Быстро</button>
        </div>
      </div>

      <div class="modal-section">
        <h4>Перевод</h4>
        <div class="modal-translation">${w.ru}</div>
      </div>

      ${nounHtml}
      ${formsHtml}

      ${w.example_de ? `
      <div class="modal-section">
        <h4>Пример употребления</h4>
        <div class="word-example">
          <div class="ex-de">${w.example_de} ${speakBtn(w.example_de)}</div>
          ${w.example_ru ? `<div class="ex-ru">${w.example_ru}</div>` : ''}
        </div>
      </div>` : ''}

      ${srsInfo ? `
      <div class="modal-section">
        <h4>Прогресс изучения</h4>
        <div class="muted">${srsInfo}</div>
      </div>` : ''}

      <div class="modal-section">
        ${Progress.isInMyCards(w.id)
          ? `<button class="btn-secondary" disabled>✓ В моих карточках</button>`
          : `<button class="btn-primary" id="modal-add-mycards">${icon('plus')} Добавить в мои карточки</button>`}
      </div>
    `;

    box.querySelectorAll('[data-modal-speak]').forEach(btn => {
      btn.addEventListener('click', () => {
        Speech.speak(decodeURIComponent(btn.dataset.modalSpeak), parseFloat(btn.dataset.rate));
      });
    });
    attachSpeakButtons(box);
    box.querySelector('#word-modal-close').addEventListener('click', closeWordModal);
    const addBtn = box.querySelector('#modal-add-mycards');
    if (addBtn) addBtn.addEventListener('click', () => {
      Progress.addMyCardRef(w.id);
      toast('Добавлено в «Мои карточки»', 'success');
      addBtn.outerHTML = '<button class="btn-secondary" disabled>✓ В моих карточках</button>';
    });

    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function closeWordModal() {
    const overlay = document.getElementById('word-modal-overlay');
    overlay.classList.add('hidden');
    document.body.classList.remove('modal-open');
    Speech.stop();
  }

  function wordCard(w, opts = {}) {
    const genderBadge = w.gender ? `<span class="gender-badge g-${genderColor(w.gender)}">${genderDot(w.gender)} ${w.gender}</span>` : '';
    const formsHtml = w.forms ? `
      <div class="word-forms">
        <table class="mini-table">
          <tr><td>ich</td><td>${w.forms.ich}</td><td>wir</td><td>${w.forms.wir}</td></tr>
          <tr><td>du</td><td>${w.forms.du}</td><td>ihr</td><td>${w.forms.ihr}</td></tr>
          <tr><td>er/sie/es</td><td>${w.forms['er/sie/es']}</td><td>sie/Sie</td><td>${w.forms['sie/Sie']}</td></tr>
        </table>
        <div class="perfekt">Perfekt: <b>${w.perfekt || ''}</b></div>
      </div>` : '';
    const pluralHtml = w.plural ? `<div class="word-plural">Plural: <b>${w.plural}</b></div>` : '';
    return `
      <div class="word-card" data-word-id="${w.id}">
        <div class="word-emoji">${w.emoji || '📄'}</div>
        <div class="word-main">
          <div class="word-de-row">
            <span class="word-de">${w.de}</span> ${genderBadge}
            ${speakBtn(w.de)}
          </div>
          <div class="word-transcription">[${w.transcription}]</div>
          <div class="word-ru">${w.ru}</div>
          ${pluralHtml}
          ${formsHtml}
          <div class="word-example">
            <div class="ex-de">${w.example_de} ${speakBtn(w.example_de)}</div>
            <div class="ex-ru">${w.example_ru}</div>
          </div>
        </div>
      </div>`;
  }

  // ---------- DASHBOARD ----------
  function renderDashboard() {
    const s = Progress.getState();
    const lvl = App.currentLevel();
    const meta = App.LEVEL_META[lvl];
    const levelInfo = Progress.getLevelInfo();
    const wod = App.pickWordOfDay();
    const pct = App.overallProgressPercent();
    const goalPct = Math.min(100, Math.round((s.dailyMinutesToday / s.dailyGoalMinutes) * 100));

    const storageWarning = !Progress.isStorageAvailable() ? `
      <div class="card storage-warning">
        ⚠️ Браузер блокирует сохранение данных на этом устройстве (часто это приватный/инкогнито-режим). Прогресс и карточки <b>не сохранятся</b> после закрытия вкладки. Откройте сайт в обычном режиме или установите его как приложение.
      </div>` : '';

    const showInstallCard = !App.isStandalone();

    view().innerHTML = `
      ${storageWarning}
      <div class="dash-grid">
        <section class="card hero-card">
          <div class="hero-level">${icon(meta.icon)} Уровень <b>${meta.label}</b></div>
          <div class="progressbar big"><div class="progressbar-fill" style="width:${pct}%"></div></div>
          <div class="hero-sub">${s.wordsLearnedCount} / ${App.totalWordCount()} слов выучено (${pct}%)</div>
          <div class="hero-row">
            <div class="hero-stat">${icon('flame', 'ui-icon-flame')} <b>${s.streak}</b><span>дней подряд</span></div>
            <div class="hero-stat">${icon('star', 'ui-icon-star')} <b>${s.xp}</b><span>XP · ${levelInfo.current.name}</span></div>
          </div>
        </section>

        <section class="card">
          <h3>Ежедневная цель</h3>
          <div class="progressbar"><div class="progressbar-fill accent" style="width:${goalPct}%"></div></div>
          <div class="hero-sub">${s.dailyMinutesToday} / ${s.dailyGoalMinutes} мин сегодня</div>
          <div class="goal-btns">
            <button class="chip" data-goal="10">10 мин</button>
            <button class="chip" data-goal="20">20 мин</button>
            <button class="chip" data-goal="30">30 мин</button>
          </div>
        </section>

        ${wod ? `
        <section class="card word-of-day">
          <h3>Слово дня</h3>
          ${wordCard(wod)}
        </section>` : ''}

        <section class="card quick-access">
          <h3>Быстрый доступ</h3>
          <div class="quick-grid">
            <a href="#/lessons" class="quick-item">${icon('lessons')}<span>Уроки</span></a>
            <a href="#/dictionary" class="quick-item">${icon('dictionary')}<span>Словарь</span></a>
            <a href="#/mycards" class="quick-item">${icon('mycards')}<span>Мои карточки</span></a>
            <a href="#/handbook" class="quick-item">${icon('handbook')}<span>Методичка</span></a>
            <a href="#/grammar" class="quick-item">${icon('grammar')}<span>Грамматика</span></a>
            <a href="#/listening" class="quick-item">${icon('listening')}<span>Аудирование</span></a>
            <a href="#/phrasebook" class="quick-item">${icon('phrasebook')}<span>Разговорник</span></a>
            <a href="#/tests" class="quick-item">${icon('tests')}<span>Тесты</span></a>
            <a href="#/exam" class="quick-item">${icon('exam')}<span>Экзамен B1-B2</span></a>
          </div>
        </section>

        <section class="card">
          <h3>${icon('daily')} Тренировка дня</h3>
          <p class="muted">5 слов + 3 грамматики + аудио + произношение + диалог (~10 мин)</p>
          <a href="#/daily" class="btn-primary">Начать тренировку</a>
        </section>

        ${showInstallCard ? `
        <section class="card">
          <h3>${icon('phone')} Установить как приложение</h3>
          <p class="muted">Работает офлайн, открывается с домашнего экрана как обычное приложение, без адресной строки браузера.</p>
          <div id="install-area"></div>
        </section>` : ''}

        <section class="card">
          <h3>${icon('download')} Резервная копия</h3>
          <p class="muted">Весь прогресс хранится только в этом браузере на этом устройстве. Сохраните копию, чтобы не потерять её при смене телефона, очистке кэша или переустановке.</p>
          <div class="backup-actions">
            <button class="btn-secondary" id="backup-export">${icon('download')} Скачать копию</button>
            <button class="btn-secondary" id="backup-import">${icon('upload')} Восстановить из файла</button>
            <input type="file" id="backup-file-input" accept="application/json" class="hidden" />
          </div>
        </section>
      </div>
    `;
    attachSpeakButtons(view());
    view().querySelectorAll('[data-goal]').forEach(b => {
      b.addEventListener('click', () => {
        Progress.getState().dailyGoalMinutes = parseInt(b.dataset.goal, 10);
        Progress.save();
        renderDashboard();
      });
    });

    if (showInstallCard) renderInstallArea();
    document.getElementById('backup-export').addEventListener('click', exportProgressBackup);
    const fileInput = document.getElementById('backup-file-input');
    document.getElementById('backup-import').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          Progress.importBackup(reader.result);
          toast('Резервная копия восстановлена!', 'success');
          renderDashboard();
          updateTopStats();
        } catch (err) {
          toast('Не удалось прочитать файл резервной копии', 'error');
        }
      };
      reader.readAsText(file);
    });
  }

  function renderInstallArea() {
    const area = document.getElementById('install-area');
    if (!area) return;
    if (App.canInstall()) {
      area.innerHTML = `<button class="btn-primary" id="install-btn">${icon('phone')} Установить</button>`;
      document.getElementById('install-btn').addEventListener('click', () => {
        App.promptInstall().then(accepted => {
          if (accepted) { toast('Приложение установлено!', 'success'); renderDashboard(); }
        });
      });
    } else if (App.isIOS()) {
      area.innerHTML = `<p class="muted">В Safari нажмите <b>«Поделиться»</b> ${'⬆️'} внизу экрана → <b>«На экран «Домой»»</b>.</p>`;
    } else {
      area.innerHTML = `<p class="muted">Откройте меню браузера и выберите «Установить приложение» или «Добавить на главный экран».</p>`;
    }
  }

  function exportProgressBackup() {
    const json = Progress.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `blfrt-schule-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast('Резервная копия сохранена');
  }

  // ---------- LESSONS: level select ----------
  function renderLevelSelect() {
    view().innerHTML = `
      <h2>Уроки</h2>
      <div class="level-grid">
        ${Object.keys(App.LEVEL_META).map(lvl => {
          const meta = App.LEVEL_META[lvl];
          const words = App.getWordsByLevel(lvl);
          return `<a href="#/lessons/${lvl}" class="level-card">
            <div class="level-icon">${icon(meta.icon)}</div>
            <div class="level-name">${lvl}</div>
            <div class="muted">${words.length} слов в наборе</div>
          </a>`;
        }).join('')}
      </div>
    `;
  }

  function renderTopicList(level) {
    const topics = App.getTopicsForLevel(level);
    const meta = App.LEVEL_META[level];
    view().innerHTML = `
      <div class="breadcrumb"><a href="#/lessons">Уроки</a> / ${icon(meta.icon)} ${level}</div>
      <h2>${icon(meta.icon)} Темы уровня ${level}</h2>
      <div class="topic-list">
        ${topics.map((t, i) => `
          <a href="#/lessons/${level}/${encodeURIComponent(t.topic)}" class="topic-row ${t.lessonCount === 0 ? 'disabled' : ''}">
            <div class="topic-num">${i + 1}</div>
            <div class="topic-info">
              <div class="topic-title">${t.topic}</div>
              <div class="muted">${t.wordCount} слов · ${t.doneCount}/${t.lessonCount} уроков пройдено</div>
            </div>
            <div class="topic-progress">
              <div class="progressbar small"><div class="progressbar-fill" style="width:${t.lessonCount ? (t.doneCount / t.lessonCount * 100) : 0}%"></div></div>
            </div>
          </a>`).join('')}
      </div>
    `;
  }

  function renderLessonList(level, topic) {
    const lessons = App.getLessonsForTopic(level, topic);
    const meta = App.LEVEL_META[level];
    view().innerHTML = `
      <div class="breadcrumb"><a href="#/lessons">Уроки</a> / <a href="#/lessons/${level}">${icon(meta.icon)} ${level}</a> / ${topic}</div>
      <h2>${topic}</h2>
      ${lessons.length === 0 ? `<p class="muted">Слова для этой темы будут добавлены на следующих шагах генерации.</p>` : ''}
      <div class="lesson-list">
        ${lessons.map((l, i) => `
          <a href="#/lesson/${encodeURIComponent(l.id)}" class="lesson-row ${Progress.isLessonDone(l.id) ? 'done' : ''}">
            <div class="lesson-num">${Progress.isLessonDone(l.id) ? '✅' : i + 1}</div>
            <div class="lesson-info">
              <div class="lesson-title">Урок ${i + 1}</div>
              <div class="muted">${l.words.length} новых слов</div>
            </div>
          </a>`).join('')}
      </div>
    `;
  }

  // ---------- LESSON DETAIL ----------
  function renderLessonDetail(lessonId) {
    const lesson = App.getLesson(lessonId);
    if (!lesson) { view().innerHTML = `<p>Урок не найден.</p>`; return; }
    const meta = App.LEVEL_META[lesson.level];
    const dialog = DIALOGS.find(d => d.level === lesson.level && d.topic === lesson.topic);
    // каждый урок получает свою тему грамматики по кругу, а не всегда одну и ту же
    const levelGrammar = GRAMMAR.filter(g => g.level === lesson.level);
    const levelLessons = App.LESSONS.filter(l => l.level === lesson.level);
    const lessonGlobalIdx = Math.max(0, levelLessons.findIndex(l => l.id === lesson.id));
    const grammar = levelGrammar.length ? [levelGrammar[lessonGlobalIdx % levelGrammar.length]] : [];

    view().innerHTML = `
      <div class="breadcrumb"><a href="#/lessons">Уроки</a> / <a href="#/lessons/${lesson.level}">${icon(meta.icon)} ${lesson.level}</a> / <a href="#/lessons/${lesson.level}/${encodeURIComponent(lesson.topic)}">${lesson.topic}</a></div>
      <h2>${lesson.title}</h2>
      <div class="tabs" id="lesson-tabs">
        <button class="tab active" data-tab="words">Слова</button>
        <button class="tab" data-tab="dialog" ${!dialog ? 'disabled' : ''}>Диалог</button>
        <button class="tab" data-tab="grammar" ${!grammar.length ? 'disabled' : ''}>Грамматика</button>
        <button class="tab" data-tab="exercises">Упражнения</button>
      </div>
      <div id="lesson-tab-content"></div>
    `;

    function showTab(tab) {
      view().querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
      const box = document.getElementById('lesson-tab-content');
      if (tab === 'words') {
        box.innerHTML = `<div class="word-list">${lesson.words.map(w => wordCard(w)).join('')}</div>
          <button class="btn-primary" id="words-done-btn">Слова изучены → к упражнениям</button>`;
        attachSpeakButtons(box);
        document.getElementById('words-done-btn').addEventListener('click', () => {
          lesson.words.forEach(w => Progress.addXP(5));
          updateTopStats();
          toast('+' + (lesson.words.length * 5) + ' XP за новые слова!');
          showTab('exercises');
        });
      } else if (tab === 'dialog' && dialog) {
        box.innerHTML = renderDialogHtml(dialog);
        attachSpeakButtons(box);
        attachDialogHandlers(box, dialog);
      } else if (tab === 'grammar' && grammar.length) {
        box.innerHTML = grammar.map(renderGrammarBlock).join('');
        attachSpeakButtons(box);
      } else if (tab === 'exercises') {
        renderExerciseFlow(box, lesson);
      }
    }

    view().querySelectorAll('.tab').forEach(t => {
      t.addEventListener('click', () => { if (!t.disabled) showTab(t.dataset.tab); });
    });
    showTab('words');
  }

  function renderDialogHtml(dialog) {
    return `
      <div class="dialog-box">
        <div class="dialog-controls">
          <button class="btn-secondary" data-speak-dialog="1">🔊 Прослушать целиком</button>
          <button class="chip" id="toggle-de">Скрыть немецкий</button>
          <button class="chip" id="toggle-ru">Скрыть русский</button>
        </div>
        <div class="dialog-lines">
          ${dialog.lines.map((l, i) => `
            <div class="dialog-line speaker-${l.speaker}" id="dl-line-${i}">
              <div class="dialog-de">${l.de} ${speakBtn(l.de)}</div>
              <div class="dialog-ru" data-line-ru="${i}">${l.ru}</div>
            </div>`).join('')}
        </div>
      </div>
    `;
  }

  function attachDialogHandlers(box, dialog) {
    const btn = box.querySelector('[data-speak-dialog]');
    if (btn) btn.addEventListener('click', () => {
      box.querySelectorAll('.dialog-line').forEach(el => el.classList.remove('speaking'));
      Speech.speakDialog(dialog.lines, {
        onLineStart: (i) => {
          box.querySelectorAll('.dialog-line').forEach(el => el.classList.remove('speaking'));
          const el = box.querySelector(`#dl-line-${i}`);
          if (el) el.classList.add('speaking');
        },
        onDone: () => box.querySelectorAll('.dialog-line').forEach(el => el.classList.remove('speaking')),
      });
    });
    let deHidden = false, ruHidden = false;
    box.querySelector('#toggle-de').addEventListener('click', (e) => {
      deHidden = !deHidden;
      box.querySelectorAll('.dialog-de').forEach(d => d.classList.toggle('hidden-text', deHidden));
      e.target.textContent = deHidden ? 'Показать немецкий' : 'Скрыть немецкий';
    });
    box.querySelector('#toggle-ru').addEventListener('click', (e) => {
      ruHidden = !ruHidden;
      box.querySelectorAll('.dialog-ru').forEach(d => d.classList.toggle('hidden-text', ruHidden));
      e.target.textContent = ruHidden ? 'Показать русский' : 'Скрыть русский';
    });
  }

  function renderGrammarBlock(g) {
    return `
      <div class="grammar-block">
        <h3>${g.title}</h3>
        <p>${g.explanation}</p>
        <table class="grammar-table">
          <tr>${g.table.headers.map(h => `<th>${h}</th>`).join('')}</tr>
          ${g.table.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </table>
        <div class="mnemonic">💡 ${g.mnemonic}</div>
        <div class="grammar-examples">
          ${g.examples.map(ex => `<div class="ex-row"><span>${ex.de}</span> ${speakBtn(ex.de)} <span class="muted">— ${ex.ru}</span></div>`).join('')}
        </div>
      </div>
    `;
  }

  // ---------- EXERCISE FLOW ----------
  function renderExerciseFlow(box, lesson) {
    const pool = App.getWordsByLevel(lesson.level);
    const bank = Exercises.buildAllExercises(lesson.words, pool);
    const queue = [];
    ['flashcard', 'multiple_choice', 'type_word', 'sentence_build', 'fill_blank', 'listen_choose', 'pronounce', 'match_pairs', 'article_trainer', 'dictation']
      .forEach(type => { if (bank[type] && bank[type].length) queue.push(...bank[type].map(e => ({ ...e }))); });

    let idx = 0, correctCount = 0;
    const total = queue.length;

    function next() {
      idx++;
      if (idx >= total) return finish();
      renderCurrent();
    }

    function finish() {
      Progress.completeLesson(lesson.id);
      Progress.addXP(50);
      confetti();
      box.innerHTML = `
        <div class="exercise-done card">
          <h3>🎉 Урок завершён!</h3>
          <p>Правильно: ${correctCount} / ${total}</p>
          <p>+50 XP за урок</p>
          <a href="#/lessons/${lesson.level}/${encodeURIComponent(lesson.topic)}" class="btn-primary">К списку уроков</a>
        </div>
      `;
      const newly = Progress.checkAchievements();
      newly.forEach(a => toast(`🏆 Достижение: ${a.title}`, 'success'));
      updateTopStats();
    }

    function markResult(ok) {
      if (ok) { correctCount++; Progress.addXP(10); }
      updateTopStats();
      setTimeout(next, 900);
    }

    function renderCurrent() {
      const e = queue[idx];
      const progressPct = Math.round((idx / total) * 100);
      box.innerHTML = `<div class="ex-progress"><div class="progressbar small"><div class="progressbar-fill" style="width:${progressPct}%"></div></div><div class="muted">${idx + 1} / ${total}</div></div><div id="ex-body"></div>`;
      const body = document.getElementById('ex-body');
      renderExercise(body, e, markResult);
    }

    renderCurrent();
  }

  function feedback(body, ok, correctText) {
    const f = el(`<div class="feedback ${ok ? 'ok' : 'bad'}">${ok ? '✅ Верно!' : '❌ Неверно. Правильно: ' + correctText}</div>`);
    body.appendChild(f);
  }

  function renderExercise(body, e, onResult) {
    const w = e.word;
    switch (e.type) {
      case 'flashcard': {
        body.innerHTML = `
          <div class="ex-card flashcard">
            <div class="fc-front">
              <div class="word-emoji">${w.emoji || '📄'}</div>
              <div class="word-de">${w.de} ${speakBtn(w.de)}</div>
              ${w.transcription ? `<div class="word-transcription">[${w.transcription}]</div>` : ''}
              <button class="btn-secondary" id="fc-flip">Показать перевод</button>
            </div>
            <div class="fc-back hidden">
              <div class="word-ru">${w.ru}</div>
              ${w.example_de ? `<div class="ex-de">${w.example_de}</div>` : ''}
              ${w.example_ru ? `<div class="ex-ru muted">${w.example_ru}</div>` : ''}
              <div class="fc-quality">
                <button class="chip bad" data-q="2">Не помню</button>
                <button class="chip" data-q="3">Сложно</button>
                <button class="chip ok" data-q="4">Хорошо</button>
                <button class="chip ok" data-q="5">Легко</button>
              </div>
            </div>
          </div>
        `;
        attachSpeakButtons(body);
        body.querySelector('#fc-flip').addEventListener('click', () => {
          body.querySelector('.fc-back').classList.remove('hidden');
        });
        body.querySelectorAll('[data-q]').forEach(btn => {
          btn.addEventListener('click', () => {
            const q = parseInt(btn.dataset.q, 10);
            const card = SpacedRepetition.review(Progress.getWordProgress(w.id) || SpacedRepetition.initCard(), q);
            Progress.markWordLearned(w.id, card);
            onResult(q >= 3);
          });
        });
        break;
      }
      case 'multiple_choice': {
        body.innerHTML = `
          <div class="ex-card">
            <h4>Выбери перевод</h4>
            <div class="mc-word">${w.de} ${speakBtn(w.de)}</div>
            <div class="mc-options">
              ${e.options.map(o => `<button class="option-btn" data-val="${encodeURIComponent(o)}">${o}</button>`).join('')}
            </div>
          </div>
        `;
        attachSpeakButtons(body);
        body.querySelectorAll('.option-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const val = decodeURIComponent(btn.dataset.val);
            const ok = val === e.correct;
            body.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
            btn.classList.add(ok ? 'correct' : 'wrong');
            feedback(body, ok, e.correct);
            onResult(ok);
          });
        });
        break;
      }
      case 'type_word': {
        body.innerHTML = `
          <div class="ex-card">
            <h4>Напиши слово по-немецки</h4>
            <div class="mc-word">${w.ru}</div>
            <input type="text" class="text-input" id="type-input" autocomplete="off" spellcheck="false" />
            <div class="special-chars">
              ${['ä','ö','ü','ß'].map(c => `<button class="chip char-btn" data-char="${c}">${c}</button>`).join('')}
            </div>
            <button class="btn-primary" id="type-submit">Проверить</button>
          </div>
        `;
        const input = document.getElementById('type-input');
        body.querySelectorAll('.char-btn').forEach(b => b.addEventListener('click', () => { input.value += b.dataset.char; input.focus(); }));
        function submit() {
          const ok = Exercises.checkTextAnswer(input.value, e.correct);
          input.disabled = true;
          document.getElementById('type-submit').disabled = true;
          feedback(body, ok, w.de);
          onResult(ok);
        }
        document.getElementById('type-submit').addEventListener('click', submit);
        input.addEventListener('keydown', ev => { if (ev.key === 'Enter') submit(); });
        break;
      }
      case 'sentence_build': {
        let picked = [];
        body.innerHTML = `
          <div class="ex-card">
            <h4>Собери предложение</h4>
            <div class="ru-hint muted">${w.example_ru}</div>
            <div class="sentence-slot" id="sentence-slot"></div>
            <div class="sentence-tokens" id="sentence-tokens">
              ${e.tokens.map((tok, i) => `<button class="token-btn" data-i="${i}">${tok}</button>`).join('')}
            </div>
            <button class="btn-primary" id="sentence-submit">Проверить</button>
          </div>
        `;
        const slot = document.getElementById('sentence-slot');
        const tokensBox = document.getElementById('sentence-tokens');
        tokensBox.querySelectorAll('.token-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            picked.push(btn.textContent);
            btn.classList.add('used');
            btn.disabled = true;
            slot.textContent = picked.join(' ');
          });
        });
        document.getElementById('sentence-submit').addEventListener('click', () => {
          const built = picked.join(' ') + e.punctuation;
          const ok = Exercises.normalizeForCompare(built) === Exercises.normalizeForCompare(w.example_de);
          feedback(body, ok, w.example_de);
          document.getElementById('sentence-submit').disabled = true;
          onResult(ok);
        });
        break;
      }
      case 'fill_blank': {
        body.innerHTML = `
          <div class="ex-card">
            <h4>Заполни пропуск</h4>
            <div class="fill-sentence">${e.sentence}</div>
            <div class="muted">${w.example_ru}</div>
            <input type="text" class="text-input" id="fill-input" autocomplete="off" spellcheck="false" />
            <button class="btn-primary" id="fill-submit">Проверить</button>
          </div>
        `;
        document.getElementById('fill-submit').addEventListener('click', () => {
          const val = document.getElementById('fill-input').value;
          const ok = Exercises.checkTextAnswer(val, e.correct);
          feedback(body, ok, e.correct);
          document.getElementById('fill-submit').disabled = true;
          onResult(ok);
        });
        break;
      }
      case 'listen_choose': {
        body.innerHTML = `
          <div class="ex-card">
            <h4>Прослушай и выбери перевод</h4>
            <button class="btn-secondary" id="listen-play">🔊 Прослушать</button>
            <div class="mc-options">
              ${e.options.map(o => `<button class="option-btn" data-val="${encodeURIComponent(o)}">${o}</button>`).join('')}
            </div>
          </div>
        `;
        document.getElementById('listen-play').addEventListener('click', () => Speech.speak(w.de));
        Speech.speak(w.de);
        body.querySelectorAll('.option-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const val = decodeURIComponent(btn.dataset.val);
            const ok = val === e.correct;
            body.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
            btn.classList.add(ok ? 'correct' : 'wrong');
            feedback(body, ok, e.correct);
            onResult(ok);
          });
        });
        break;
      }
      case 'pronounce': {
        body.innerHTML = `
          <div class="ex-card">
            <h4>Произнеси слово</h4>
            <div class="mc-word">${w.de} ${speakBtn(w.de)}</div>
            <button class="btn-primary" id="record-btn">🎤 Записать</button>
            <div id="pronounce-result"></div>
            ${!Speech.isSTTSupported ? '<div class="muted">Распознавание речи не поддерживается в этом браузере — пропустите упражнение.</div>' : ''}
            <button class="btn-secondary" id="skip-btn">Пропустить</button>
          </div>
        `;
        attachSpeakButtons(body);
        document.getElementById('skip-btn').addEventListener('click', () => onResult(true));
        const recordBtn = document.getElementById('record-btn');
        if (Speech.isSTTSupported) {
          recordBtn.addEventListener('click', () => {
            recordBtn.disabled = true;
            recordBtn.textContent = '🎙️ Слушаю...';
            Speech.recognize(e.target, {
              onResult: ({ said, similarity }) => {
                const ok = similarity >= 70;
                if (similarity === 100) Progress.recordPerfectPronunciation();
                document.getElementById('pronounce-result').innerHTML = `<div class="muted">Вы сказали: "${said}" — совпадение ${similarity}%</div>`;
                feedback(body, ok, w.de);
                onResult(ok);
              },
              onError: (err) => {
                toast('Ошибка распознавания: ' + err, 'error');
                recordBtn.disabled = false;
                recordBtn.textContent = '🎤 Записать';
              },
            });
          });
        } else {
          recordBtn.disabled = true;
        }
        break;
      }
      case 'match_pairs': {
        const left = Exercises.shuffle(e.pairs.map(p => ({ id: p.id, text: p.de, side: 'de' })));
        const right = Exercises.shuffle(e.pairs.map(p => ({ id: p.id, text: p.ru, side: 'ru' })));
        let selectedLeft = null;
        let matched = 0;
        body.innerHTML = `
          <div class="ex-card">
            <h4>Соедини пары</h4>
            <div class="match-grid">
              <div class="match-col" id="match-left">${left.map(p => `<button class="match-item" data-id="${p.id}">${p.text}</button>`).join('')}</div>
              <div class="match-col" id="match-right">${right.map(p => `<button class="match-item" data-id="${p.id}">${p.text}</button>`).join('')}</div>
            </div>
          </div>
        `;
        const leftBtns = body.querySelectorAll('#match-left .match-item');
        const rightBtns = body.querySelectorAll('#match-right .match-item');
        leftBtns.forEach(btn => btn.addEventListener('click', () => {
          if (btn.classList.contains('matched')) return;
          leftBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedLeft = btn;
        }));
        rightBtns.forEach(btn => btn.addEventListener('click', () => {
          if (btn.classList.contains('matched') || !selectedLeft) return;
          const ok = selectedLeft.dataset.id === btn.dataset.id;
          if (ok) {
            selectedLeft.classList.add('matched');
            btn.classList.add('matched');
            matched++;
            if (matched === e.pairs.length) { feedback(body, true, ''); onResult(true); }
          } else {
            btn.classList.add('wrong-flash');
            setTimeout(() => btn.classList.remove('wrong-flash'), 400);
          }
          selectedLeft.classList.remove('selected');
          selectedLeft = null;
        }));
        break;
      }
      case 'article_trainer': {
        body.innerHTML = `
          <div class="ex-card">
            <h4>Выбери правильный артикль</h4>
            <div class="mc-word">___ ${w.de.replace(/^(der|die|das)\s/, '')} ${speakBtn(w.de)}</div>
            <div class="mc-options article-options">
              <button class="option-btn g-blue" data-val="der">der</button>
              <button class="option-btn g-red" data-val="die">die</button>
              <button class="option-btn g-green" data-val="das">das</button>
            </div>
          </div>
        `;
        attachSpeakButtons(body);
        body.querySelectorAll('.option-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const ok = btn.dataset.val === e.correct;
            body.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
            btn.classList.add(ok ? 'correct' : 'wrong');
            feedback(body, ok, e.correct);
            onResult(ok);
          });
        });
        break;
      }
      case 'dictation': {
        body.innerHTML = `
          <div class="ex-card">
            <h4>Диктант: прослушай и напиши</h4>
            <button class="btn-secondary" id="dict-play">🔊 Прослушать</button>
            <textarea class="text-input" id="dict-input" rows="2" spellcheck="false"></textarea>
            <button class="btn-primary" id="dict-submit">Проверить</button>
          </div>
        `;
        document.getElementById('dict-play').addEventListener('click', () => Speech.speak(e.correct, 0.8));
        document.getElementById('dict-submit').addEventListener('click', () => {
          const val = document.getElementById('dict-input').value;
          const ok = Exercises.checkTextAnswer(val, e.correct);
          feedback(body, ok, e.correct);
          document.getElementById('dict-submit').disabled = true;
          onResult(ok);
        });
        break;
      }
      default:
        onResult(true);
    }
  }

  // ---------- DICTIONARY ----------
  function renderDictionary() {
    const state = { search: '', level: 'all', topic: 'all', pos: 'all' };
    const RESULT_LIMIT = 300;
    view().innerHTML = `
      <h2>Словарь (${App.ALL_WORDS.length} слов)</h2>
      <div class="search-box">
        ${icon('search', 'search-box-icon')}
        <input type="text" id="dict-search" placeholder="Поиск: немецкое слово, перевод или транскрипция..." class="search-box-input" autocomplete="off" />
        <button class="search-box-clear hidden" id="dict-search-clear" title="Очистить">${icon('close')}</button>
      </div>
      <div class="dict-filters">
        <select id="dict-level" class="select-input">
          <option value="all">Все уровни</option>
          <option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option><option value="B2">B2</option>
        </select>
        <select id="dict-pos" class="select-input">
          <option value="all">Все части речи</option>
          <option value="noun">Существительные</option>
          <option value="verb">Глаголы</option>
          <option value="adjective">Прилагательные</option>
          <option value="adverb">Наречия</option>
          <option value="interjection">Междометия</option>
          <option value="number">Числа</option>
        </select>
        <button class="btn-secondary" id="dict-export">Экспорт для Anki</button>
      </div>
      <div class="muted" id="dict-count"></div>
      <div class="word-list" id="dict-results"></div>
    `;
    function renderResults() {
      const q = state.search.trim().toLowerCase();
      const all = App.ALL_WORDS.filter(w => {
        if (state.level !== 'all' && w.level !== state.level) return false;
        if (state.pos !== 'all' && w.partOfSpeech !== state.pos) return false;
        if (q && !(
          w.de.toLowerCase().includes(q) ||
          w.ru.toLowerCase().includes(q) ||
          (w.transcription && w.transcription.toLowerCase().includes(q))
        )) return false;
        return true;
      });
      const results = all.slice(0, RESULT_LIMIT);
      document.getElementById('dict-count').textContent = all.length
        ? `Найдено: ${all.length}${all.length > RESULT_LIMIT ? ` (показаны первые ${RESULT_LIMIT})` : ''}`
        : '';
      document.getElementById('dict-results').innerHTML = results.map(w => wordCard(w)).join('') || '<p class="muted">Ничего не найдено.</p>';
      attachSpeakButtons(document.getElementById('dict-results'));
    }
    const searchInput = document.getElementById('dict-search');
    const clearBtn = document.getElementById('dict-search-clear');
    searchInput.addEventListener('input', e => {
      state.search = e.target.value;
      clearBtn.classList.toggle('hidden', !state.search);
      renderResults();
    });
    clearBtn.addEventListener('click', () => {
      state.search = '';
      searchInput.value = '';
      clearBtn.classList.add('hidden');
      renderResults();
      searchInput.focus();
    });
    document.getElementById('dict-level').addEventListener('change', e => { state.level = e.target.value; renderResults(); });
    document.getElementById('dict-pos').addEventListener('change', e => { state.pos = e.target.value; renderResults(); });
    document.getElementById('dict-export').addEventListener('click', () => exportAnki());
    renderResults();
  }

  function exportAnki() {
    const lines = App.ALL_WORDS.map(w => `${w.de}\t${w.ru} [${w.transcription}]\t${w.example_de} — ${w.example_ru}`);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'deutsch_wortschatz_anki.txt';
    a.click();
    toast('Файл для импорта в Anki сохранён');
  }

  // ---------- МОИ КАРТОЧКИ (личная колода, аналог Anki) ----------
  function resolveMyCard(entry) {
    if (entry.custom) return entry;
    const w = App.ALL_WORDS.find(x => x.id === entry.id);
    return w || null;
  }

  function renderMyCards() {
    const entries = Progress.getMyCards();
    const cards = entries.map(resolveMyCard).filter(Boolean);
    const dueCount = cards.filter(w => SpacedRepetition.isDue(Progress.getWordProgress(w.id))).length;

    view().innerHTML = `
      <h2>${icon('mycards')} Мои карточки</h2>
      <p class="muted">Добавляйте свои слова или выбирайте их из словаря (кнопка «Добавить в мои карточки» в карточке слова) — и учите их по системе интервальных повторений, как в Anki.</p>
      <div class="card">
        <button class="btn-primary" id="mycards-add-toggle">${icon('plus')} Добавить своё слово</button>
        <div class="mycards-add-form hidden" id="mycards-add-form">
          <input type="text" id="mc-de" class="text-input" placeholder="Слово по-немецки (обязательно)" />
          <input type="text" id="mc-ru" class="text-input" placeholder="Перевод (обязательно)" />
          <input type="text" id="mc-transcription" class="text-input" placeholder="Транскрипция (необязательно)" />
          <input type="text" id="mc-example-de" class="text-input" placeholder="Пример на немецком (необязательно)" />
          <input type="text" id="mc-example-ru" class="text-input" placeholder="Перевод примера (необязательно)" />
          <button class="btn-primary" id="mc-save">Сохранить карточку</button>
        </div>
      </div>
      <div class="card">
        <h3>Карточек в колоде: ${cards.length}</h3>
        <p class="muted">К повторению сегодня: ${dueCount}</p>
        <button class="btn-primary" id="mycards-study" ${cards.length === 0 ? 'disabled' : ''}>${icon('play')} Учить ${dueCount > 0 ? `(${dueCount} к повторению)` : '(повторить всё)'}</button>
      </div>
      <div class="word-list" id="mycards-list"></div>
    `;

    const toggleBtn = document.getElementById('mycards-add-toggle');
    const form = document.getElementById('mycards-add-form');
    toggleBtn.addEventListener('click', () => form.classList.toggle('hidden'));
    document.getElementById('mc-save').addEventListener('click', () => {
      const de = document.getElementById('mc-de').value.trim();
      const ru = document.getElementById('mc-ru').value.trim();
      if (!de || !ru) { toast('Заполните слово и перевод', 'error'); return; }
      Progress.addMyCardCustom({
        de, ru,
        transcription: document.getElementById('mc-transcription').value.trim(),
        example_de: document.getElementById('mc-example-de').value.trim(),
        example_ru: document.getElementById('mc-example-ru').value.trim(),
      });
      toast('Карточка добавлена!', 'success');
      renderMyCards();
    });

    document.getElementById('mycards-study').addEventListener('click', () => startMyCardsStudy(cards, dueCount > 0));

    const listBox = document.getElementById('mycards-list');
    if (!cards.length) {
      listBox.innerHTML = '<p class="muted">Пока пусто. Добавьте своё слово или зайдите в словарь и нажмите «Добавить в мои карточки» у нужного слова.</p>';
    } else {
      listBox.innerHTML = cards.map(w => {
        const status = wordProgressText(Progress.getWordProgress(w.id), 'mycards');
        return `
        <div class="word-card mycard-row" data-word-id="${w.id}">
          <div class="word-emoji">${w.emoji || '📝'}</div>
          <div class="word-main">
            <div class="word-de-row"><span class="word-de">${w.de}</span> ${speakBtn(w.de)}</div>
            ${w.transcription ? `<div class="word-transcription">[${w.transcription}]</div>` : ''}
            <div class="word-ru">${w.ru}</div>
            <div class="muted mycard-status">${status}</div>
          </div>
          <button class="icon-btn mycard-remove" data-remove-id="${w.id}" title="Удалить из моих карточек">${icon('trash')}</button>
        </div>`;
      }).join('');
      attachSpeakButtons(listBox);
      listBox.querySelectorAll('[data-remove-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          Progress.removeMyCard(btn.dataset.removeId);
          renderMyCards();
        });
      });
    }
  }

  function startMyCardsStudy(allCards, useDueOnly) {
    const pool = useDueOnly ? allCards.filter(w => SpacedRepetition.isDue(Progress.getWordProgress(w.id))) : allCards;
    const queue = Exercises.shuffle(pool);
    let idx = 0, reviewed = 0;
    view().innerHTML = `
      <div class="breadcrumb"><a href="#/mycards">Мои карточки</a> / Учить</div>
      <h2>${icon('play')} Тренировка карточек</h2>
      <div class="ex-progress"><div class="progressbar small"><div class="progressbar-fill" id="mycards-progressbar" style="width:0%"></div></div></div>
      <div id="mycards-study-body"></div>
    `;
    const body = document.getElementById('mycards-study-body');
    function renderNext() {
      if (idx >= queue.length) return renderDone();
      document.getElementById('mycards-progressbar').style.width = Math.round((idx / queue.length) * 100) + '%';
      renderExercise(body, { type: 'flashcard', word: queue[idx] }, (ok) => {
        reviewed++;
        idx++;
        setTimeout(renderNext, 500);
      });
    }
    function renderDone() {
      Progress.addXP(reviewed * 3);
      confetti();
      body.innerHTML = `
        <div class="card">
          <h3>🎉 Готово!</h3>
          <p>Повторено карточек: ${reviewed}</p>
          <p>+${reviewed * 3} XP</p>
          <a href="#/mycards" class="btn-primary">К моим карточкам</a>
        </div>
      `;
      const newly = Progress.checkAchievements();
      newly.forEach(a => toast(`🏆 Достижение: ${a.title}`, 'success'));
      updateTopStats();
    }
    if (!queue.length) {
      body.innerHTML = '<p class="muted">Нет карточек для повторения.</p>';
      return;
    }
    renderNext();
  }

  // ---------- МЕТОДИЧКА (связная книга о немецком языке) ----------
  function renderHandbook() {
    view().innerHTML = `
      <h2>${icon('handbook')} Методичка</h2>
      <p class="muted">Связное объяснение того, как устроен немецкий язык целиком — читайте по порядку, как книгу, а не как справочник отдельных карточек.</p>
      <div class="hb-toc">
        ${HANDBOOK.map(ch => `
          <a href="#/handbook/${ch.id}" class="card hb-toc-item">
            <div class="hb-toc-num">${ch.num}</div>
            <div class="hb-toc-text">
              <div class="hb-toc-title">${ch.title}</div>
              <div class="muted">${ch.summary}</div>
            </div>
            ${icon('chevronRight', 'hb-toc-arrow')}
          </a>`).join('')}
      </div>
    `;
  }

  function renderHandbookChapter(id) {
    const idx = HANDBOOK.findIndex(c => c.id === id);
    const ch = HANDBOOK[idx];
    if (!ch) { view().innerHTML = '<p>Глава не найдена.</p>'; return; }
    const prev = HANDBOOK[idx - 1];
    const next = HANDBOOK[idx + 1];
    view().innerHTML = `
      <div class="breadcrumb"><a href="#/handbook">Методичка</a> / Глава ${ch.num}</div>
      <article class="card hb-chapter">
        <div class="hb-chapter-num">Глава ${ch.num}</div>
        <h2>${ch.title}</h2>
        <div class="hb-content">${ch.content}</div>
      </article>
      <div class="hb-pager">
        ${prev ? `<a href="#/handbook/${prev.id}" class="btn-secondary hb-pager-btn">${icon('chevronLeft')} ${prev.title}</a>` : '<span></span>'}
        ${next ? `<a href="#/handbook/${next.id}" class="btn-primary hb-pager-btn">${next.title} ${icon('chevronRight')}</a>` : ''}
      </div>
    `;
  }

  // ---------- GRAMMAR ----------
  function renderGrammarList() {
    view().innerHTML = `
      <h2>Грамматика</h2>
      <div class="grammar-list">
        ${Object.keys(App.LEVEL_META).map(lvl => {
          const items = GRAMMAR.filter(g => g.level === lvl);
          const meta = App.LEVEL_META[lvl];
          return `<div class="grammar-level-group">
            <h3>${icon(meta.icon)} ${lvl}</h3>
            ${items.length ? items.map(g => `<a href="#/grammar/${g.id}" class="grammar-row">${g.title}</a>`).join('') : '<p class="muted">Темы будут добавлены на ШАГЕ 6.</p>'}
          </div>`;
        }).join('')}
      </div>
    `;
  }

  function renderGrammarDetail(id) {
    const g = GRAMMAR.find(x => x.id === id);
    if (!g) { view().innerHTML = '<p>Тема не найдена.</p>'; return; }
    view().innerHTML = `
      <div class="breadcrumb"><a href="#/grammar">Грамматика</a> / ${g.title}</div>
      ${renderGrammarBlock(g)}
    `;
    attachSpeakButtons(view());
  }

  // ---------- LISTENING ----------
  function renderListening() {
    view().innerHTML = `
      <h2>Аудирование</h2>
      <p class="muted">Выбери диалог и прослушай его в разных темпах.</p>
      ${!Speech.hasGermanVoice() ? `<p class="muted">⚠️ В системе не найден немецкий голос синтеза речи — озвучка может звучать неточно. Установите немецкий языковой пакет / голос в настройках Windows или браузера для лучшего качества.</p>` : ''}
      <div class="dialog-select-list">
        ${DIALOGS.map(d => `<div class="card listening-card">
          <h3>${d.title} <span class="muted">(${d.level})</span></h3>
          <div class="speed-btns">
            <button class="chip" data-speed="0.6" data-dlg="${d.id}">🐢 Медленно</button>
            <button class="chip" data-speed="0.95" data-dlg="${d.id}">🚶 Нормально</button>
            <button class="chip" data-speed="1.3" data-dlg="${d.id}">🐇 Быстро</button>
          </div>
          <div class="listening-lines" id="ll-${d.id}"></div>
          <div class="listening-questions" id="lq-${d.id}"></div>
        </div>`).join('')}
      </div>
    `;
    view().querySelectorAll('[data-speed]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dlg = DIALOGS.find(d => d.id === btn.dataset.dlg);
        const rate = parseFloat(btn.dataset.speed);
        const linesBox = document.getElementById(`ll-${dlg.id}`);
        linesBox.innerHTML = dlg.lines.map((l, i) => `<div class="dialog-line speaker-${l.speaker}" id="ll-${dlg.id}-${i}">${l.de}</div>`).join('');
        Speech.speakDialog(dlg.lines, {
          rate,
          onLineStart: (i) => {
            linesBox.querySelectorAll('.dialog-line').forEach(el => el.classList.remove('speaking'));
            document.getElementById(`ll-${dlg.id}-${i}`) && document.getElementById(`ll-${dlg.id}-${i}`).classList.add('speaking');
          },
          onDone: () => linesBox.querySelectorAll('.dialog-line').forEach(el => el.classList.remove('speaking')),
        });
      });
    });
  }

  // ---------- PHRASEBOOK ----------
  const PHRASEBOOK = [
    { category: 'Аэропорт', icon: '✈️', phrases: [
      { de: 'Wo ist der Check-in-Schalter?', ru: 'Где стойка регистрации?', transcription: 'во ист дер чек-ин-шальтер' },
      { de: 'Ich habe meinen Flug verpasst.', ru: 'Я опоздал на рейс.', transcription: 'их хабе майнен флюг ферпасст' },
      { de: 'Wo ist die Gepäckausgabe?', ru: 'Где выдача багажа?', transcription: 'во ист ди гепэкаусгабе' },
    ]},
    { category: 'Ресторан', icon: '🍽️', phrases: [
      { de: 'Die Speisekarte, bitte.', ru: 'Меню, пожалуйста.', transcription: 'ди шпайзекарте, битте' },
      { de: 'Ich möchte bestellen.', ru: 'Я хочу сделать заказ.', transcription: 'их мёхте бештеллен' },
      { de: 'Die Rechnung, bitte.', ru: 'Счёт, пожалуйста.', transcription: 'ди рехнунг, битте' },
    ]},
    { category: 'Врач', icon: '👨‍⚕️', phrases: [
      { de: 'Ich habe Schmerzen.', ru: 'У меня боль.', transcription: 'их хабе шмерцен' },
      { de: 'Ich brauche einen Termin.', ru: 'Мне нужна запись на приём.', transcription: 'их браухе айнен термин' },
    ]},
    { category: 'Ausländerbehörde', icon: '🏛️', phrases: [
      { de: 'Ich möchte mich anmelden.', ru: 'Я хочу зарегистрироваться (по месту жительства).', transcription: 'их мёхте михь анмельден' },
      { de: 'Wo finde ich das Formular?', ru: 'Где найти этот бланк?', transcription: 'во финде их дас формуляр' },
    ]},
  ];

  function renderPhrasebook() {
    view().innerHTML = `
      <h2>Разговорник</h2>
      <div class="phrasebook-grid">
        ${PHRASEBOOK.map(cat => `
          <div class="card">
            <h3>${cat.icon} ${cat.category}</h3>
            ${cat.phrases.map(p => `
              <div class="phrase-row">
                <div>${p.de} ${speakBtn(p.de)}</div>
                <div class="word-transcription">[${p.transcription}]</div>
                <div class="muted">${p.ru}</div>
              </div>`).join('')}
          </div>`).join('')}
      </div>
    `;
    attachSpeakButtons(view());
  }

  // ---------- TESTS ----------
  function renderTests() {
    view().innerHTML = `
      <h2>Тесты</h2>
      <div class="test-grid">
        ${Object.keys(App.LEVEL_META).map(lvl => {
          const meta = App.LEVEL_META[lvl];
          const words = App.getWordsByLevel(lvl);
          return `<div class="card test-card">
            <h3>${icon(meta.icon)} Финальный тест ${lvl}</h3>
            <p class="muted">Имитация экзамена Goethe: Lesen, Hören, Schreiben.</p>
            <button class="btn-primary" data-start-test="${lvl}" ${words.length < 4 ? 'disabled' : ''}>Начать (20 вопросов)</button>
          </div>`;
        }).join('')}
      </div>
      <div id="test-runner"></div>
    `;
    view().querySelectorAll('[data-start-test]').forEach(btn => {
      btn.addEventListener('click', () => startTest(btn.dataset.startTest));
    });
  }

  function startTest(level) {
    const pool = App.getWordsByLevel(level);
    const words = Exercises.shuffle(pool).slice(0, Math.min(20, pool.length));
    const questions = Exercises.buildMultipleChoice(words, pool);
    let idx = 0, correct = 0;
    const runner = document.getElementById('test-runner');

    function renderQ() {
      if (idx >= questions.length) return renderResult();
      const q = questions[idx];
      runner.innerHTML = `
        <div class="card">
          <div class="muted">Вопрос ${idx + 1} / ${questions.length}</div>
          <h3>${q.word.de} ${speakBtn(q.word.de)}</h3>
          <div class="mc-options">${q.options.map(o => `<button class="option-btn" data-val="${encodeURIComponent(o)}">${o}</button>`).join('')}</div>
        </div>
      `;
      attachSpeakButtons(runner);
      runner.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = decodeURIComponent(btn.dataset.val);
          const ok = val === q.correct;
          if (ok) correct++;
          runner.querySelectorAll('.option-btn').forEach(b => {
            b.disabled = true;
            if (decodeURIComponent(b.dataset.val) === q.correct) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
          });
          idx++;
          setTimeout(renderQ, 800);
        });
      });
    }

    function renderResult() {
      const pct = Math.round((correct / questions.length) * 100);
      const passed = pct >= 60;
      if (passed) {
        Progress.passTest(level);
        Progress.addXP(100);
        if (pct >= 90) Progress.completeLevel(level);
        confetti();
      }
      runner.innerHTML = `
        <div class="card">
          <h3>${passed ? '🎉 Тест пройден!' : 'Тест не пройден'}</h3>
          <p>Результат: ${correct} / ${questions.length} (${pct}%)</p>
          ${passed ? '<p>+100 XP</p>' : '<p class="muted">Нужно набрать минимум 60%. Попробуй ещё раз.</p>'}
        </div>
      `;
      const newly = Progress.checkAchievements();
      newly.forEach(a => toast(`🏆 Достижение: ${a.title}`, 'success'));
      updateTopStats();
    }
    renderQ();
  }

  // ---------- DAILY TRAINING ----------
  function renderDaily() {
    const pool = App.ALL_WORDS;
    if (pool.length < 5) { view().innerHTML = '<p class="muted">Недостаточно слов для тренировки дня.</p>'; return; }
    const words = Exercises.shuffle(pool).slice(0, 5);
    const grammarItems = Exercises.shuffle(GRAMMAR).slice(0, Math.min(1, GRAMMAR.length));
    const dialog = DIALOGS[Math.floor(Math.random() * DIALOGS.length)];

    const steps = [];
    Exercises.buildFlashcards(words).forEach(e => steps.push(e));
    Exercises.buildMultipleChoice(words.slice(0, 3), pool).forEach(e => steps.push(e));
    Exercises.buildListenChoose(words.slice(0, 1), pool).forEach(e => steps.push(e));
    Exercises.buildPronounce(words.slice(0, 1)).forEach(e => steps.push(e));

    let idx = 0, correctCount = 0;
    view().innerHTML = `<h2>${icon('daily')} Тренировка дня</h2><div id="daily-body"></div>`;
    const body = document.getElementById('daily-body');

    function next() {
      idx++;
      if (idx >= steps.length) return showDialogStep();
      renderStep();
    }
    function markResult(ok) { if (ok) correctCount++; updateTopStats(); setTimeout(next, 800); }
    function renderStep() {
      const progressPct = Math.round((idx / (steps.length + 1)) * 100);
      body.innerHTML = `<div class="ex-progress"><div class="progressbar small"><div class="progressbar-fill" style="width:${progressPct}%"></div></div></div><div id="daily-ex"></div>`;
      renderExercise(document.getElementById('daily-ex'), steps[idx], markResult);
    }
    function showDialogStep() {
      body.innerHTML = `<h3>Диалог: ${dialog.title}</h3>${renderDialogHtml(dialog)}<button class="btn-primary" id="daily-finish">Завершить тренировку</button>`;
      attachSpeakButtons(body);
      attachDialogHandlers(body, dialog);
      document.getElementById('daily-finish').addEventListener('click', () => {
        Progress.addXP(40);
        Progress.addMinutes(10);
        confetti();
        body.innerHTML = `<div class="card"><h3>🎉 Тренировка дня завершена!</h3><p>Правильно: ${correctCount} / ${idx}</p><p>+40 XP, +10 минут к дневной цели</p><a href="#/dashboard" class="btn-primary">На главную</a></div>`;
        const newly = Progress.checkAchievements();
        newly.forEach(a => toast(`🏆 Достижение: ${a.title}`, 'success'));
        updateTopStats();
      });
    }
    renderStep();
  }

  // ---------- ACHIEVEMENTS ----------
  function renderAchievements() {
    const s = Progress.getState();
    view().innerHTML = `
      <h2>Достижения (${s.unlockedAchievements.length}/${Progress.ACHIEVEMENTS.length})</h2>
      <div class="achievements-grid">
        ${Progress.ACHIEVEMENTS.map(a => {
          const unlocked = s.unlockedAchievements.includes(a.id);
          return `<div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
            <div class="ach-icon">${unlocked ? a.icon : '🔒'}</div>
            <div class="ach-title">${a.title}</div>
            <div class="muted">${a.desc}</div>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  // ---------- EXAM: Чтение / Письмо / Говорение (формат Goethe/telc B1) ----------
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function renderExam(tab) {
    const activeTab = tab || 'reading';
    view().innerHTML = `
      <h2>${icon('exam')} Экзамен B1-B2</h2>
      <p class="muted">Тренировка по формату Goethe/telc: чтение с вопросами, письмо по заданию, говорение с таймером и записью голоса.</p>
      <div class="tabs">
        <a href="#/exam/reading" class="tab ${activeTab === 'reading' ? 'active' : ''}">${icon('reading')} Чтение</a>
        <a href="#/exam/writing" class="tab ${activeTab === 'writing' ? 'active' : ''}">${icon('writing')} Письмо</a>
        <a href="#/exam/speaking" class="tab ${activeTab === 'speaking' ? 'active' : ''}">${icon('mic')} Говорение</a>
      </div>
      <div id="exam-body"></div>
    `;
    const body = document.getElementById('exam-body');
    if (activeTab === 'writing') renderWritingList(body);
    else if (activeTab === 'speaking') renderSpeakingList(body);
    else renderReadingList(body);
  }

  // --- Чтение ---
  function renderReadingList(container) {
    container.innerHTML = `
      <div class="exam-list">
        ${READING_TEXTS.map(t => `
          <a href="#/exam/reading/${t.id}" class="card exam-item">
            <h3>${t.title} <span class="muted">(${t.level})</span></h3>
            <p class="muted">${t.questions.length} вопросов на понимание текста</p>
          </a>`).join('')}
      </div>
    `;
  }

  function renderReadingDetail(id) {
    const t = READING_TEXTS.find(x => x.id === id);
    if (!t) { view().innerHTML = '<p>Текст не найден.</p>'; return; }
    view().innerHTML = `
      <div class="breadcrumb"><a href="#/exam/reading">Чтение</a> / ${t.title}</div>
      <h2>${t.title} <span class="muted">(${t.level})</span></h2>
      <div class="card">
        <button class="btn-secondary" id="reading-toggle-ru">Показать перевод</button>
        <div class="reading-text" id="reading-text-de">${t.text.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
        <div class="reading-text hidden" id="reading-text-ru">${t.text_ru.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
      </div>
      <div class="card">
        <h3>Вопросы на понимание</h3>
        <div id="reading-questions"></div>
      </div>
    `;
    document.getElementById('reading-toggle-ru').addEventListener('click', (e) => {
      const hidden = document.getElementById('reading-text-ru').classList.toggle('hidden');
      e.target.textContent = hidden ? 'Показать перевод' : 'Скрыть перевод';
    });
    renderReadingQuestions(t);
  }

  function renderReadingQuestions(t) {
    const box = document.getElementById('reading-questions');
    let idx = 0, correct = 0;
    function renderQ() {
      if (idx >= t.questions.length) return renderResult();
      const q = t.questions[idx];
      box.innerHTML = `
        <div class="muted">Вопрос ${idx + 1} / ${t.questions.length}</div>
        <h4>${q.q}</h4>
        <div class="mc-options">${q.options.map((o, i) => `<button class="option-btn" data-i="${i}">${o}</button>`).join('')}</div>
      `;
      box.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.dataset.i, 10);
          if (i === q.correct) correct++;
          box.querySelectorAll('.option-btn').forEach((b, bi) => {
            b.disabled = true;
            if (bi === q.correct) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
          });
          idx++;
          setTimeout(renderQ, 700);
        });
      });
    }
    function renderResult() {
      const pct = Math.round((correct / t.questions.length) * 100);
      const passed = pct >= 60;
      if (passed) { Progress.addXP(30); confetti(); }
      box.innerHTML = `
        <div class="feedback ${passed ? 'ok' : 'bad'}">Результат: ${correct} / ${t.questions.length} (${pct}%)${passed ? ' — отлично!' : ' — перечитайте текст и попробуйте ещё раз.'}</div>
        <button class="btn-secondary" id="reading-retry">Пройти ещё раз</button>
      `;
      document.getElementById('reading-retry').addEventListener('click', () => { idx = 0; correct = 0; renderQ(); });
      updateTopStats();
    }
    renderQ();
  }

  // --- Письмо ---
  const WRITING_TYPE_LABELS = { informell: 'неофициальное письмо', formell: 'официальное письмо', meinung: 'мнение / форум' };

  function renderWritingList(container) {
    container.innerHTML = `
      <div class="exam-list">
        ${WRITING_TASKS.map(t => `
          <a href="#/exam/writing/${t.id}" class="card exam-item">
            <h3>${t.title} <span class="muted">(${t.level} · ${WRITING_TYPE_LABELS[t.type] || t.type})</span></h3>
            <p class="muted">Минимум ${t.minWords} слов</p>
          </a>`).join('')}
      </div>
    `;
  }

  function renderWritingDetail(id) {
    const t = WRITING_TASKS.find(x => x.id === id);
    if (!t) { view().innerHTML = '<p>Задание не найдено.</p>'; return; }
    const draftKey = 'write-draft-' + t.id;
    const savedDraft = localStorage.getItem(draftKey) || '';
    view().innerHTML = `
      <div class="breadcrumb"><a href="#/exam/writing">Письмо</a> / ${t.title}</div>
      <h2>${t.title} <span class="muted">(${WRITING_TYPE_LABELS[t.type] || t.type})</span></h2>
      <div class="card">
        <p>${t.prompt}</p>
        <h4>Обязательно укажите:</h4>
        <ul class="task-points">${t.points.map(p => `<li>${p}</li>`).join('')}</ul>
        <p class="muted">Минимум ${t.minWords} слов.</p>
      </div>
      <div class="card">
        <h3>Полезные фразы</h3>
        <div class="phrase-list">
          ${t.usefulPhrases.map(p => `<div class="phrase-row"><div>${p.de}</div><div class="muted">${p.ru}</div></div>`).join('')}
        </div>
      </div>
      <div class="card">
        <h3>Ваш текст</h3>
        <textarea id="writing-textarea" class="text-input writing-textarea" rows="10" placeholder="Schreiben Sie hier Ihren Text...">${savedDraft}</textarea>
        <div class="muted" id="writing-wordcount"></div>
        <div class="writing-actions">
          <button class="btn-primary" id="writing-done">Я закончил(а)</button>
          <button class="btn-secondary" id="writing-clear">Очистить</button>
          <button class="btn-secondary" id="writing-model-toggle">Показать пример ответа</button>
        </div>
        <div class="reading-text hidden" id="writing-model">${t.modelAnswer.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
      </div>
    `;
    const textarea = document.getElementById('writing-textarea');
    const countEl = document.getElementById('writing-wordcount');
    function wordCount() { return textarea.value.trim().split(/\s+/).filter(Boolean).length; }
    function updateCount() {
      const words = wordCount();
      countEl.textContent = `Слов: ${words} / ${t.minWords}`;
      localStorage.setItem(draftKey, textarea.value);
    }
    textarea.addEventListener('input', updateCount);
    updateCount();
    document.getElementById('writing-clear').addEventListener('click', () => { textarea.value = ''; updateCount(); textarea.focus(); });
    document.getElementById('writing-model-toggle').addEventListener('click', (e) => {
      const hidden = document.getElementById('writing-model').classList.toggle('hidden');
      e.target.textContent = hidden ? 'Показать пример ответа' : 'Скрыть пример ответа';
    });
    document.getElementById('writing-done').addEventListener('click', () => {
      const words = wordCount();
      if (words < t.minWords) { toast(`Нужно минимум ${t.minWords} слов (сейчас ${words})`, 'error'); return; }
      Progress.addXP(30);
      toast('Отлично! +30 XP. Сравните свой текст с примером ответа.', 'success');
      updateTopStats();
    });
  }

  // --- Говорение ---
  function renderSpeakingList(container) {
    const parts = [1, 2, 3];
    container.innerHTML = `
      <div class="exam-list">
        ${parts.map(p => {
          const items = SPEAKING_TASKS.filter(x => x.part === p);
          if (!items.length) return '';
          return `<div class="speaking-part-group">
            <h3>${items[0].partTitle}</h3>
            ${items.map(t => `<a href="#/exam/speaking/${t.id}" class="card exam-item"><h3>${t.title}</h3></a>`).join('')}
          </div>`;
        }).join('')}
      </div>
    `;
  }

  function renderSpeakingDetail(id) {
    const t = SPEAKING_TASKS.find(x => x.id === id);
    if (!t) { view().innerHTML = '<p>Задание не найдено.</p>'; return; }
    view().innerHTML = `
      <div class="breadcrumb"><a href="#/exam/speaking">Говорение</a> / ${t.title}</div>
      <div class="muted">${t.partTitle}</div>
      <h2>${t.title}</h2>
      <div class="card"><p>${t.prompt}</p></div>
      <div class="card">
        <h3>Что нужно сказать</h3>
        <ul class="task-points">${t.checklist.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <h3>Полезные фразы</h3>
        <div class="phrase-list">
          ${t.usefulPhrases.map(p => `<div class="phrase-row"><div>${p.de}</div><div class="muted">${p.ru}</div></div>`).join('')}
        </div>
      </div>
      <div class="card speaking-timer-card">
        <h3>Таймер</h3>
        <div class="timer-display" id="speaking-timer-display">${formatTime(t.prepSeconds)}</div>
        <div class="muted" id="speaking-timer-label">Подготовка (${t.prepSeconds} сек), затем говорение (${t.speakSeconds} сек)</div>
        <div class="speaking-timer-actions">
          <button class="btn-primary" id="speaking-start">${icon('play')} Начать</button>
          <button class="btn-secondary hidden" id="speaking-stop">${icon('stop')} Сброс</button>
        </div>
        <div id="speaking-record-area"></div>
      </div>
    `;

    let phase = 'idle';
    let remaining = t.prepSeconds;
    let timerId = null;
    const display = document.getElementById('speaking-timer-display');
    const label = document.getElementById('speaking-timer-label');
    const startBtn = document.getElementById('speaking-start');
    const stopBtn = document.getElementById('speaking-stop');

    function resetTimer() {
      clearInterval(timerId);
      timerId = null;
      phase = 'idle';
      remaining = t.prepSeconds;
      display.textContent = formatTime(remaining);
      label.textContent = `Подготовка (${t.prepSeconds} сек), затем говорение (${t.speakSeconds} сек)`;
      startBtn.innerHTML = `${icon('play')} Начать`;
      startBtn.classList.remove('hidden');
      stopBtn.classList.add('hidden');
    }

    function tick() {
      remaining--;
      display.textContent = formatTime(Math.max(0, remaining));
      if (remaining <= 0) {
        if (phase === 'prep') {
          phase = 'speak';
          remaining = t.speakSeconds;
          label.textContent = 'Говорите!';
          display.textContent = formatTime(remaining);
          toast('Начинайте говорить!', 'info');
        } else if (phase === 'speak') {
          clearInterval(timerId);
          timerId = null;
          phase = 'done';
          label.textContent = 'Время вышло';
          startBtn.innerHTML = `${icon('play')} Начать заново`;
          startBtn.classList.remove('hidden');
          Progress.addXP(20);
          toast('Готово! +20 XP за практику говорения.', 'success');
          updateTopStats();
        }
      }
    }

    startBtn.addEventListener('click', () => {
      if (timerId) return;
      phase = 'prep';
      remaining = t.prepSeconds;
      label.textContent = 'Подготовка';
      display.textContent = formatTime(remaining);
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
      timerId = setInterval(tick, 1000);
    });
    stopBtn.addEventListener('click', resetTimer);

    setupRecording(document.getElementById('speaking-record-area'));
  }

  function setupRecording(container) {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      container.innerHTML = '<p class="muted">Запись голоса не поддерживается в этом браузере.</p>';
      return;
    }
    container.innerHTML = `
      <div class="recording-box">
        <button class="btn-secondary" id="rec-start">${icon('mic')} Записать свой ответ</button>
        <button class="btn-secondary hidden" id="rec-stop">${icon('stop')} Остановить запись</button>
        <div id="rec-playback"></div>
      </div>
    `;
    let mediaRecorder = null, chunks = [], stream = null;
    const recStart = document.getElementById('rec-start');
    const recStop = document.getElementById('rec-stop');
    recStart.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        toast('Не удалось получить доступ к микрофону', 'error');
        return;
      }
      chunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        document.getElementById('rec-playback').innerHTML = `<audio controls src="${url}"></audio>`;
        stream.getTracks().forEach(tr => tr.stop());
      };
      mediaRecorder.start();
      recStart.classList.add('hidden');
      recStop.classList.remove('hidden');
    });
    recStop.addEventListener('click', () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      recStart.classList.remove('hidden');
      recStop.classList.add('hidden');
    });
  }

  return {
    renderShell, setActiveNav, renderDashboard, renderLevelSelect, renderTopicList,
    renderLessonList, renderLessonDetail, renderDictionary, renderGrammarList,
    renderGrammarDetail, renderListening, renderPhrasebook, renderTests, renderDaily,
    renderAchievements, toast, confetti,
    renderExam, renderReadingDetail, renderWritingDetail, renderSpeakingDetail,
    renderMyCards, renderHandbook, renderHandbookChapter,
  };
})();
