# Synchronisation locale et performances

## Portée

Cette version synchronise les écrans d’une même installation avec une seule source d’état et réduit les opérations de stockage et de rendu. La progression reste enregistrée sur l’appareil dans `olympus.db`. Aucun service de compte, sauvegarde cloud ou synchronisation iPhone/iPad n’existait dans le projet : cette version n’en simule pas un. Les mises à jour du code depuis GitHub restent à récupérer dans Codespaces.

## Sauvegarde et cohérence

`src/storage/coordinator.ts` sérialise les opérations et publie un instantané partagé. `useGameState` utilise `useSyncExternalStore` : les écrans affichent le dernier état réellement validé, sans affectations concurrentes provenant de promesses de rafraîchissement. Un achat ne devient visible qu’après COMMIT ; aucune attribution optimiste des cartes ou dépense anticipée n’a été ajoutée.

`sqlitePersistence.ts` initialise la connexion et le schéma une seule fois par instance, prépare la connexion pendant le chargement des fontes, active WAL et conserve la durabilité FULL. Les écritures comparent la valeur sérialisée avant de modifier la ligne. Toutes les mutations continuent à lire l’état courant dans une transaction exclusive. Une initialisation échouée libère sa connexion et peut être retentée, sans effacer le fichier de sauvegarde.

Les demandes de rafraîchissement simultanées de même type sont regroupées. Un échec ne bloque pas la file suivante et ne publie pas de données non enregistrées. Les branches inchangées — collection, reçu en cours, dernier reçu et boosters offerts — conservent leur identité, afin d’éviter le recalcul de la grille ou la réinitialisation des révélations.

## Échéance et retour au premier plan

L’ancienne réécriture périodique toutes les 30 secondes a été supprimée. `useGameSync` recharge au démarrage/retour au premier plan et programme une actualisation à l’échéance de l’offrande. Les appels concurrents revérifient l’attribution dans la transaction, sans cadeau double. Le compteur est purement visuel : il ne déclenche plus lui-même d’écriture. Son affichage se recalcule après reprise. Les écouteurs AppState des animations et du compteur sont mutualisés ; les temporisateurs d’échéance sont annulés en arrière-plan.

L’interface propose une actualisation de sauvegarde après une erreur. Cette action ne relance pas un achat. Les échecs ne réinitialisent ni la collection ni le reçu.

## Images et album

`OptimizedImage` utilise `expo-image ~58.0.17`, compatible avec le SDK 58, pour le cache mémoire/disque et le décodage natif adapté aux dimensions affichées. Le tableau en zoom désactive la réduction de résolution. Les cadres alpha, leurs limites, les points de cadrage et les fichiers originaux restent inchangés. Les quatre sachets sont préchargés dans le même cache disque que le moteur qui les affiche, sans doublonner le cache React Native précédent.

Les cellules de l’album, les rectos/versos et la progression sont mémorisés. Une modification de quantité actualise les cellules concernées, tandis qu’un changement d’offrande ou de profil conserve les images et les calculs de collection. La fenêtre de virtualisation passe de cinq à trois écrans, avec deux rangées par lot initial, pour limiter les vues et images préparées hors écran. Les clés de recyclage évitent d’afficher temporairement le tableau d’une autre carte.

## Validation

- `npm run typecheck` : typage strict.
- `npm test` : **44 tests** (19 boosters, 10 premium, 4 cadrage, 10 synchronisation, 1 proxy), plus les contrôles alpha et les empreintes des 29 peintures.
- Les tests de synchronisation utilisent SQLite réel via l’adaptateur asynchrone injecté : regroupement de 20 demandes, initialisation unique, absence d’I/O inutile, attribution à échéance, notification après COMMIT, rollback, concurrence, identité stable des reçus et reprise à froid.
- Mesure vérifiée dans ce test : après chargement, **20 actualisations inchangées = 0 lecture supplémentaire, 0 écriture supplémentaire et 0 notification**. Une actualisation forcée ajoute une lecture et aucune écriture si rien n’a changé. Ce sont des comptages d’opérations, pas une mesure de FPS sur appareil.
- Vérification des dépendances Expo et exports natifs iOS/Android.
- Contrôle d’interface avec adaptateurs web : navigation, roue, visualiseur, zoom, relations, album, profil et ouverture vers sept résultats. Le cache/décodage natif Expo Image, l’usage mémoire et la fluidité sont à confirmer sur iPhone/Android physique.

## Mise à jour et essai

Après `git pull`, exécuter `npm ci` pour installer Expo Image. Redémarrer Metro et recharger complètement Expo Go SDK 58. Les sauvegardes existantes restent compatibles : ni nouvelle base ni migration destructive.

Vérifier sur téléphone : retour au premier plan avant/après échéance, ouverture puis fermeture pendant la révélation, navigation album/profil après achat, défilement rapide, retour sur une carte déjà affichée et zoom. Le premier téléchargement des peintures n’est pas réduit ; les originaux restent intacts. Le cache accélère les affichages suivants et le décodage réduit le travail des vignettes, sans annoncer de gain de FPS non mesuré.
