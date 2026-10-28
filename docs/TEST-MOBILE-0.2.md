# Parcours de test mobile 0.2

## Préparation commune

1. Mettre Expo Go à jour.
2. Dans Codespaces, exécuter `git pull && npm ci && npm run start:go`.
3. Garder le terminal et le Codespace ouverts.
4. Scanner le QR code avec l’iPhone ou Android.
5. Tester une première fois avec « Réduire les animations » désactivé, puis activé.

## iPhone

- Faire plusieurs tours complets de roue dans les deux sens et vérifier le recentrage.
- Ouvrir un booster, interrompre l’application après l’attribution, puis revenir : les sept cartes doivent rester acquises.
- Manipuler une carte à 360°, afficher son verso, recentrer et zoomer l’illustration.
- Activer VoiceOver et vérifier les onglets, la roue, l’offrande et les boutons du visualiseur.
- Dans Profil, lancer « Mesurer 10 secondes » pendant une roue puis pendant une ouverture et noter les deux résultats.

## iPad

- Tester en portrait et en paysage, y compris le changement d’orientation pendant l’album.
- Vérifier que les boosters conservent leurs proportions et que les panneaux ne dépassent pas.
- Afficher l’album, les filtres, le mode galerie et une fiche encyclopédique.
- Répéter la mesure de dix secondes ; le profil adaptatif attendu peut être `balanced` selon la définition de l’écran.

## Android

- Tester le bouton Retour dans le visualiseur et pendant l’ouverture.
- Vérifier le défilement de l’album avec 120 cartes et l’absence de vignettes blanches persistantes.
- Activer TalkBack, la grande taille de texte et la suppression des animations dans les réglages Android.
- Tester un appareil d’entrée ou de milieu de gamme et noter la cadence, la mémoire et la température après dix boosters.

## Petits écrans et accessibilité

- Largeur cible minimale : 320 points logiques.
- L’album doit afficher deux colonnes sous 360 points.
- Les contrôles principaux doivent rester utilisables avec une police agrandie.
- Tous les gestes importants disposent d’un bouton équivalent.
- La réduction des animations supprime les mouvements ambiants tout en conservant les informations et un reflet statique.

## Rapport attendu

Pour chaque appareil, noter modèle, système, mode Expo Go/development build, profil graphique affiché, FPS JS, P95, anomalies visuelles, mémoire observée et étapes de reproduction. Ne pas conclure à 60 FPS à partir d’une seule mesure ou d’Expo Go en mode développement.
