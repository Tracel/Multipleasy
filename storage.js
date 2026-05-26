// Multipl'easy — persistance localStorage
(function (global) {
  const KEY = 'multipleasy.v1';

  const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  function defaultState() {
    const tables = {};
    TABLES.forEach((t) => {
      tables[t] = {
        correct: 0,
        total: 0,
        bestStreak: 0,
        // per question (1..10) ms last response, attempts
        questions: {},
      };
    });
    return {
      profile: null, // { name, color }
      tables,
      badges: {}, // id -> {earnedAt}
      stats: {
        sessions: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        speedrunBest: 0,
        lastVisit: null,
        streak: 0,
        firstVisit: null,
      },
      history: [], // last 30 sessions { mode, table, score, total, date }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      // merge in case fields added later
      const def = defaultState();
      const merged = { ...def, ...parsed };
      merged.tables = { ...def.tables, ...(parsed.tables || {}) };
      merged.stats = { ...def.stats, ...(parsed.stats || {}) };
      return merged;
    } catch (e) {
      console.warn('multipleasy: storage parse failed', e);
      return defaultState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('multipleasy: storage save failed', e);
    }
  }

  function reset() {
    localStorage.removeItem(KEY);
  }

  // -------- Mastery model --------
  // For each table, mastery = 0..1 derived from correct count & accuracy.
  // Stars: 0 (< 30% mastery), 1, 2, 3.
  function masteryFor(tableEntry) {
    const { correct, total } = tableEntry;
    if (total === 0) return { ratio: 0, stars: 0, accuracy: 0 };
    const accuracy = correct / total;
    // Need both volume (correct) and accuracy.
    // Saturate at 30 correct answers for 100% volume score.
    const volume = Math.min(1, correct / 30);
    const ratio = Math.min(1, volume * 0.6 + accuracy * 0.4);
    let stars = 0;
    if (correct >= 5 && accuracy >= 0.6) stars = 1;
    if (correct >= 15 && accuracy >= 0.75) stars = 2;
    if (correct >= 30 && accuracy >= 0.9) stars = 3;
    return { ratio, stars, accuracy };
  }

  // -------- Streak --------
  function touchStreak(state) {
    const today = new Date();
    const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
    const todayKey = `${y}-${m}-${d}`;
    if (!state.stats.firstVisit) state.stats.firstVisit = todayKey;
    if (state.stats.lastVisit === todayKey) return;
    if (state.stats.lastVisit) {
      const [py, pm, pd] = state.stats.lastVisit.split('-').map(Number);
      const prev = new Date(py, pm, pd);
      const diff = Math.round((new Date(y, m, d) - prev) / (24 * 3600 * 1000));
      if (diff === 1) state.stats.streak += 1;
      else if (diff > 1) state.stats.streak = 1;
    } else {
      state.stats.streak = 1;
    }
    state.stats.lastVisit = todayKey;
  }

  // -------- Badges --------
  const BADGES = [
    { id: 'first-step', name: 'Premier pas', desc: 'Première session terminée', color: '#5BA3D0', emoji: '★' },
    { id: 'sharpshooter', name: 'Œil de lynx', desc: '10 bonnes réponses d\'affilée', color: '#EF476F', emoji: '◎' },
    { id: 'streak-3', name: 'Étincelle', desc: '3 jours d\'affilée', color: '#FFD166', emoji: '✦' },
    { id: 'streak-7', name: 'Flamme', desc: '7 jours d\'affilée', color: '#F4A261', emoji: '♥' },
    { id: 'speed-15', name: 'Éclair', desc: 'Speed Run : 15 bonnes', color: '#2A9D8F', emoji: '⚡' },
    { id: 'speed-25', name: 'Foudre', desc: 'Speed Run : 25 bonnes', color: '#06D6A0', emoji: '⚡' },
    { id: 'explorer', name: 'Explorateur', desc: 'Toutes les tables touchées', color: '#5BA3D0', emoji: '◆' },
    { id: 'hundred', name: 'Centurion', desc: '100 bonnes réponses au total', color: '#264653', emoji: '◉' },
    { id: 'bronze-master', name: 'Bronze', desc: '3 tables maîtrisées (1★+)', color: '#cd7f32', emoji: '▲' },
    { id: 'silver-master', name: 'Argent', desc: '5 tables à 2★+', color: '#a8a8b3', emoji: '▲' },
    { id: 'gold-master', name: 'Or', desc: 'Toutes les tables à 3★', color: '#FFD166', emoji: '★' },
  ];

  function checkBadges(state, ctx = {}) {
    const earned = [];
    function earn(id) {
      if (!state.badges[id]) {
        state.badges[id] = { earnedAt: Date.now() };
        earned.push(BADGES.find(b => b.id === id));
      }
    }
    if (state.stats.sessions >= 1) earn('first-step');
    if (ctx.bestStreakThisSession >= 10) earn('sharpshooter');
    if (state.stats.streak >= 3) earn('streak-3');
    if (state.stats.streak >= 7) earn('streak-7');
    if (state.stats.speedrunBest >= 15) earn('speed-15');
    if (state.stats.speedrunBest >= 25) earn('speed-25');
    // Explorer: every table touched
    const touched = TABLES.every(t => state.tables[t].total > 0);
    if (touched) earn('explorer');
    if (state.stats.totalCorrect >= 100) earn('hundred');
    const masterCounts = TABLES.map(t => masteryFor(state.tables[t]).stars);
    const at1 = masterCounts.filter(s => s >= 1).length;
    const at2 = masterCounts.filter(s => s >= 2).length;
    const at3 = masterCounts.filter(s => s >= 3).length;
    if (at1 >= 3) earn('bronze-master');
    if (at2 >= 5) earn('silver-master');
    if (at3 >= TABLES.length) earn('gold-master');
    return earned;
  }

  // -------- Recommendation --------
  // Returns the table number that needs the most work.
  function recommendTable(state) {
    let worst = null;
    let worstScore = Infinity;
    TABLES.forEach(t => {
      const m = masteryFor(state.tables[t]);
      // prioritise low mastery; tiebreak by accuracy
      const score = m.ratio * 100 + (state.tables[t].total === 0 ? -10 : 0);
      if (score < worstScore) {
        worstScore = score;
        worst = t;
      }
    });
    return worst || 2;
  }

  global.MultiplStore = {
    KEY,
    TABLES,
    BADGES,
    load,
    save,
    reset,
    defaultState,
    masteryFor,
    touchStreak,
    checkBadges,
    recommendTable,
  };
})(window);
