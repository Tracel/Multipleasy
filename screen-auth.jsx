// Auth screen — login + signup (username + password)
function AuthScreen({ onAuth }) {
  const [tab, setTab] = React.useState('login');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [color, setColor] = React.useState('#5BA3D0');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const COLORS = ['#5BA3D0', '#EF476F', '#FFD166', '#2A9D8F', '#9C89B8', '#F4A261'];
  const inputRef = React.useRef(null);

  React.useEffect(() => { inputRef.current?.focus(); }, [tab]);

  function toEmail(u) {
    return `${u.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '')}@multipleasy.app`;
  }

  function toPassword(pin) {
    return `mp_${pin}`;
  }

  function switchTab(t) {
    setTab(t);
    setError('');
    setUsername('');
    setPassword('');
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      const { data, error: err } = await window.SupabaseClient.auth.signInWithPassword({
        email: toEmail(username),
        password: toPassword(password),
      });
      if (err) throw err;
      const { data: row } = await window.SupabaseClient
        .from('user_progress')
        .select('data')
        .eq('user_id', data.user.id)
        .single();
      onAuth(row?.data || null, data.user);
    } catch (err) {
      if (err.message.includes('Invalid login credentials') || err.message.includes('invalid_credentials')) {
        setError('Pseudo ou mot de passe incorrect.');
      } else {
        setError('Erreur de connexion. Réessaie.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length < 2) { setError('Le pseudo doit faire au moins 2 caractères.'); return; }
    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) { setError('Pseudo : lettres, chiffres, _ . - seulement.'); return; }
    if (!/^\d{4}$/.test(password)) { setError('Le code secret doit faire exactement 4 chiffres.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data, error: err } = await window.SupabaseClient.auth.signUp({
        email: toEmail(trimmed),
        password: toPassword(password),
        options: { data: { username: trimmed } },
      });
      if (err) throw err;
      if (!data.session) {
        setError('Compte créé mais connexion automatique échouée — contactez l\'administrateur.');
        return;
      }
      const initialState = MultiplStore.defaultState();
      initialState.profile = { name: trimmed.slice(0, 16), color };
      MultiplStore.touchStreak(initialState);
      await window.SupabaseClient.from('user_progress').insert({
        user_id: data.user.id,
        data: initialState,
      });
      onAuth(initialState, data.user);
    } catch (err) {
      if (err.message.includes('already registered') || err.message.includes('already been registered')) {
        setError('Ce pseudo est déjà pris. Essaies-en un autre.');
      } else {
        setError(err.message || 'Erreur lors de la création du compte.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="onboard">
      <div className="bounce">
        <Mascot mood="wave" size={120} color={color} accent="#EF476F" />
      </div>
      <h1>Multipl'easy</h1>

      <div className="auth-tabs">
        <button className={tab === 'login' ? 'active' : ''} onClick={() => switchTab('login')}>
          Connexion
        </button>
        <button className={tab === 'signup' ? 'active' : ''} onClick={() => switchTab('signup')}>
          Créer un compte
        </button>
      </div>

      {tab === 'login' ? (
        <form className="form" onSubmit={handleLogin}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ton pseudo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            maxLength={20}
          />
          <input
            type="password"
            placeholder="Code secret (4 chiffres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            inputMode="numeric"
            maxLength={4}
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={handleSignup}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Choisis un pseudo  (ex : Lucas42)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            maxLength={20}
          />
          <input
            type="password"
            placeholder="Code secret (4 chiffres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            inputMode="numeric"
            maxLength={4}
          />
          <div className="auth-color-label">Ta couleur :</div>
          <div className="color-row" role="radiogroup" aria-label="Choisis ta couleur">
            {COLORS.map((c) => (
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
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Création…' : "C'est parti !"}
          </button>
        </form>
      )}
    </div>
  );
}

window.AuthScreen = AuthScreen;
