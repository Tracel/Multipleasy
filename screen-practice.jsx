// Practice screen — QCM / Type / Fill modes, 10 questions per session.
const SESSION_LENGTH = 10;

function genQuestion(table, mode, prevQ) {
  // Build a question for `table` and `mode`. Avoid repeating exact prevQ.
  let tries = 0;
  while (tries < 30) {
    const a = table;
    const b = 1 + Math.floor(Math.random() * 10);
    const result = a * b;
    let q;
    if (mode === 'fill') {
      // Either "a × ? = result" or "? × b = result"
      const variant = Math.random() < 0.5 ? 'right' : 'left';
      q = { mode, a, b, result, missing: variant, answer: variant === 'right' ? b : a };
    } else {
      q = { mode, a, b, result, answer: result };
    }
    const sig = JSON.stringify({ a, b, mode, missing: q.missing });
    const prevSig = prevQ ? JSON.stringify({ a: prevQ.a, b: prevQ.b, mode: prevQ.mode, missing: prevQ.missing }) : '';
    if (sig !== prevSig) return q;
    tries++;
  }
  return { mode, a: table, b: 1, result: table, answer: table };
}

function genChoices(answer) {
  const set = new Set([answer]);
  while (set.size < 4) {
    let candidate;
    const r = Math.random();
    if (r < 0.4) candidate = answer + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 3));
    else if (r < 0.7) candidate = answer + (Math.random() < 0.5 ? -1 : 1) * (2 + Math.floor(Math.random() * 5));
    else candidate = Math.floor(Math.random() * 100) + 1;
    if (candidate > 0 && candidate !== answer) set.add(candidate);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

function PracticeScreen({ table, mode, state, onUpdate, onFinish, onBack }) {
  const tweaks = React.useContext(TweaksContext);
  const tone = MultiplTweaks.TONE[tweaks.tone] || MultiplTweaks.TONE.calme;
  const energy = MultiplTweaks.ENERGY[tweaks.energy] || MultiplTweaks.ENERGY.petillant;

  const [idx, setIdx] = React.useState(0);
  const [question, setQuestion] = React.useState(() => genQuestion(table, mode, null));
  const [choices, setChoices] = React.useState(() => mode === 'qcm' ? genChoices(table * 1) : []);
  const [answered, setAnswered] = React.useState(null); // null | 'good' | 'bad'
  const [typedAnswer, setTypedAnswer] = React.useState('');
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [feedback, setFeedback] = React.useState('');
  const [shake, setShake] = React.useState(false);
  const [confettiId, setConfettiId] = React.useState(0);
  const [startTime] = React.useState(Date.now());

  // Refs mirror the latest counters so finishSession reads the final values
  // synchronously after the last commit (state setters are async).
  const scoreRef = React.useRef(0);
  const streakRef = React.useRef(0);
  const bestStreakRef = React.useRef(0);

  // Initialize choices when question regenerated for QCM
  React.useEffect(() => {
    if (mode === 'qcm') setChoices(genChoices(question.answer));
  }, [question, mode]);

  const modeTitles = {
    qcm: 'Quiz à choix',
    type: 'Tape la réponse',
    fill: 'Chiffre manquant',
  };

  const color = colorForTable(table);

  function feedbackText(good) {
    return MultiplTweaks.pickFromList(good ? tone.goods : tone.bads);
  }

  function commit(isCorrect) {
    setAnswered(isCorrect ? 'good' : 'bad');
    setFeedback(feedbackText(isCorrect));
    if (isCorrect) {
      scoreRef.current += 1;
      streakRef.current += 1;
      bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
      setScore(scoreRef.current);
      setStreak(streakRef.current);
      setBestStreak(bestStreakRef.current);
      setConfettiId(c => c + 1);
    } else {
      streakRef.current = 0;
      setStreak(0);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }

    // persist after each question
    const next = { ...state };
    const tEntry = { ...next.tables[table] };
    tEntry.total = (tEntry.total || 0) + 1;
    if (isCorrect) tEntry.correct = (tEntry.correct || 0) + 1;
    const q = question;
    const factor = q.missing ? (q.missing === 'right' ? q.b : q.a) : q.b;
    tEntry.questions = { ...(tEntry.questions || {}) };
    const qK = String(factor);
    tEntry.questions[qK] = {
      attempts: (tEntry.questions[qK]?.attempts || 0) + 1,
      correct: (tEntry.questions[qK]?.correct || 0) + (isCorrect ? 1 : 0),
    };
    next.tables = { ...next.tables, [table]: tEntry };
    next.stats = { ...next.stats };
    next.stats.totalQuestions += 1;
    if (isCorrect) next.stats.totalCorrect += 1;
    onUpdate(next);

    setTimeout(() => goNext(), isCorrect ? energy.feedbackDelay : energy.badDelay);
  }

  function goNext() {
    if (idx + 1 >= SESSION_LENGTH) {
      // session finished
      finishSession();
      return;
    }
    setIdx(idx + 1);
    setQuestion(genQuestion(table, mode, question));
    setAnswered(null);
    setTypedAnswer('');
    setFeedback('');
  }

  function finishSession() {
    const finalScore = scoreRef.current;
    const finalBest = bestStreakRef.current;
    const next = { ...state };
    next.stats = { ...next.stats };
    next.stats.sessions += 1;
    const t = { ...next.tables[table] };
    t.bestStreak = Math.max(t.bestStreak || 0, finalBest);
    next.tables = { ...next.tables, [table]: t };
    next.history = [{ mode, table, score: finalScore, total: SESSION_LENGTH, date: Date.now() }, ...(next.history || [])].slice(0, 30);
    const earned = MultiplStore.checkBadges(next, { bestStreakThisSession: finalBest });
    onUpdate(next);
    onFinish({ score: finalScore, total: SESSION_LENGTH, bestStreak: finalBest, durationMs: Date.now() - startTime, earned, table, mode });
  }

  function answerQCM(val) {
    if (answered) return;
    commit(val === question.answer);
  }

  function submitTyped() {
    if (answered) return;
    if (typedAnswer === '') return;
    commit(parseInt(typedAnswer, 10) === question.answer);
  }

  function pushDigit(d) {
    if (answered) return;
    if (typedAnswer.length >= 3) return;
    setTypedAnswer(typedAnswer + d);
  }
  function delDigit() {
    if (answered) return;
    setTypedAnswer(typedAnswer.slice(0, -1));
  }

  // keyboard listener for type mode
  React.useEffect(() => {
    function onKey(e) {
      if (mode === 'qcm') return;
      if (answered) return;
      if (/^[0-9]$/.test(e.key)) {
        if (typedAnswer.length < 3) setTypedAnswer(typedAnswer + e.key);
      } else if (e.key === 'Backspace') {
        setTypedAnswer(typedAnswer.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (typedAnswer !== '') commit(parseInt(typedAnswer, 10) === question.answer);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [typedAnswer, answered, question, mode]);

  return (
    <div className="container">
      <div className="quiz-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <button className="back-link" onClick={onBack}>
            <Icons.Back size={18} /> Quitter
          </button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="chip">{modeTitles[mode]}</span>
            <span className="chip" style={{ background: color, color: '#fff', borderColor: color }}>Table de {table}</span>
          </div>
        </div>

        <div className="quiz-top">
          <div className="quiz-progress" aria-label="Progression">
            <div style={{ width: `${((idx + (answered ? 1 : 0)) / SESSION_LENGTH) * 100}%` }} />
          </div>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 18, color: 'var(--ink-soft)' }}>
            {idx + 1}/{SESSION_LENGTH}
          </div>
        </div>

        <div className={`question-card pop ${shake ? 'shake' : ''}`} key={idx}>
          <div className="question" style={{ color: 'var(--ink)' }}>
            {renderQuestion(question, mode, typedAnswer, answered)}
          </div>

          {mode === 'qcm' && (
            <div className="choice-grid">
              {choices.map((c) => {
                let cls = 'choice';
                if (answered && c === question.answer) cls += ' correct';
                else if (answered === 'bad' && c !== question.answer) cls += ' dim';
                return (
                  <button key={c} className={cls} onClick={() => answerQCM(c)} disabled={!!answered}>
                    {c}
                  </button>
                );
              })}
            </div>
          )}

          {(mode === 'type' || mode === 'fill') && (
            <Numpad onDigit={pushDigit} onDel={delDigit} onOk={submitTyped} disabled={!!answered} />
          )}

          <div className={`feedback ${answered === 'good' ? 'good' : ''} ${answered === 'bad' ? 'bad' : ''}`}>
            {feedback ? <HTMLText html={feedback} /> :
              (answered === 'bad' ? `La bonne réponse était ${question.answer}.` : '')}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, alignItems: 'center', padding: '0 6px' }}>
          <div style={{ fontFamily: 'Fredoka', color: 'var(--ink-soft)', fontWeight: 600 }}>
            Score : <span style={{ color: 'var(--teal-deep)', fontWeight: 700 }}>{score}</span>
          </div>
          {streak >= 3 && (
            <div className="streak-badge"><Icons.Flame size={14} /> <HTMLText html={tone.streakHint(streak)} /></div>
          )}
        </div>
      </div>
      <Confetti trigger={confettiId} count={energy.confetti} speed={energy.confettiSpeed} />
    </div>
  );
}

function renderQuestion(q, mode, typed, answered) {
  if (mode === 'fill') {
    const miss = q.missing === 'right'
      ? <><span>{q.a}</span> × <span className="miss">{typed || '?'}</span> = <span>{q.result}</span></>
      : <><span className="miss">{typed || '?'}</span> × <span>{q.b}</span> = <span>{q.result}</span></>;
    return miss;
  }
  if (mode === 'type') {
    return (
      <>
        <span>{q.a} × {q.b} = </span>
        <input
          className={`answer-field ${answered === 'good' ? 'correct' : ''} ${answered === 'bad' ? 'wrong' : ''}`}
          type="text"
          inputMode="numeric"
          value={typed}
          readOnly
          aria-label="Ta réponse"
        />
      </>
    );
  }
  // qcm
  return <span>{q.a} × {q.b} = <span style={{ color: 'var(--coral)' }}>?</span></span>;
}

function Numpad({ onDigit, onDel, onOk, disabled }) {
  return (
    <div className="numpad" style={{ maxWidth: 340, margin: '20px auto 0' }}>
      {[1,2,3,4,5,6,7,8,9].map(d => (
        <button key={d} onClick={() => onDigit(String(d))} disabled={disabled}>{d}</button>
      ))}
      <button className="del" onClick={onDel} disabled={disabled} aria-label="Effacer">←</button>
      <button onClick={() => onDigit('0')} disabled={disabled}>0</button>
      <button className="action" onClick={onOk} disabled={disabled} aria-label="Valider">
        <Icons.Check size={20} />
      </button>
    </div>
  );
}

function ResultsScreen({ result, profile, onAgain, onHome }) {
  const tweaks = React.useContext(TweaksContext);
  const tone = MultiplTweaks.TONE[tweaks.tone] || MultiplTweaks.TONE.calme;
  const { score, total, bestStreak, durationMs, earned = [], table, mode } = result;
  const pct = Math.round((score / total) * 100);
  const mood = pct >= 80 ? 'cheer' : pct >= 50 ? 'happy' : 'think';
  const headlineHtml = pct >= 80 ? tone.headlineGood : pct >= 50 ? tone.headlineMid : tone.headlineLow;
  const duration = Math.round(durationMs / 1000);

  return (
    <div className="container">
      <div className="results">
        <div className="bounce">
          <Mascot mood={mood} size={120} color={profile?.color || '#FFD166'} />
        </div>
        <h1><HTMLText html={headlineHtml} /></h1>
        <div className="score">{score}<span style={{ fontSize: 36, color: 'var(--muted)' }}>/{total}</span></div>
        <div className="row">
          <div className="item">
            <span className="k">{pct}%</span>
            <span className="v">Réussite</span>
          </div>
          <div className="item">
            <span className="k">{bestStreak}</span>
            <span className="v">Meilleure série</span>
          </div>
          <div className="item">
            <span className="k">{duration}s</span>
            <span className="v">Durée</span>
          </div>
        </div>

        {earned.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 14, fontSize: 18 }}>Nouveaux badges&nbsp;!</div>
            <div className="new-badges">
              {earned.map(b => (
                <div key={b.id} className="badge-card" style={{ width: 130 }}>
                  <div className="glyph" style={{ background: b.color, fontSize: 28, fontFamily: 'Fredoka' }}>
                    {b.emoji}
                  </div>
                  <div className="name">{b.name}</div>
                  <div className="desc">{b.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="actions">
          <button className="btn btn-primary btn-lg" onClick={onAgain}>Rejouer</button>
          <button className="btn btn-lg" onClick={onHome}>Carte</button>
        </div>
      </div>
    </div>
  );
}

window.PracticeScreen = PracticeScreen;
window.ResultsScreen = ResultsScreen;
