// Table detail screen — picks a mode for a given table
function TableScreen({ table, state, onBack, onMode }) {
  const entry = state.tables[table];
  const mastery = MultiplStore.masteryFor(entry);
  const color = colorForTable(table);

  const modes = [
    {
      id: 'learn',
      title: 'Découvrir la table',
      desc: 'Lis et écoute toute la table à ton rythme.',
      icon: <Icons.Book />,
      bg: '#5BA3D0',
      corner: 'sans pression',
    },
    {
      id: 'qcm',
      title: 'Quiz à choix',
      desc: '10 questions, 4 réponses au choix.',
      icon: <Icons.Target />,
      bg: '#2A9D8F',
      corner: 'facile',
    },
    {
      id: 'type',
      title: 'Tape la réponse',
      desc: '10 calculs, tu écris le résultat.',
      icon: <Icons.Edit />,
      bg: '#F4A261',
      corner: 'moyen',
    },
    {
      id: 'fill',
      title: 'Trouve le chiffre manquant',
      desc: 'Du genre 3 × ? = 12. Ça muscle !',
      icon: <Icons.Puzzle />,
      bg: '#9C89B8',
      corner: 'défi',
    },
  ];

  return (
    <div className="container">
      <div style={{ paddingTop: 4 }}>
        <button className="back-link" onClick={onBack}>
          <Icons.Back size={18} /> Carte
        </button>
      </div>

      <div className="table-header">
        <div className="big-badge" style={{ background: color }}>{table}</div>
        <div>
          <h1 className="table-title">Table de {table}</h1>
          <div className="table-sub">
            <Stars count={mastery.stars} total={3} size={16} />
            <span style={{ marginLeft: 8 }}>
              {entry.total === 0 ? 'Pas encore essayée' :
                `${entry.correct}/${entry.total} bonnes (${Math.round(mastery.accuracy * 100)}%)`}
            </span>
          </div>
        </div>
      </div>

      <div className="section-sub">Choisis comment tu veux travailler</div>
      <div className="mode-grid">
        {modes.map(m => (
          <button
            key={m.id}
            className="mode-card"
            onClick={() => onMode(m.id)}
            aria-label={m.title}
          >
            <span className="corner">{m.corner}</span>
            <div className="icon" style={{ background: m.bg }}>{m.icon}</div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

window.TableScreen = TableScreen;
