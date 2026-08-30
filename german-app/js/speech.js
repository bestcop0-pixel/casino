// speech.js — Web Speech API: озвучка (TTS) и распознавание речи (STT)
const Speech = (() => {
  let voices = [];
  let germanVoices = []; // отсортированы по качеству, лучший — первый
  let voiceA = null; // основной голос (используется по умолчанию и для реплики A)
  let voiceB = null; // альтернативный голос для реплики B в диалогах (если доступен)

  const FEMALE_HINTS = ['katja', 'petra', 'anna', 'vicki', 'marlene', 'hedda', 'helena', 'female', 'frau'];
  const MALE_HINTS = ['stefan', 'conrad', 'markus', 'yannick', 'male', 'mann', 'herr'];

  function scoreVoice(v) {
    let score = 0;
    if (v.lang === 'de-DE') score += 100;
    else if (v.lang && v.lang.toLowerCase().startsWith('de')) score += 70;
    else return -1; // не немецкий голос — не годится вообще
    if (v.localService) score += 25; // офлайн-голоса надёжнее и без задержки сети
    const name = v.name.toLowerCase();
    if (/natural|neural|online|enhanced|premium/.test(name)) score += 15;
    if (/google/.test(name)) score += 10;
    if (v.default) score += 5;
    return score;
  }

  function genderOf(v) {
    const name = v.name.toLowerCase();
    if (FEMALE_HINTS.some(h => name.includes(h))) return 'f';
    if (MALE_HINTS.some(h => name.includes(h))) return 'm';
    return null;
  }

  function loadVoices() {
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    germanVoices = voices
      .map(v => ({ v, score: scoreVoice(v) }))
      .filter(x => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.v);

    voiceA = germanVoices[0] || null;
    voiceB = null;
    if (voiceA) {
      const genderA = genderOf(voiceA);
      // ищем голос противоположного (или хотя бы другого) пола для диалогов
      voiceB = germanVoices.find(v => v !== voiceA && genderOf(v) && genderOf(v) !== genderA)
        || germanVoices.find(v => v !== voiceA)
        || null;
    }
  }

  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function makeUtterance(text, { rate = 0.95, pitch = 1, voice = null } = {}) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'de-DE';
    utter.voice = voice || voiceA || null;
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = 1;
    return utter;
  }

  function speak(text, rate = 0.95) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(makeUtterance(text, { rate }));
  }

  // Озвучивает диалог реплика за репликой — разными голосами/тембром для A и B,
  // с естественной паузой между репликами (вместо чтения "..." буквально).
  function speakDialog(lines, { rate = 0.95, pauseMs = 350, onLineStart, onDone } = {}) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    let i = 0;
    function next() {
      if (i >= lines.length) { onDone && onDone(); return; }
      const line = lines[i];
      const isB = line.speaker === 'B' && voiceB;
      const utter = makeUtterance(line.de, {
        rate,
        pitch: isB ? 0.92 : 1.06,
        voice: isB ? voiceB : voiceA,
      });
      onLineStart && onLineStart(i, line);
      utter.onend = () => { i++; setTimeout(next, pauseMs); };
      utter.onerror = () => { i++; setTimeout(next, pauseMs); };
      window.speechSynthesis.speak(utter);
    }
    next();
  }

  function stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  // Распознавание речи для упражнения "Произнеси"
  function recognize(expectedText, { onResult, onError, lang = 'de-DE' } = {}) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      onError && onError('Speech Recognition не поддерживается в этом браузере');
      return null;
    }
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.onresult = (e) => {
      const said = e.results[0][0].transcript;
      const similarity = compareStrings(normalize(said), normalize(expectedText));
      onResult && onResult({ said, similarity });
    };
    rec.onerror = (e) => onError && onError(e.error);
    rec.start();
    return rec;
  }

  function normalize(s) {
    return s.toLowerCase().replace(/[.,!?;:]/g, '').trim();
  }

  // Простое сравнение по расстоянию Левенштейна -> % схожести
  function compareStrings(a, b) {
    const dist = levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length) || 1;
    return Math.max(0, Math.round((1 - dist / maxLen) * 100));
  }

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  return {
    speak,
    speakDialog,
    stop,
    recognize,
    compareStrings,
    isSTTSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    hasGermanVoice: () => !!voiceA,
  };
})();
