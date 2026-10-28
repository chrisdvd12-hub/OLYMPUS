# OLYMPUS sur Vercel

La version Vercel est une application web installable. Elle complète Expo Go et utilise le même dépôt GitHub.

## Installation sur iPhone

1. Ouvrir l’adresse Vercel dans Safari.
2. Toucher **Partager**.
3. Choisir **Sur l’écran d’accueil**.
4. Valider **Ajouter**.

OLYMPUS s’ouvre ensuite depuis son icône en mode plein écran, sans Codespaces ni Expo Go.

## Mise à jour

Chaque publication sur la branche `main` déclenche une nouvelle construction Vercel lorsque le dépôt est lié au projet. Safari récupère la nouvelle version à la prochaine ouverture ou actualisation.

## Sauvegarde

La version web conserve sa progression dans le stockage SQLite du navigateur. La sauvegarde Expo Go reste distincte : aucune synchronisation de progression entre Expo Go et Vercel n’est encore activée.

## Construction

```bash
npm ci
npm run build:web
```

La sortie statique se trouve dans `dist/`. Les en-têtes COOP/COEP de `vercel.json` permettent à `expo-sqlite` de charger son module WebAssembly.
