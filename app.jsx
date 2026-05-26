// Multipl'easy — main app + routing
const TWEAK_DEFAULTS = { universe: "espace", energy: "petillant", tone: "calme" };

const SUPABASE_URL = 'https://fnedskhjdrlonmgikndx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZBHvtB65G9u2GlhCRKpKew_HL1F93Nv';
window.SupabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function App() {
  // undefined = checking session, null = not logged in, object = logged in user
  const [authUser, setAuthUser] = React.useState(undefined);
  const [state, setState] = React.useState(() => MultiplStore.defaultState());
  const [route, setRoute] = React.useState({ name: 'home' });
  const tweaks = TWEAK_DEFAULTS;
  const saveTimerRef = React.useRef(null);

  // Check existing session on mount
  React.useEffect(() => {
    window.SupabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadCloudState(session.user);
      } else {
        setAuthUser(null);
      }
    });

    const { data: { subscription } } = window.SupabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setState(MultiplStore.defaultState());
        setRoute({ name: 'home' });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadCloudState(user) {
    const { data: row } = await window.SupabaseClient
      .from('user_progress')
      .select('data')
      .eq('user_id', user.id)
      .single();
    if (row?.data) {
      const def = MultiplStore.defaultState();
      const merged = { ...def, ...row.data };
      merged.tables = { ...def.tables, ...(row.data.tables || {}) };
      merged.stats = { ...def.stats, ...(row.data.stats || {}) };
      MultiplStore.touchStreak(merged);
      setState(merged);
    }
    setAuthUser(user);
  }

  // Sync to cloud (debounced 2s) on every state change
  React.useEffect(() => {
    if (!authUser) return;
    MultiplStore.save(state);
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      window.SupabaseClient.from('user_progress').upsert(
        { user_id: authUser.id, data: state, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    }, 2000);
  }, [state]);

  // Called by AuthScreen after login or signup
  function handleAuth(cloudData, user) {
    if (cloudData) {
      const def = MultiplStore.defaultState();
      const merged = { ...def, ...cloudData };
      merged.tables = { ...def.tables, ...(cloudData.tables || {}) };
      merged.stats = { ...def.stats, ...(cloudData.stats || {}) };
      MultiplStore.touchStreak(merged);
      setState(merged);
    }
    setAuthUser(user);
  }

  async function handleLogout() {
    clearTimeout(saveTimerRef.current);
    await window.SupabaseClient.auth.signOut();
  }

  async function handleReset() {
    if (!confirm('Effacer toute la progression ? Cette action est irréversible.')) return;
    const fresh = MultiplStore.defaultState();
    fresh.profile = state.profile; // keep name + color
    setState(fresh);
    MultiplStore.save(fresh);
    await window.SupabaseClient.from('user_progress').upsert(
      { user_id: authUser.id, data: fresh, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  }

  function updateState(updater) {
    setState(prev => (typeof updater === 'function' ? updater(prev) : updater));
  }

  function pickTable(t) {
    if (t === 'speedrun') { setRoute({ name: 'speedrun' }); return; }
    setRoute({ name: 'table', table: t });
  }

  function goMode(mode, table) {
    if (mode === 'learn') setRoute({ name: 'learn', table });
    else setRoute({ name: 'practice', table, mode });
  }

  function finishSession(result) { setRoute({ name: 'results', result }); }

  // Checking session
  if (authUser === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100svh' }}>
        <div className="bounce" style={{ fontFamily: 'Fredoka', fontSize: 22, color: 'var(--muted)' }}>
          Chargement…
        </div>
      </div>
    );
  }

  // Not logged in → auth screen
  if (authUser === null) {
    return (
      <TweaksContext.Provider value={tweaks}>
        <div className="app" data-universe={tweaks.universe} data-energy={tweaks.energy}>
          <AuthScreen onAuth={handleAuth} />
        </div>
      </TweaksContext.Provider>
    );
  }

  // Logged in but no profile (shouldn't happen in normal flow, safety net)
  if (!state.profile) {
    return (
      <TweaksContext.Provider value={tweaks}>
        <div className="app" data-universe={tweaks.universe} data-energy={tweaks.energy}>
          <OnboardingScreen onDone={(profile) => {
            const next = { ...state, profile };
            MultiplStore.touchStreak(next);
            setState(next);
          }} />
        </div>
      </TweaksContext.Provider>
    );
  }

  const showBottom = ['home', 'progress'].includes(route.name);

  return (
    <TweaksContext.Provider value={tweaks}>
      <div className="app" data-universe={tweaks.universe} data-energy={tweaks.energy}>
        <Topbar
          profile={state.profile}
          streak={state.stats.streak}
          onProfileClick={() => setRoute({ name: 'progress' })}
        />

        {route.name === 'home' && (
          <HomeScreen state={state} onPickTable={pickTable} />
        )}

        {route.name === 'table' && (
          <TableScreen
            table={route.table}
            state={state}
            onBack={() => setRoute({ name: 'home' })}
            onMode={(mode) => goMode(mode, route.table)}
          />
        )}

        {route.name === 'learn' && (
          <LearnScreen
            table={route.table}
            onBack={() => setRoute({ name: 'table', table: route.table })}
            onPractice={(mode) => goMode(mode, route.table)}
          />
        )}

        {route.name === 'practice' && (
          <PracticeScreen
            table={route.table}
            mode={route.mode}
            state={state}
            onUpdate={updateState}
            onFinish={finishSession}
            onBack={() => {
              if (confirm('Quitter la session en cours ?')) {
                setRoute({ name: 'table', table: route.table });
              }
            }}
          />
        )}

        {route.name === 'speedrun' && (
          <SpeedRunScreen
            state={state}
            onUpdate={updateState}
            onFinish={finishSession}
            onBack={() => setRoute({ name: 'home' })}
          />
        )}

        {route.name === 'results' && (
          <ResultsScreen
            result={route.result}
            profile={state.profile}
            onAgain={() => {
              if (route.result.mode === 'speedrun') setRoute({ name: 'speedrun' });
              else setRoute({ name: 'practice', table: route.result.table, mode: route.result.mode });
            }}
            onHome={() => setRoute({ name: 'home' })}
          />
        )}

        {route.name === 'progress' && (
          <ProgressScreen
            state={state}
            onPickTable={pickTable}
            onLogout={handleLogout}
            onReset={handleReset}
          />
        )}

        {showBottom && (
          <BottomNav
            route={route.name}
            onNav={(r) => setRoute({ name: r })}
          />
        )}
      </div>
    </TweaksContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <Analytics />
    <App />
  </>
);
