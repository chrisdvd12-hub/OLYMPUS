# OLYMPUS 0.2 — Visual & Performance

## Point de restauration

La branche `restore/v0.2-before-visual-performance-20261028` conserve le commit `d99551b2a8fd4fb69a188322f39fa6e5399f746c`, avant les modifications 0.2.

## Résultats mesurés

- Les 120 définitions, les poids de rareté, la garantie rare, la protection légendaire et le schéma SQLite sont inchangés.
- Les animations continues de la roue, des particules, du ciel et des matières utilisent Reanimated sur le thread UI. Les passages de phase utilisent seulement des minuteries ponctuelles sur le thread JavaScript.
- Les mises à jour React déclenchées par le défilement sont maintenant limitées aux changements réels de visibilité.
- La qualité graphique choisit un profil `high`, `balanced` ou `economy` selon la surface physique à afficher. Les profils réduisent progressivement les particules, étoiles et couches de ciel sans retirer les cadres ni les cartes.
- Le profil joueur contient une mesure volontaire de dix secondes. Elle rapporte la cadence JavaScript, la moyenne, le P95 et les images de plus de 32 ms sans effectuer un rendu React à chaque image.
- Le profil joueur permet aussi de conserver un choix `AUTO`, `HIGH`, `BALANCED` ou `ECONOMY` dans un stockage SQLite séparé de la sauvegarde de collection.
- Les images sont chargées avec `expo-image`, cache mémoire/disque, redimensionnement natif et liste virtualisée. `npm run check:memory` calcule également la surface décodée théorique des illustrations suivies.
- Les petits écrans inférieurs à 360 points utilisent deux colonnes dans l’album et une offrande quotidienne compacte.
- OLY-049 Éos utilise désormais le remplacement complet fourni par le propriétaire, normalisé en PNG 750 × 1050 sans contenu inventé.

## Roue et ouverture des boosters

- Les quatre boosters suivent désormais une orbite elliptique complète avec profondeur, inclinaison, échelle et opacité propres à leur position. Le booster arrière reste visible et ne partage plus les coordonnées du booster actif.
- La déchirure utilise un geste horizontal exécuté par Gesture Handler et Reanimated sur le thread UI. Le sceau suit le doigt, la couture s'illumine avec la couleur de l'extension et le haut de l'emballage se détache après le geste.
- Les sept cartes sont présentées par rareté croissante. Le reçu persistant et son ordre d'origine restent inchangés.
- La dernière carte se retourne plus lentement, puis reste visible sous un halo adapté à sa rareté avant l'affichage du récapitulatif.

## Objectifs restant à mesurer

- L’objectif est 60 FPS sur les appareils compatibles. Il ne peut être confirmé qu’avec une version de production sur appareil physique.
- Le diagnostic intégré mesure la cadence JavaScript. Le thread UI doit être contrôlé avec les outils de performance React Native/Xcode/Android Studio dans un development build ou un build de production.
- La mémoire résidente, la température, la batterie et le comportement après de nombreuses ouvertures doivent être observés sur appareil ; le contrôle statique fournit seulement une borne théorique.

## Expo SDK 58

`expo-doctor` a validé 18 contrôles sur 20. Les deux contrôles restants demandaient l’API Expo et React Native Directory, inaccessibles depuis l’environnement cloud lors de l’audit. Le contrôle local hors ligne indique que les versions installées correspondent au SDK, avec la réserve normale qu’un contrôle hors ligne ne remplace pas Expo Doctor connecté.

Toutes les dépendances natives utilisées actuellement sont disponibles dans Expo Go SDK 58. Expo Go reste donc suffisant pour le test fonctionnel immédiat. Un development build devient nécessaire pour mesurer correctement une version de production, utiliser un profileur natif, distribuer via TestFlight ou ajouter une bibliothèque native absente d’Expo Go.

## Mise à jour du Codespace

Après publication :

```bash
git pull && npm ci && npm run start:go
```

Arrêter auparavant le serveur Expo existant avec `Ctrl+C`, puis scanner le nouveau QR code.
