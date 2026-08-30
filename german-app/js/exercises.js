// exercises.js — генераторы и проверка упражнений
const Exercises = (() => {
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickDistractors(pool, correct, count, keyFn) {
    const others = pool.filter(w => keyFn(w) !== keyFn(correct));
    return shuffle(others).slice(0, count);
  }

  function nounOnly(words) { return words.filter(w => w.partOfSpeech === 'noun' && w.gender); }

  // 1. Flashcard queue (просто список слов для показа с оценкой)
  function buildFlashcards(words) {
    return words.map(w => ({ type: 'flashcard', word: w }));
  }

  // 2. Выбор перевода DE -> RU (4 варианта)
  function buildMultipleChoice(words, allWordsPool) {
    return words.map(w => {
      const distractors = pickDistractors(allWordsPool, w, 3, x => x.id);
      const options = shuffle([w, ...distractors]).map(o => o.ru);
      return { type: 'multiple_choice', word: w, options, correct: w.ru };
    });
  }

  // 3. Впечатай слово RU -> DE
  function buildTypeWord(words) {
    return words.map(w => ({ type: 'type_word', word: w, correct: w.de.replace(/^(der|die|das)\s/, '') }));
  }

  // 4. Собери предложение из example_de
  function buildSentenceBuild(words) {
    return words.filter(w => w.example_de).map(w => {
      const tokens = w.example_de.replace(/[.!?]$/, '').split(' ');
      return { type: 'sentence_build', word: w, tokens: shuffle(tokens), correctOrder: tokens, punctuation: w.example_de.match(/[.!?]$/)?.[0] || '.' };
    });
  }

  // 5. Заполни пропуск в примере
  function buildFillBlank(words) {
    return words.filter(w => w.example_de).map(w => {
      const plain = w.de.replace(/^(der|die|das)\s/, '');
      const re = new RegExp(plain, 'i');
      const blanked = w.example_de.replace(re, '____');
      return { type: 'fill_blank', word: w, sentence: blanked, correct: plain };
    });
  }

  // 6. Аудио -> выбери перевод
  function buildListenChoose(words, allWordsPool) {
    return words.map(w => {
      const distractors = pickDistractors(allWordsPool, w, 3, x => x.id);
      const options = shuffle([w, ...distractors]).map(o => o.ru);
      return { type: 'listen_choose', word: w, options, correct: w.ru };
    });
  }

  // 7. Произнеси (STT)
  function buildPronounce(words) {
    return words.map(w => ({ type: 'pronounce', word: w, target: w.de.replace(/^(der|die|das)\s/, '') }));
  }

  // 8. Соедини пары DE-RU
  function buildMatchPairs(words) {
    const set = words.slice(0, Math.min(6, words.length));
    return [{ type: 'match_pairs', pairs: set.map(w => ({ de: w.de, ru: w.ru, id: w.id })) }];
  }

  // 9. Артикль-тренажёр
  function buildArticleTrainer(words) {
    const nouns = nounOnly(words);
    return nouns.map(w => ({ type: 'article_trainer', word: w, correct: w.gender, options: ['der', 'die', 'das'] }));
  }

  // 10. Диктант
  function buildDictation(words) {
    return words.filter(w => w.example_de).map(w => ({ type: 'dictation', word: w, correct: w.example_de }));
  }

  function buildAllExercises(words, allWordsPool) {
    const ex = {
      flashcard: buildFlashcards(words),
      multiple_choice: buildMultipleChoice(words, allWordsPool),
      type_word: buildTypeWord(words),
      sentence_build: buildSentenceBuild(words),
      fill_blank: buildFillBlank(words),
      listen_choose: buildListenChoose(words, allWordsPool),
      pronounce: buildPronounce(words),
      match_pairs: buildMatchPairs(words),
      article_trainer: buildArticleTrainer(words),
      dictation: buildDictation(words),
    };
    return ex;
  }

  function normalizeForCompare(s) {
    return s.toLowerCase().trim().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ');
  }

  function checkTextAnswer(given, correct) {
    return normalizeForCompare(given) === normalizeForCompare(correct);
  }

  return {
    buildAllExercises, checkTextAnswer, normalizeForCompare, shuffle,
    buildFlashcards, buildMultipleChoice, buildTypeWord, buildSentenceBuild,
    buildFillBlank, buildListenChoose, buildPronounce, buildMatchPairs,
    buildArticleTrainer, buildDictation,
  };
})();
