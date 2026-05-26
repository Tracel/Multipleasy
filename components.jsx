// Reusable UI primitives & the mascot "Pixel"
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ------- Mascot --------
// A friendly geometric character built from circles & rounded rects.
// Props: mood: 'happy' | 'cheer' | 'think' | 'sleep' | 'wave', size, color
function Mascot({ mood = 'happy', size = 90, color = '#FFD166', accent = '#EF476F' }) {
  // Eye shape depends on mood
  let leftEye = <circle cx="35" cy="48" r="4.5" fill="#264653" />;
  let rightEye = <circle cx="65" cy="48" r="4.5" fill="#264653" />;
  let mouth = <path d="M38 64 Q50 74 62 64" stroke="#264653" strokeWidth="4" fill="none" strokeLinecap="round" />;

  if (mood === 'cheer') {
    leftEye = <path d="M30 48 Q35 42 40 48" stroke="#264653" strokeWidth="4" fill="none" strokeLinecap="round" />;
    rightEye = <path d="M60 48 Q65 42 70 48" stroke="#264653" strokeWidth="4" fill="none" strokeLinecap="round" />;
    mouth = <path d="M34 60 Q50 78 66 60" stroke="#264653" strokeWidth="4.5" fill="#264653" strokeLinecap="round" />;
  } else if (mood === 'think') {
    leftEye = <circle cx="35" cy="48" r="4" fill="#264653" />;
    rightEye = <circle cx="65" cy="48" r="4" fill="#264653" />;
    mouth = <path d="M42 67 L58 65" stroke="#264653" strokeWidth="4" fill="none" strokeLinecap="round" />;
  } else if (mood === 'sleep') {
    leftEye = <path d="M30 48 L40 48" stroke="#264653" strokeWidth="4" strokeLinecap="round" />;
    rightEye = <path d="M60 48 L70 48" stroke="#264653" strokeWidth="4" strokeLinecap="round" />;
    mouth = <path d="M40 66 Q50 60 60 66" stroke="#264653" strokeWidth="4" fill="none" strokeLinecap="round" />;
  } else if (mood === 'wave') {
    mouth = <path d="M34 60 Q50 76 66 60" stroke="#264653" strokeWidth="4.5" fill="#fff" strokeLinecap="round" />;
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {/* Body — squishy blob */}
      <ellipse cx="50" cy="58" rx="38" ry="36" fill={color} />
      {/* Tuft */}
      <path d="M50 18 Q56 8 62 18 Q56 22 50 22 Q44 22 38 18 Q44 8 50 18 Z" fill={accent} />
      {/* Cheeks */}
      <circle cx="26" cy="62" r="6" fill={accent} opacity=".5" />
      <circle cx="74" cy="62" r="6" fill={accent} opacity=".5" />
      {/* Face */}
      {leftEye}
      {rightEye}
      {mouth}
      {/* Belly highlight */}
      <ellipse cx="35" cy="42" rx="6" ry="3" fill="#fff" opacity=".5" />
    </svg>
  );
}

// ------- Star (filled / outlined) -------
function Star({ filled = true, size = 16, color = '#FFD166' }) {
  const fill = filled ? color : 'none';
  const stroke = filled ? 'none' : '#bdb088';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5 L14.95 9.1 L22 10 L16.7 14.85 L18.1 22 L12 18.3 L5.9 22 L7.3 14.85 L2 10 L9.05 9.1 Z"
        fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars({ count = 0, total = 3, size = 16 }) {
  return (
    <span className="stars" aria-label={`${count} étoile sur ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <Star key={i} filled={i < count} size={size} />
      ))}
    </span>
  );
}

// ------- Icons (inline, simple) ----------
const Icons = {
  Book: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/><path d="M4 17a3 3 0 0 1 3-3h12"/></svg>,
  Target: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  Bolt: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>,
  Map: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v16M15 6v16"/></svg>,
  Chart: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 20h16M7 16V9M12 16V5M17 16v-7"/></svg>,
  Trophy: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8v6a4 4 0 0 1-8 0V4z"/><path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3M10 14h4M9 20h6M12 16v4"/></svg>,
  Edit: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l9-9 4 4-9 9H3v-4z"/><path d="M14 6l3-3 4 4-3 3"/></svg>,
  Puzzle: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h3a2 2 0 1 0 4 0h3v4a2 2 0 1 1 0 4v3H4v-3a2 2 0 1 0 0-4V9z"/></svg>,
  Back: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>,
  Flame: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="currentColor"><path d="M12 3s4 4 4 8a4 4 0 0 1-2 3.5c.7-2-.5-4-2-5 0 2-1.5 3-3 4.5A5 5 0 0 0 12 21a6 6 0 0 0 6-6c0-5-6-12-6-12z"/></svg>,
  Check: (p) => <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10"/></svg>,
};

// ------- Confetti burst ----------
function Confetti({ trigger, count = 30, speed = 1.8 }) {
  const [bursts, setBursts] = useState([]);
  useEffect(() => {
    if (!trigger) return;
    const colors = ['#5BA3D0', '#FFD166', '#EF476F', '#06D6A0', '#2A9D8F', '#F4A261', '#7B5DD1', '#FF6B9D'];
    const id = trigger;
    const pieces = Array.from({ length: count }).map((_, i) => ({
      id: `${id}-${i}`,
      left: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 0.2,
      rot: Math.random() * 360,
      duration: speed + Math.random() * .6,
    }));
    setBursts(pieces);
    const t = setTimeout(() => setBursts([]), (speed + 1) * 1000);
    return () => clearTimeout(t);
  }, [trigger, count, speed]);
  if (!bursts.length) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {bursts.map(p => (
        <span key={p.id} style={{
          left: p.left + 'vw',
          background: p.color,
          animationDelay: p.delay + 's',
          animationDuration: p.duration + 's',
          transform: `rotate(${p.rot}deg)`
        }} />
      ))}
    </div>
  );
}

// ------- Topbar ----------
function Topbar({ profile, streak, onProfileClick }) {
  const initials = profile?.name ? profile.name.trim().charAt(0).toUpperCase() : '?';
  const color = profile?.color || '#5BA3D0';
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark">M<span className="x">×</span></div>
        Multipl'easy
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {streak > 0 && (
          <div className="streak-badge" title={`${streak} jours d'affilée`}>
            <Icons.Flame size={14} /> {streak}
          </div>
        )}
        <button className="profile-pill" onClick={onProfileClick} aria-label="Profil">
          <span className="avatar" style={{ background: color }}>{initials}</span>
          <span style={{ fontFamily: 'Fredoka', fontWeight: 500 }}>{profile?.name || 'Moi'}</span>
        </button>
      </div>
    </div>
  );
}

// ------- Bottom nav ----------
function BottomNav({ route, onNav }) {
  return (
    <nav className="bottomnav" aria-label="Navigation">
      <button className={route === 'home' ? 'active' : ''} onClick={() => onNav('home')}>
        <Icons.Map /> Carte
      </button>
      <button className={route === 'progress' ? 'active' : ''} onClick={() => onNav('progress')}>
        <Icons.Chart /> Progression
      </button>
    </nav>
  );
}

// ------- Color helpers ----------
const TABLE_COLORS = {
  2: '#5BA3D0',
  3: '#2A9D8F',
  4: '#F4A261',
  5: '#EF476F',
  6: '#06D6A0',
  7: '#9C89B8',
  8: '#FFD166',
  9: '#E76F51',
  10: '#264653',
};
function colorForTable(t) { return TABLE_COLORS[t] || '#5BA3D0'; }

// ------- Speech bubble component ----------
function SpeechBubble({ children, color = '#fff' }) {
  return (
    <div style={{
      background: color,
      borderRadius: 18,
      padding: '12px 18px',
      position: 'relative',
      border: '2px solid var(--line)',
      fontFamily: 'Fredoka',
      fontSize: 17,
      fontWeight: 500,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {children}
    </div>
  );
}

Object.assign(window, {
  Mascot, Star, Stars, Icons, Confetti, Topbar, BottomNav, colorForTable, SpeechBubble,
});
