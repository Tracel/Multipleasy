// Learn screen — consult the multiplication table
function LearnScreen({ table, onBack, onPractice }) {
  const [highlight, setHighlight] = React.useState(null);
  const color = colorForTable(table);

  function playRow(i) {
    setHighlight(i);
    // Try speech synthesis for friendly read-aloud
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        const u = new SpeechSynthesisUtterance(`${table} fois ${i}, égal ${table * i}`);
        u.lang = 'fr-FR';
        u.rate = 1;
        u.pitch = 1.1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch (e) { /* ignore */ }
    }
    setTimeout(() => setHighlight(null), 1200);
  }

  function readAll() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utters = [];
    for (let i = 1; i <= 10; i++) {
      const u = new SpeechSynthesisUtterance(`${table} fois ${i}, égal ${table * i}`);
      u.lang = 'fr-FR';
      u.rate = 1;
      u.pitch = 1.05;
      u.onstart = () => setHighlight(i);
      utters.push(u);
    }
    utters[utters.length - 1].onend = () => setHighlight(null);
    utters.forEach(u => window.speechSynthesis.speak(u));
  }

  return (
    <div className="container">
      <div style={{ paddingTop: 4 }}>
        <button className="back-link" onClick={onBack}>
          <Icons.Back size={18} /> Retour
        </button>
      </div>

      <div className="table-header">
        <div className="big-badge" style={{ background: color }}>{table}</div>
        <div style={{ flex: 1 }}>
          <h1 className="table-title">Table de {table}</h1>
          <div className="table-sub">Touche un calcul pour l'entendre</div>
        </div>
        <button className="btn btn-sun" onClick={readAll}>
          ▶ Tout lire
        </button>
      </div>

      <div className="learn-grid">
        {Array.from({ length: 10 }).map((_, idx) => {
          const i = idx + 1;
          return (
            <button
              key={i}
              className={`learn-row ${highlight === i ? 'highlight' : ''}`}
              onClick={() => playRow(i)}
              aria-label={`${table} fois ${i} égal ${table * i}`}
            >
              <span className="eq">{table} × {i} =</span>
              <span className="res">{table * i}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-lg" onClick={() => onPractice('qcm')}>
          <Icons.Target size={18} /> Je m'entraîne
        </button>
      </div>
    </div>
  );
}

window.LearnScreen = LearnScreen;
