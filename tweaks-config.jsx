// Tweaks configuration — universes, energy presets, tone presets.
// Provides a React context so any screen can read the active tweaks.

const TweaksContext = React.createContext(null);

// ----- UNIVERSES ----------------------------------------------------------
const UNIVERSES = {
  montagne: {
    id: 'montagne',
    label: 'Montagne',
    greetingNew: name => <>Bienvenue, <span className="accent">{name}</span>&nbsp;! Choisis une table et commence ton aventure.</>,
    greetingReturn: (name, rec) => <>Belle progression, <span className="accent">{name}</span>&nbsp;! Aujourd'hui, je te propose la <span className="accent">table de {rec}</span>.</>,
    placeWord: 'sommets',
    departureLabel: 'départ',
    departureColor: '#2A9D8F',
    goalColor: '#FFD166',
    mascotColor: '#FFD166',
    speedrunIntro: 'Toutes les tables mélangées, le plus de bonnes réponses possible en une minute.',
  },
  espace: {
    id: 'espace',
    label: 'Espace',
    greetingNew: name => <>Salut <span className="accent">{name}</span>&nbsp;! Choisis une planète et explore la galaxie des tables.</>,
    greetingReturn: (name, rec) => <>Cap, <span className="accent">{name}</span>&nbsp;! Cette mission t'emmène vers la <span className="accent">planète {rec}</span>.</>,
    placeWord: 'planètes',
    departureLabel: 'décollage',
    departureColor: '#00E5C1',
    goalColor: '#FF6B9D',
    mascotColor: '#FF6B9D',
    speedrunIntro: 'Vitesse lumière sur 60 secondes : enchaîne le plus de bonnes réponses possible !',
  },
  ocean: {
    id: 'ocean',
    label: 'Océan',
    greetingNew: name => <>Ohé, <span className="accent">{name}</span>&nbsp;! Choisis une île et navigue à travers les tables.</>,
    greetingReturn: (name, rec) => <>Bonne escale, <span className="accent">{name}</span>&nbsp;! Le courant te porte vers l'<span className="accent">île {rec}</span>.</>,
    placeWord: 'îles',
    departureLabel: 'le port',
    departureColor: '#06D6A0',
    goalColor: '#FFC857',
    mascotColor: '#FFC857',
    speedrunIntro: 'Cap sur 60 secondes de calculs : ramène le plus de trésors possible !',
  },
};

// ----- ENERGY -------------------------------------------------------------
const ENERGY = {
  doux: {
    id: 'doux',
    label: 'Doux',
    confetti: 10,
    confettiSpeed: 2.4,
    feedbackDelay: 950,
    badDelay: 1500,
  },
  petillant: {
    id: 'petillant',
    label: 'Pétillant',
    confetti: 30,
    confettiSpeed: 1.8,
    feedbackDelay: 800,
    badDelay: 1300,
  },
  survolte: {
    id: 'survolte',
    label: 'Survolté',
    confetti: 70,
    confettiSpeed: 1.2,
    feedbackDelay: 550,
    badDelay: 1100,
  },
};

// ----- TONE ---------------------------------------------------------------
const TONE = {
  calme: {
    id: 'calme',
    label: 'Calme',
    goods: ['Belle progression.', 'Bien.', "C'est juste.", 'Tu progresses.', 'Joli.', 'Voilà.'],
    bads: ['Pas grave, on continue.', 'On retente tranquillement.', 'Pas tout à fait.', 'Presque.'],
    streakHint: (n) => `${n} bonnes d'affilée.`,
    headlineGood: 'Belle session.',
    headlineMid: 'Tu progresses.',
    headlineLow: 'On recommencera.',
    profilePromptSub: <>Comment tu t'appelles&nbsp;?</>,
    encouragements: { sessionDone: 'Bien joué.', greatSpeed: 'Belle régularité.' },
  },
  joyeux: {
    id: 'joyeux',
    label: 'Joyeux',
    goods: ['Bravo champion&nbsp;!', 'Trop fort&nbsp;!', 'Génial&nbsp;!', 'Top du top&nbsp;!', 'Wahou&nbsp;!', 'Whoosh&nbsp;!'],
    bads: ["Pas grave, ça vient&nbsp;!", "On y est presque&nbsp;!", "Encore une chance&nbsp;!", "Allez, ça va le faire&nbsp;!"],
    streakHint: (n) => `${n} d'affilée, en feu&nbsp;!`,
    headlineGood: 'Énorme, bravo&nbsp;!',
    headlineMid: 'Bien joué, on continue&nbsp;!',
    headlineLow: 'Allez, on retente avec le sourire&nbsp;!',
    profilePromptSub: <>Dis-moi vite ton prénom&nbsp;!</>,
    encouragements: { sessionDone: 'Tu déchires&nbsp;!', greatSpeed: 'Quelle vitesse&nbsp;!' },
  },
  coach: {
    id: 'coach',
    label: 'Coach',
    goods: ['Bien joué.', 'Concentration, on enchaîne.', 'OK, suivante.', 'Bon réflexe.', 'On garde le rythme.'],
    bads: ['Concentre-toi.', 'Encore un effort.', 'Tu peux mieux.', 'Reprends ton souffle.'],
    streakHint: (n) => `Série de ${n}, maintiens le rythme.`,
    headlineGood: 'Solide. On continue.',
    headlineMid: 'Pas mal. On vise plus haut.',
    headlineLow: 'Re-concentre-toi et on remet ça.',
    profilePromptSub: <>Annonce-toi, on s'échauffe.</>,
    encouragements: { sessionDone: 'Objectif atteint.', greatSpeed: 'Vitesse correcte.' },
  },
};

// Helper to escape HTML entities-as-text (the strings above contain `&nbsp;`)
function pickFromList(list) {
  const html = list[Math.floor(Math.random() * list.length)];
  return html;
}

// Render an HTML-encoded text safely (we authored the strings ourselves)
function HTMLText({ html }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

window.MultiplTweaks = {
  TweaksContext,
  UNIVERSES,
  ENERGY,
  TONE,
  pickFromList,
};
window.HTMLText = HTMLText;
window.TweaksContext = TweaksContext;
