// spaced-repetition.js — алгоритм SM-2 для интервального повторения
const SpacedRepetition = (() => {
  function initCard() {
    return { ef: 2.5, interval: 0, reps: 0, due: Date.now(), status: 'new' };
  }

  // quality: 0-5 (0-2 = не помню/плохо, 3 = сложно вспомнил, 4 = хорошо, 5 = легко)
  function review(card, quality) {
    card = Object.assign({}, card);
    if (quality < 3) {
      card.reps = 0;
      card.interval = 1;
      card.status = 'learning';
    } else {
      card.ef = Math.max(1.3, card.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
      card.reps += 1;
      if (card.reps === 1) card.interval = 1;
      else if (card.reps === 2) card.interval = 6;
      else card.interval = Math.round(card.interval * card.ef);
      card.status = card.interval >= 21 ? 'learned' : 'learning';
    }
    card.due = Date.now() + card.interval * 86400000;
    card.lastReview = Date.now();
    return card;
  }

  function isDue(card) {
    return !card || card.due <= Date.now();
  }

  return { initCard, review, isDue };
})();
