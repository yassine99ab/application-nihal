# Prof Bac — ton cahier de révision

Application web de révision du bac général (Première et Terminale) :

- **Corriger** : un sujet tapé, photographié ou en PDF, avec trois options : correction détaillée pas à pas, indices progressifs sans la solution, ou ta copie notée sur 20 avec la grille officielle du bac puis réécrite en mieux (en gardant tes idées). En matières littéraires, l'appli rédige aussi dissertations, commentaires, explications linéaires, plans et fiches résumé.
- **Analyser un texte** (bac de français) : n'importe quel extrait, en explication linéaire pour l'oral ou en commentaire pour l'écrit. La fiche contient une introduction complète (amorce, présentation, contexte, situation, projet de lecture, annonce des mouvements), une analyse phrase par phrase (procédés et interprétations), une conclusion avec ouverture, la question de grammaire et un tableau des procédés. Tu peux aussi faire noter ta propre explication ou ton commentaire avec la grille officielle.
- **Cours** : une fiche détaillée pour chaque chapitre des programmes officiels (maths avec et sans spécialité, physique-chimie, SVT, français, philosophie, histoire-géo). Tu peux poser tes questions sous la fiche.
- **S'entraîner** : des QCM corrigés avec suivi des scores, et des exercices inédits où tu dévoiles toi-même les indices puis la correction (entièrement rédigée en lettres). Deux onglets pour progresser à ton niveau :
  - **Approfondir** : un exercice en trois paliers sur un critère de réussite précis (problématiser, analyser un procédé, raisonner, valider un résultat…), avec corrigé et grille d'auto-évaluation ;
  - **Méthode** : une fiche méthode adaptée à ton niveau, avec un diagnostic de ton travail si tu en colles un extrait.
- **Bac** : des sujets type inédits au format officiel de juin 2027, un chrono, ta copie notée avec le barème, les annales officielles et le format de chaque épreuve.
- **Historique** : tout est gardé dans le navigateur, sans compte.

Les réponses sont générées par Claude (modèle `claude-opus-5-5`) via l'API Anthropic.

## Démarrer

1. Installe les dépendances (une seule fois) :

   ```bash
   npm install
   ```

2. Ouvre le fichier `.env` à la racine du projet et colle ta clé API Anthropic après le signe `=` (sans espace ni guillemets) :

   ```
   ANTHROPIC_API_KEY=ta_clé
   ```

   La clé reste sur ton ordinateur : elle n'est lue que par le serveur de l'appli et n'est jamais envoyée au navigateur. Le fichier `.env` est exclu de git. Un modèle vide se trouve dans `.env.example`.

   Dans le Finder, les fichiers qui commencent par un point sont cachés : appuie sur Cmd + Maj + . pour les afficher.

3. Lance l'appli :

   ```bash
   npm run dev
   ```

   puis ouvre l'adresse affichée dans le terminal (en général http://localhost:3000).

Pour l'ouvrir sur ton téléphone, il doit être sur le même réseau Wi-Fi : utilise l'adresse « Network » affichée par `npm run dev`.

## Coût

Chaque réponse consomme des crédits de ton compte API : quelques centimes pour une correction ou une fiche de cours, et environ 0,10 à 0,30 € pour un sujet bac complet avec son corrigé. Une fiche de cours déjà générée est gardée sur l'appareil et ne coûte plus rien quand tu la rouvres.

## Mettre à jour les programmes

Tout se trouve dans `src/lib/` :

| Fichier | Contenu |
| --- | --- |
| `programmes.ts` | matières, niveaux et chapitres |
| `oeuvres.ts` | œuvres au programme du bac de français (à changer chaque année) |
| `epreuves.ts` | format officiel de chaque épreuve (durée, barème, structure) |
| `annales.ts` | liens vers les annales |
| `baremes.ts` | grilles de notation officielles (français, philosophie) et attendus (histoire-géo, sciences) |
| `competences.ts` | critères de réussite travaillés par matière et niveaux de l'élève |
| `prompts.ts` | consignes pédagogiques données à l'IA |

Les données ont été vérifiées en octobre 2026 sur les textes officiels :

- BO spécial n° 4 du 17 septembre 2026 (format des épreuves) ;
- BO n° 30 du 24 juillet 2025 (œuvres de français 2026-2027) ;
- BO n° 14 du 2 avril 2026 (nouveaux programmes de maths de Première).

## Technique

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4.
- SDK `@anthropic-ai/sdk` côté serveur, avec réponses en streaming (`src/app/api/generer`) et QCM en JSON structuré (`src/app/api/qcm`).
- Formules : `react-markdown`, `remark-math`, `rehype-katex` et l'extension mhchem de KaTeX pour la chimie.

Commandes utiles : `npm run lint`, `npm run build`, `npm start`.
