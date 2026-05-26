// Multipl'easy — main app + routing
const TWEAK_DEFAULTS = { universe: "espace", energy: "petillant", tone: "calme" };

function App() {
  const [state, setState] = React.useState(() => MultiplStore.load());
  const [route, setRoute] = React.useState({ name: 'home' });
  const tweaks = TWEAK_DEFAULTS;

  // Touch streak on load (once)
  React.useEffect(() => {
    const s = { ...state };
    MultiplStore.touchStreak(s);
    setState(s);
    // eslint-disable-next-line
  }, []);

  // Persist on every change
  React.useEffect(() => {
    MultiplStore.save(state);
  }, [state]);

  function updateState(updater) {
    setState(prev => (typeof updater === 'function' ? updater(prev) : updater));
  }

  function pickTable(t) {
    if (t === 'speedrun') {
      setRoute({ name: 'speedrun' });
      return;
    }
    setRoute({ name: 'table', table: t });
  }

  function goMode(mode, table) {
    if (mode === 'learn') setRoute({ name: 'learn', table });
    else setRoute({ name: 'practice', table, mode });
  }

  function finishSession(result) {
    setRoute({ name: 'results', result });
  }

  // Onboarding takes over if no profile
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
          <ProgressScreen state={state} onPickTable={pickTable} />
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
root.render(<App />);
