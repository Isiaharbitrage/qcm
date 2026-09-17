# QCM Hebdo

Site de QCM hebdomadaires — thème rose & noir. Ce site est **totalement indépendant** de ton site d'arbitrage : dépôt GitHub à part, projet Firebase à part. On repart de zéro pour ne prendre aucun risque de confusion ou de blocage lié à l'autre projet.

## Contenu du dossier

```
qcm-hebdo/
├── index.html                 → page d'accueil, liste tous les QCM
├── admin.html                  → espace prof : création d'un QCM (10 questions vrai/faux), accès libre sans connexion
├── qcm.html                     → passage d'un QCM (prénom → questions → résultat)
├── stats.html                   → moyenne des notes par élève
├── style.css                     → thème rose & noir partagé par toutes les pages
├── firebase-config.js            → À COMPLÉTER avec ta configuration Firebase
├── firestore.rules               → règles de sécurité Firestore à copier dans la console Firebase
├── qcm1-fiba-2026.json            → premier QCM prêt à importer (10 questions vrai/faux validées)
└── js/
    ├── app-index.js
    ├── app-admin.js
    ├── app-qcm.js
    └── app-stats.js
```

Tout le contenu du dossier vit **à la racine** de son propre dépôt GitHub (pas dans un sous-dossier). Suis les étapes ci-dessous dans l'ordre, entièrement à partir de zéro.

## 1. Créer un nouveau dépôt GitHub dédié

1. Va sur [github.com/new](https://github.com/new) (connecté avec ton compte `Isiaharbitrage`).
2. Nom du dépôt : par exemple `qcm-hebdo`.
3. Coche **Public** (nécessaire pour GitHub Pages gratuit) et laisse le reste par défaut (pas besoin de cocher "Add a README").
4. Clique **Create repository**.
5. Une fois sur la page du dépôt vide : **Add file → Upload files**, puis glisse **tout le contenu de ce dossier** (`index.html`, `admin.html`, `qcm.html`, `stats.html`, `style.css`, `firebase-config.js`, `firestore.rules`, `qcm1-fiba-2026.json`, et le dossier `js/` avec ses 4 fichiers) directement — pas le dossier `qcm-hebdo` lui-même, son **contenu**.
6. En bas de page, écris un message de commit (ex. `Premier import du site QCM`) puis **Commit changes**.

## 2. Activer GitHub Pages

1. Dans le dépôt, va dans **Settings → Pages**.
2. Sous "Build and deployment" → Source : **Deploy from a branch**.
3. Branche : **main**, dossier : **/ (root)**. Sauvegarde.
4. Après une minute ou deux, l'adresse du site apparaît en haut de cette page, du type :

```
https://isiaharbitrage.github.io/qcm-hebdo/
```

## 3. Créer un nouveau projet Firebase dédié

1. Va sur [console.firebase.google.com](https://console.firebase.google.com).
2. **Ajouter un projet** → donne-lui un nom (ex. `qcm-hebdo`) → tu peux désactiver Google Analytics (pas nécessaire) → **Créer le projet**.
3. Une fois sur la page du projet, clique l'icône **Web** (`</>`) pour ajouter une application web. Donne-lui un surnom (ex. `qcm-hebdo-web`), pas besoin de cocher Firebase Hosting. Clique **Enregistrer l'application**.
4. Firebase affiche l'objet `firebaseConfig` (avec `apiKey`, `authDomain`, `projectId`, etc.) — copie ces valeurs, tu en auras besoin juste après.
5. Dans le menu de gauche, va dans **Compilation → Firestore Database → Créer une base de données**. Choisis une région proche (ex. `eur3 (europe-west)`), démarre en **mode production**.

## 4. Configurer `firebase-config.js`

Ouvre `firebase-config.js` et remplace les valeurs `"REMPLACE_MOI"` par celles copiées à l'étape précédente (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).

## 5. Publier les règles Firestore

1. Dans la console Firebase, va dans **Firestore Database → Règles**.
2. Remplace tout le contenu par celui du fichier `firestore.rules` de ce dossier.
3. Clique **Publier**.

Comme ce projet Firebase est dédié uniquement à ce site, pas besoin de fusionner avec quoi que ce soit d'autre.

⚠️ **Important** : par choix, `admin.html` n'a aucune protection par mot de passe — toute personne qui connaît cette adresse peut créer, modifier ou supprimer un QCM. Ne partage donc pas ce lien publiquement (ne le mets pas dans le menu visible des élèves, ne le publie pas sur les réseaux, etc.).

## 6. Mettre à jour les fichiers sur GitHub après une modification

Si tu modifies un fichier (par exemple `firebase-config.js` une fois rempli) :

1. Dans le dépôt GitHub, ouvre le fichier concerné et clique le crayon (Edit), ou repasse par **Add file → Upload files** pour remplacer plusieurs fichiers d'un coup.
2. En bas, écris un message de commit et valide.

GitHub Pages republie automatiquement après chaque commit (compte quelques dizaines de secondes à quelques minutes).

Conseil : pour éviter tout risque de fichiers désynchronisés, si tu dois mettre à jour plusieurs fichiers, réimporte-les tous en même temps via **Add file → Upload files** plutôt qu'un par un.

## 7. Tester en local avant de pousser (optionnel)

Comme le site appelle Firebase, ouvrir simplement les fichiers en double-clic peut suffire, mais pour éviter tout souci il est plus sûr de lancer un petit serveur local depuis ce dossier :

```bash
python3 -m http.server 8000
```

puis ouvre `http://localhost:8000` dans le navigateur.

## Comment fonctionne le site

- **Accueil** (`index.html`) : liste tous les QCM publiés (numéro, titre, nombre de questions), du plus ancien au plus récent.
- **Espace prof** (`admin.html`, accès direct par son adresse uniquement, pas de connexion) : deux façons de créer un QCM de 10 questions **vrai/faux** :
  - **le formulaire manuel** : un champ "titre", puis pour chaque question un énoncé, un choix Vrai/Faux, et une explication optionnelle (affichée uniquement si la réponse donnée est fausse) ;
  - **l'import rapide (JSON)** : colle un QCM déjà rédigé au format JSON (voir `qcm1-fiba-2026.json` en exemple) et clique sur "Importer et publier" pour le mettre en ligne en un clic, sans retaper chaque question. Format attendu :
    ```json
    {
      "titre": "Titre du QCM",
      "questions": [
        { "texte": "Affirmation à juger...", "reponse": true, "explication": "Optionnel : justification." }
      ]
    }
    ```
    `reponse` vaut `true` si l'affirmation est vraie, `false` si elle est fausse. Il faut exactement 10 questions.

  Dans les deux cas, le numéro du QCM est calculé automatiquement.
- **Passage d'un QCM** (`qcm.html`) : l'élève entre son prénom, puis répond aux 10 questions une par une en choisissant Vrai ou Faux (il faut valider pour passer à la suivante). Aucune indication n'est donnée pendant le quiz. À la fin, une page affiche la note sur 10, le détail de chaque question (réponse donnée, correction et explication si la réponse est fausse), et un bouton pour télécharger le bilan en PDF. Le résultat est automatiquement enregistré dans Firestore.
- **Stats** (`stats.html`) : liste tous les élèves ayant passé au moins un QCM, avec leur moyenne générale et, en cliquant sur leur nom, l'historique détaillé de leurs passages.

## Mettre en ligne le premier QCM (`qcm1-fiba-2026.json`)

Une fois Firebase configuré (étapes 3 à 5) et le site déployé :

1. Va sur `admin.html`.
2. Ouvre `qcm1-fiba-2026.json` (dans ce dossier), copie tout son contenu.
3. Colle-le dans la zone "Import rapide (JSON)" de l'espace prof.
4. Clique sur **Importer et publier**. Le QCM n°1 (10 questions vrai/faux sur les interprétations FIBA 2026, fautes techniques et disruptives) est immédiatement disponible sur la page d'accueil.

## Personnaliser

- **Couleurs** : tout le thème rose/noir est défini en haut de `style.css`, dans le bloc `:root` (variables `--pink`, `--bg`, etc.) — change ces valeurs pour ajuster les teintes.
- **Nombre de questions** : fixé à 10 par QCM (comme demandé). Si tu veux un jour changer ce nombre, modifie la constante `NB_QUESTIONS` dans `js/app-admin.js`.
