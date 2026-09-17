/* =======================================================
   Configuration Firebase — À COMPLÉTER
   =======================================================
   Ce site utilise un projet Firebase dédié, séparé de tout
   autre site. Voir le README (étapes 3 et 4) pour la marche
   à suivre complète :
   1. Crée un nouveau projet sur https://console.firebase.google.com
   2. Ajoute une application Web à ce projet, copie l'objet
      "firebaseConfig" affiché et colle ses valeurs ci-dessous.
   3. Active Firestore Database (mode production).
   4. Publie le contenu de firestore.rules dans Firestore
      Database > Règles.

   Remarque : l'espace prof (admin.html) n'a pas de connexion —
   il n'y a donc rien à configurer côté Authentication.
   ======================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyBZVKzKKwXgmlj8ikREFdXkH7PQFUD525Y",
  authDomain: "qcmbasket.firebaseapp.com",
  projectId: "qcmbasket",
  storageBucket: "qcmbasket.firebasestorage.app",
  messagingSenderId: "21050951258",
  appId: "1:21050951258:web:3cc90457e7fca8df74ba63"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* Certains réseaux (proxy d'établissement/entreprise, antivirus avec
   inspection du trafic, certaines extensions) bloquent le type de
   connexion que Firestore utilise par défaut pour écrire des données,
   sans bloquer les lectures — ce qui provoque un bouton "Publication…"
   qui reste bloqué indéfiniment. Ce réglage force Firestore à détecter
   automatiquement s'il doit utiliser une connexion plus compatible
   (long polling) plutôt que la connexion en streaming par défaut. */
db.settings({
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});

/* Noms des collections Firestore utilisées par ce site. */
const COL_QUIZZES = "qcm_quizzes";
const COL_RESULTATS = "qcm_resultats";
