// Speed Run: 60 seconds, max correct answers across all tables.
function SpeedRunScreen({ state, onUpdate, onFinish, onBack }) {
  const tweaks = React.useContext(TweaksContext);
  const universe = MultiplTweaks.UNIVERSES[tweaks.universe] || MultiplTweaks.UNIVERSES.montagne;
  const energy = MultiplTweaks.ENERGY[tweaks.energy] || MultiplTweaks.ENERGY.petillant;
  const DURATION = 60;
  const [phase, setPhase] = React.useState('intro'); // intro | run | done
  const [timeLeft, setTimeLeft] = React.useState(DURATION);
  const [score, setScore] = React.useState(0);
  const [attempts, setAttempts] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [question, setQuestion] = React.useState(null);
  const [choices, setChoices] = React.useState([]);
  const [answered, setAnswered] = React.useState(null);
  const [confettiId, setConfettiId] = React.useState(0);

  function newQuestion() {
    const t = MultiplStore.TABLES[Math.floor(Math.random() * MultiplStore.TABLES.length)];
    const b = 1 + Math.floor(Math.random() * 10);
    const q = { a: t, b, answer: t * b };
    setQuestion(q);
    setChoices(genChoices(q.answer));
    setAnswered(null);
  }

  function start() {
    setPhase('run');
    setTimeLeft(DURATION);
    setScore(0);
    setAttempts(0);
    setStreak(0);
    setBestStreak(0);
    newQuestion();
  }

  React.useEffect(() => {
    if (phase !== 'run') return;
    if (timeLeft <= 0) {
      setPhase('done');
      // commit to state
      const next = { ...state };
      next.stats = { ...next.stats };
      next.stats.sessions += 1;
      next.stats.totalQuestions += attempts;
      next.stats.totalCorrect += score;
      next.stats.speedrunBest = Math.max(next.stats.speedrunBest || 0, score);
      next.history = [{ mode: 'speedrun', score, total: attempts, date: Date.now() }, ...(next.history || [])].slice(0, 30);
      const earned = MultiplStore.checkBadges(next, { bestStreakThisSession: bestStreak });
      onUpdate(next);
      onFinish({ score, total: attempts, bestStreak, durationMs: DURATION * 1000, earned, mode: 'speedrun' });
      return;
    }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  function answer(val) {
    if (phase !== 'run' || answered) return;
    const ok = val === question.answer;
    setAnswered(ok ? 'good' : 'bad');
    setAttempts(a => a + 1);
    if (ok) {
      setScore(s => s + 1);
      setStreak(s => {
        const ns = s + 1;
        setBestStreak(bs => Math.max(bs, ns));
        return ns;
      });
      setConfettiId(c => c + 1);
      // also update mastery for this table
      const next = { ...state };
      const tEntry = { ...next.tables[question.a] };
      tEntry.correct = (tEntry.correct || 0) + 1;
      tEntry.total = (tEntry.total || 0) + 1;
      next.tables = { ...next.tables, [question.a]: tEntry };
      onUpdate(next);
    } else {
      setStreak(0);
      const next = { ...state };
      const tEntry = { ...next.tables[question.a] };
      tEntry.total = (tEntry.total || 0) + 1;
      next.tables = { ...next.tables, [question.a]: tEntry };
      onUpdate(next);
    }
    setTimeout(() => newQuestion(), 350);
  }

  if (phase === 'intro') {
    return (
      <div className="container">
        <div className="results" style={{ paddingTop: 24 }}>
          <Mascot mood="cheer" size={120} color="#FFD166" />
          <h1>Speed Run · 60s</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 17, fontWeight: 600, maxWidth: 360, margin: '0 auto 18px' }}>
            {universe.speedrunIntro}
          </p>
          <div className="actions">
            <button className="btn btn-warm btn-lg" onClick={start}><Icons.Bolt size={18} /> Démarrer</button>
            <button className="btn btn-lg" onClick={onBack}>Annuler</button>
          </div>
          {state.stats.speedrunBest > 0 && (
            <div style={{ marginTop: 22, fontWeight: 700, color: 'var(--ink-soft)' }}>
              Ton record : <span style={{ color: 'var(--coral)' }}>{state.stats.speedrunBest}</span> bonnes
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'run' && question) {
    return (
      <div className="container">
        <div className="quiz-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <button className="back-link" onClick={onBack}>
              <Icons.Back size={18} /> Quitter
            </button>
            <span className="chip" style={{ background: 'var(--coral)', color: '#fff', borderColor: 'var(--coral-deep)' }}>
              <Icons.Bolt size={14} /> Speed Run
            </span>
          </div>
          <div className="quiz-top">
            <div style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 26, color: 'var(--teal-deep)' }}>
              {score}<span style={{ color: 'var(--muted)', fontSize: 18, marginLeft: 4 }}>bonnes</span>
            </div>
            <div className={`quiz-timer ${timeLeft <= 10 ? 'danger' : ''}`}>{timeLeft}s</div>
          </div>

          <div className="question-card pop" key={attempts}>
            <div className="question">
              {question.a} × {question.b} = <span style={{ color: 'var(--coral)' }}>?</span>
            </div>
            <div className="choice-grid">
              {choices.map((c) => {
                let cls = 'choice';
                if (answered && c === question.answer) cls += ' correct';
                else if (answered === 'bad' && c !== question.answer) cls += ' dim';
                return (
                  <button key={c} className={cls} onClick={() => answer(c)} disabled={!!answered}>
                    {c}
                  </button>
                );
              })}
            </div>
            {streak >= 3 && (
              <div className="feedback good" style={{ marginTop: 14 }}>
                <Icons.Flame size={14} /> {streak} d'affilée !
              </div>
            )}
          </div>
        </div>
        <Confetti trigger={confettiId} count={energy.confetti} speed={energy.confettiSpeed} />
      </div>
    );
  }

  return null;
}

window.SpeedRunScreen = SpeedRunScreen;
