// Home screen — adventure map (universe-aware)
function HomeScreen({ state, onPickTable }) {
  const recommended = MultiplStore.recommendTable(state);
  const profile = state.profile;
  const tweaks = React.useContext(TweaksContext);
  const universe = MultiplTweaks.UNIVERSES[tweaks.universe] || MultiplTweaks.UNIVERSES.montagne;

  // Layout: 9 peaks (tables 2-10) on a zigzag path; small tables on top.
  const layout = [
    { t: 2,  x: 50,  y: 4  },
    { t: 3,  x: 75,  y: 14 },
    { t: 4,  x: 45,  y: 22 },
    { t: 5,  x: 18,  y: 33 },
    { t: 6,  x: 35,  y: 48 },
    { t: 7,  x: 70,  y: 55 },
    { t: 8,  x: 82,  y: 70 },
    { t: 9,  x: 50,  y: 80 },
    { t: 10, x: 18,  y: 90 },
  ];

  const stageH = 880;

  const pathD = React.useMemo(() => {
    let d = '';
    layout.forEach((p, i) => {
      const x = p.x;
      const y = p.y;
      if (i === 0) d += `M ${x} ${y}`;
      else {
        const prev = layout[i - 1];
        const cx = (prev.x + x) / 2;
        const cy = (prev.y + y) / 2 + (i % 2 ? -4 : 4);
        d += ` Q ${cx} ${cy} ${x} ${y}`;
      }
    });
    return d;
  }, []);

  const greeting = React.useMemo(() => {
    const name = profile?.name || 'Champion';
    const visited = MultiplStore.TABLES.some(t => state.tables[t].total > 0);
    if (!visited) return universe.greetingNew(name);
    return universe.greetingReturn(name, recommended);
  }, [profile, recommended, state, universe]);

  return (
    <div className="container">
      <div className="map-wrap">
        <div className="map-greeting">
          <Mascot mood="happy" size={70} color={profile?.color || universe.mascotColor} />
          <div className="bubble">{greeting}</div>
        </div>

        <div style={{ position: 'relative', height: stageH }} aria-label="Carte d'aventure">
          {/* Backdrop varies by universe */}
          <MapBackdrop universe={universe.id} />

          {/* Dashed path */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
            aria-hidden="true">
            <path d={pathD} stroke="currentColor" strokeWidth="2.2" strokeDasharray="4 5"
              strokeLinecap="round" fill="none" opacity=".55" vectorEffect="non-scaling-stroke"
              style={{ color: 'var(--ink)' }} />
          </svg>

          {/* Peaks */}
          {layout.map((p) => {
            const entry = state.tables[p.t];
            const mastery = MultiplStore.masteryFor(entry);
            const isRecommended = p.t === recommended && entry.total > 0;
            const color = colorForTable(p.t);
            return (
              <button
                key={p.t}
                className="peak"
                style={{
                  position: 'absolute',
                  left: `calc(${p.x}% )`,
                  top: `${p.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                }}
                onClick={() => onPickTable(p.t)}
                aria-label={`Table de ${p.t}, ${mastery.stars} étoiles`}
              >
                {isRecommended && <span className="pulse" />}
                <span className="badge" style={{ background: color }}>
                  <span className="num">{p.t}</span>
                  <BadgeStars count={mastery.stars} />
                </span>
              </button>
            );
          })}

          {/* Departure & goal markers removed for visual clarity */}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 }}>
          <button className="btn btn-warm" onClick={() => onPickTable(recommended)}>
            <Icons.Target size={18} /> Continuer (table de {recommended})
          </button>
          <button className="btn" onClick={() => onPickTable('speedrun')}>
            <Icons.Bolt size={18} /> Speed Run 60s
          </button>
        </div>
      </div>
    </div>
  );
}

// ----- Universe-specific decorative backdrop -----
function MapBackdrop({ universe }) {
  const baseStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: .35 };

  if (universe === 'espace') {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={baseStyle} aria-hidden="true">
        {/* Stars */}
        <g fill="#7B5DD1">
          {Array.from({ length: 30 }).map((_, i) => {
            const cx = (i * 37) % 100;
            const cy = (i * 19) % 100;
            const r = 0.3 + (i % 3) * 0.2;
            return <circle key={i} cx={cx} cy={cy} r={r} />;
          })}
        </g>
        {/* Ringed planet top-right */}
        <g transform="translate(80 12)">
          <ellipse cx="0" cy="0" rx="9" ry="2" fill="none" stroke="#FF6B9D" strokeWidth="0.4" />
          <circle cx="0" cy="0" r="4" fill="#FFD166" />
        </g>
        {/* Crescent moon */}
        <g transform="translate(14 18)">
          <circle cx="0" cy="0" r="3" fill="#FF6B9D" />
          <circle cx="1.4" cy="-.4" r="2.7" fill="var(--bg)" />
        </g>
        {/* Distant planet */}
        <circle cx="58" cy="35" r="2" fill="#00B8C7" />
        {/* Nebula at bottom */}
        <ellipse cx="50" cy="100" rx="80" ry="14" fill="#7B5DD1" opacity=".4" />
        <ellipse cx="20" cy="98" rx="35" ry="9" fill="#FF6B9D" opacity=".3" />
      </svg>
    );
  }

  if (universe === 'ocean') {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={baseStyle} aria-hidden="true">
        {/* Sun top right */}
        <circle cx="85" cy="10" r="5" fill="#FFC857" />
        {/* Clouds top */}
        <g fill="#fff" opacity=".8">
          <ellipse cx="20" cy="14" rx="6" ry="2.2" />
          <ellipse cx="55" cy="22" rx="5" ry="1.8" />
        </g>
        {/* Wavy water */}
        <path d="M 0 50 Q 25 46 50 50 T 100 50 L 100 100 L 0 100 Z" fill="#1E88B5" opacity=".30" />
        <path d="M 0 60 Q 25 55 50 60 T 100 60 L 100 100 L 0 100 Z" fill="#06D6A0" opacity=".24" />
        <path d="M 0 75 Q 25 70 50 75 T 100 75 L 100 100 L 0 100 Z" fill="#1E88B5" opacity=".40" />
        {/* Tiny boat */}
        <g transform="translate(28 42)" fill="#FF7B5C">
          <path d="M -3 0 L 3 0 L 2 2 L -2 2 Z" />
          <path d="M 0 -4 L 0 0 L 2 -1 Z" fill="#fff" />
        </g>
        {/* Fish silhouettes */}
        <g fill="#0A3D52" opacity=".5">
          <path d="M 68 78 Q 72 76 75 78 Q 72 80 68 78 Z M 75 78 L 77 76 L 77 80 Z" />
        </g>
      </svg>
    );
  }

  // montagne (default)
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={baseStyle} aria-hidden="true">
      <path d="M 0 100 L 0 70 L 14 50 L 28 65 L 42 40 L 60 60 L 78 35 L 100 55 L 100 100 Z"
        fill="#5BA3D0" opacity=".25" />
      <path d="M 0 100 L 0 82 L 18 65 L 36 78 L 52 58 L 70 75 L 88 60 L 100 72 L 100 100 Z"
        fill="#2A9D8F" opacity=".22" />
      <circle cx="85" cy="12" r="5" fill="#FFD166" />
      <g fill="#fff" opacity=".7">
        <ellipse cx="20" cy="20" rx="6" ry="2.5" />
        <ellipse cx="60" cy="32" rx="5" ry="2" />
        <ellipse cx="40" cy="10" rx="4" ry="1.6" />
      </g>
    </svg>
  );
}

window.HomeScreen = HomeScreen;

// Stars arranged along a slight arc at the bottom of the badge circle.
// Center star is larger and sits at the lowest point; side stars are smaller
// and lifted slightly, mimicking the inner curvature of the circle.
function BadgeStars({ count = 0 }) {
  const positions = [
    { cx: -14, cy: -2, size: 9 },  // left
    { cx:   0, cy:  0, size: 13 }, // center, lower & larger
    { cx:  14, cy: -2, size: 9 },  // right
  ];
  return (
    <svg className="badge-stars" viewBox="-22 -10 44 16" width="52" height="20" aria-hidden="true">
      {positions.map((p, i) => (
        <StarMark key={i} {...p} filled={count >= i + 1} />
      ))}
    </svg>
  );
}

function StarMark({ cx, cy, size, filled }) {
  const fill = filled ? '#ffffff' : 'rgba(255,255,255,.25)';
  const scale = size / 22;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      <path
        d="M0 -10 L2.95 -3.4 L10 -2.5 L4.7 2.35 L6.1 9.5 L0 5.8 L-6.1 9.5 L-4.7 2.35 L-10 -2.5 L-2.95 -3.4 Z"
        fill={fill}
        strokeLinejoin="round"
      />
    </g>
  );
}
