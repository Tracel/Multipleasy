// Progress dashboard
function ProgressScreen({ state, onPickTable }) {
  const totals = state.stats.totalCorrect || 0;
  const sessions = state.stats.sessions || 0;
  const speedrun = state.stats.speedrunBest || 0;
  const streak = state.stats.streak || 0;

  const masterCounts = MultiplStore.TABLES.map(t => MultiplStore.masteryFor(state.tables[t]).stars);
  const gold = masterCounts.filter(s => s >= 3).length;

  return (
    <div className="container">
      <div className="section-title" style={{ marginTop: 6 }}>Ta progression</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="k accent">{totals}</div>
          <div className="v">Bonnes réponses</div>
        </div>
        <div className="stat-card">
          <div className="k">{sessions}</div>
          <div className="v">Sessions</div>
        </div>
        <div className="stat-card">
          <div className="k">{streak}<span style={{ fontSize: 18, color: 'var(--muted)' }}>j</span></div>
          <div className="v">Série en cours</div>
        </div>
        <div className="stat-card">
          <div className="k">{speedrun}</div>
          <div className="v">Record Speed Run</div>
        </div>
      </div>

      <div className="section-title">Maîtrise par table</div>
      <div className="section-sub">{gold} sur {MultiplStore.TABLES.length} tables à 3 étoiles</div>
      <div className="table-progress">
        {MultiplStore.TABLES.map(t => {
          const m = MultiplStore.masteryFor(state.tables[t]);
          const color = colorForTable(t);
          return (
            <button
              key={t}
              className="tp-row"
              onClick={() => onPickTable(t)}
              style={{ width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <span className="num" style={{ background: color }}>{t}</span>
              <span className="bar"><div style={{ width: `${Math.round(m.ratio * 100)}%` }} /></span>
              <Stars count={m.stars} total={3} size={14} />
              <span className="pct">{Math.round(m.ratio * 100)}%</span>
            </button>
          );
        })}
      </div>

      <div className="section-title">Badges</div>
      <div className="section-sub">{Object.keys(state.badges).length} sur {MultiplStore.BADGES.length} débloqués</div>
      <div className="badges-grid">
        {MultiplStore.BADGES.map(b => {
          const got = !!state.badges[b.id];
          return (
            <div key={b.id} className={`badge-card ${got ? '' : 'locked'}`}>
              <div className="glyph" style={{ background: b.color, fontSize: 26, fontFamily: 'Fredoka' }}>
                {b.emoji}
              </div>
              <div className="name">{b.name}</div>
              <div className="desc">{b.desc}</div>
            </div>
          );
        })}
      </div>

      {state.history && state.history.length > 0 && (
        <>
          <div className="section-title">Dernières sessions</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {state.history.slice(0, 6).map((h, i) => {
              const dt = new Date(h.date);
              const lbl = h.mode === 'speedrun' ? 'Speed Run' : `Table de ${h.table}`;
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  background: 'var(--paper)', border: '2px solid var(--line)',
                  borderRadius: 'var(--r-md)', padding: '10px 14px',
                  fontFamily: 'Fredoka', fontWeight: 500, fontSize: 15,
                }}>
                  <span>{lbl}</span>
                  <span style={{ color: 'var(--ink-soft)' }}>
                    {h.score}/{h.total} · {dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ marginTop: 36, textAlign: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => {
          if (confirm('Effacer toute la progression ? Cette action est irréversible.')) {
            MultiplStore.reset();
            location.reload();
          }
        }}>
          Réinitialiser la progression
        </button>
      </div>
    </div>
  );
}

window.ProgressScreen = ProgressScreen;
