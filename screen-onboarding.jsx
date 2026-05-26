// Onboarding — first visit: pick name + color
function OnboardingScreen({ onDone }) {
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState('#5BA3D0');
  const colors = ['#5BA3D0', '#EF476F', '#FFD166', '#2A9D8F', '#9C89B8', '#F4A261'];
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  function submit(e) {
    e.preventDefault();
    const trimmed = name.trim() || 'Champion';
    onDone({ name: trimmed.slice(0, 16), color });
  }

  return (
    <div className="onboard">
      <div className="bounce">
        <Mascot mood="wave" size={140} color={color} accent="#EF476F" />
      </div>
      <h1>Salut !</h1>
      <p>Je m'appelle <strong style={{ color: 'var(--coral)' }}>Pixel</strong>. On va explorer ensemble les tables de multiplication. Comment tu t'appelles&nbsp;?</p>
      <form className="form" onSubmit={submit}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Ton prénom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
        />
        <div className="color-row" role="radiogroup" aria-label="Choisis ta couleur">
          {colors.map((c) => (
            <button
              type="button"
              key={c}
              className={`color-swatch ${c === color ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Couleur ${c}`}
              aria-checked={c === color}
              role="radio"
            />
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <button type="submit" className="btn btn-primary btn-lg">C'est parti&nbsp;!</button>
        </div>
      </form>
    </div>
  );
}

window.OnboardingScreen = OnboardingScreen;
