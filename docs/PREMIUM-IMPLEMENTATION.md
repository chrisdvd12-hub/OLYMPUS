# Refonte premium — implémentation et validation

## Projet conservé

Expo 58.0.20, React Native 0.88, React 19.3, TypeScript strict, Expo Router, Reanimated 4.7 et Gesture Handler 3.3. La base SQLite `olympus.db`, sa ligne transactionnelle, les identifiants du catalogue et les reçus persistants sont conservés. Aucun effacement, nouveau tirage d’un reçu, changement de poids ou de garantie. L’offrande unique de deux boosters aléatoires / 24 h et le mode de test des drachmes restent opérationnels.

L’analyse a couvert les routes, composants, animations, domaine, stockage, tests, configuration Expo/Codespaces, les 120 fiches et les ressources locales. Les anciennes versions de composants restent disponibles ; leur remplacement est limité aux usages concernés.

## Fonctionnalités

- **Roue infinie** : `BoosterWheelCarousel` dispose les quatre sachets PNG sur un cercle avec perspective, translation de profondeur par matrice native, rotation Y, variation d’échelle, opacité et ordre des plans. Glissement horizontal, inertie amortie, recentrage par ressort, tours illimités, appui sur un voisin, flèches et appui central. Le booster ouvert est désigné explicitement par son index pour éviter une sélection React périmée. Le bouton principal est bloqué pendant le mouvement.
- **Carte physique** : `InteractiveCardViewer` / `Card3DTransform` permettent une rotation Y non bornée, une inclinaison de −35° à +35°, une inertie modérée, le double toucher +180°, des commandes de rotation et un recentrage au recto. Les deux faces ont chacune leur propre transformation et une visibilité exclusive ; le verso possède une rotation supplémentaire de 180° pour éviter le miroir. Tranche fine et ombre de contact varient avec l’angle.
- **Matières** : `CardMaterialEffects` définit sept finitions et un reflet calculé à partir de l’orientation. Le masque alpha respecte le contour des ressources officielles. Constellations mythiques, particules et rayons divins restent de faible intensité. Les mouvements automatiques s’arrêtent en réduction des animations, au passage en arrière-plan ou lorsque la carte est hors écran.
- **Zoom** : `CardArtworkZoom` montre la peinture seule, sans cadre, avec pincement et déplacement bornés, boutons de zoom (1× à 4×) et recentrage. En l’absence d’illustration, une indication explicite remplace le visuel.
- **Album** : grille virtualisée, cartes manquantes masquées, doublons, mode galerie, recherche accentuée par nom ou numéro (y compris OLY-030/OLY-30), filtres d’extension, rareté et possession, tris par numéro/nom/rareté. Compteurs globaux, par extension et rareté. Les détails et filtres se déplient pour laisser de la place aux cartes.
- **Encyclopédie** : `CardDetailPanel` et `MythologyEncyclopedia` affichent les champs du catalogue et des relations cliquables, y compris les différentes raretés d’un même personnage. « Histoire et origines » reprend le texte existant : aucune ascendance ou biographie supplémentaire n’est inventée.
- **Profil et missions** : nom local modifiable et sauvegardé dans la même transaction ; objectifs de collection dérivés des cartes réellement possédées. Les missions ne créent pas de récompenses économiques qui n’ont pas été définies.
- **Ouverture** : `BoosterOpeningSequence` réutilise le reçu et la séquence existants, ajoute une arrivée agrandie, les effets de rareté et « Passer les animations ». `CardRevealAnimation` conserve la révélation une par une. La dépense et les sept cartes sont toujours enregistrées avant l’animation.
- **Interface** : palette demandée, Cinzel, navigation Sanctuaire/Album/Missions/Profil, retours tactiles optionnels, boutons animés et progression animée. `expo-haptics ~58.0.7` est la seule dépendance ajoutée ; elle est alignée sur le SDK Expo et ses erreurs ne bloquent jamais une action.

## Ressources et composition

`CardFront` fournit un gabarit normalisé de référence **1500 × 2100**, ratio **5:7**, avec illustration, cadre maître de rareté et champs de texte indépendants. Les sept cadres sont partagés par toutes les extensions. Les dimensions réelles des PNG fournis sont conservées ; il ne s’agit pas de nouveaux exports de peintures en 1500 × 2100.

**État lors de la refonte initiale** : seule la peinture individuelle de Zeus divin était fournie. Les 119 autres illustrations ne sont pas créées ou remplacées par des peintures génériques ; les cartes découvertes emploient leur cadre officiel et la mention « Illustration à fournir ». Le recto complet de Zeus déjà approuvé reste affiché intact, comme exception de conservation ; sa peinture indépendante est disponible dans le zoom et dans le gabarit `CardFront`. Uniformiser également ce recto signifierait remplacer la composition précédemment approuvée.

Aucun cadre, sachet, verso, peinture, catalogue ou solde n’a été supprimé. Les textes des illustrations déjà approuvées ne sont pas réécrits. Trajan Pro n’étant pas fourni, Cinzel Regular reste le remplacement déclaré pour les petits textes.

## Fichiers

Nouveaux composants : `BoosterWheelCarousel`, `BoosterPackView`, `InteractiveCardViewer`, `Card3DTransform`, `CardMaterialEffects`, `CardFront`, `CardArtworkZoom`, `CardCollectionGrid`, `CollectionProgress`, `CardDetailPanel`, `MythologyEncyclopedia`, `PlayerPanel`, `PremiumButton`, `BoosterOpeningSequence`, `CardRevealAnimation`.

Modifiés : `BoosterShop`, `CardDetailModal`, `CardFace`, `CardBack`, `BoosterOpening`, `BoosterCardReveal`, `BoosterTearAnimation`, `BoosterAura`, `BoosterResults`, `theme`, `rarityFrameArt`, `app/_layout.tsx`, stockage et type `GameState` (nom facultatif), `package.json` et verrou des dépendances. Logique pure ajoutée dans `src/interaction/spatial.ts`, `src/domain/collection.ts`, retour tactile dans `src/interaction/feedback.ts`. Tests supplémentaires : `tests/premium.test.ts`.

## Vérifications et limites techniques

- Suite métier existante : 19 tests, dont attribution atomique, reprise après fermeture, doublons, sept cartes, garanties et offrande de 24 h.
- Tests premium : 10 tests de géométrie, sélection, gestes, recto/verso, orientation des matières, filtres, progression, relations et profil.
- Test proxy : 1. Contrôle alpha : les 12 ressources enregistrées au manifeste.
- TypeScript strict et vérification des dépendances Expo.
- Exports natifs iOS et Android.
- Contrôle d’interface avec les composants réels via React Native Web, adaptateurs temporaires pour les modules natifs et gestes : tours de roue par commandes, recto/verso et rotation, zoom, relation vers Héra, recherche et doublons, galerie, profil, missions, ouverture centrale et passage aux sept résultats. Captures et absence de débordement à 320/390/768 pixels. Ces adaptateurs ne valident ni l’inertie native ni les performances GPU.

**À confirmer sur appareil** : gestes tactiles réels, inertie, épaisseur et ordre de composition natif, retours tactiles, VoiceOver/TalkBack, grandes tailles de texte, consommation mémoire, appareils peu puissants et fréquence d’images. L’objectif est 60 FPS ; aucune mesure sur iPhone ou Android physique n’a été réalisée ici. La perspective est simulée par les transformations natives et n’utilise aucun moteur 3D lourd.

## Test sur iPhone

Dans un nouveau terminal Codespaces : `git pull && npm ci && npm run start:go -- --port 8085`. Scanner le nouveau QR dans Expo Go SDK 58 avec le compte Expo déjà connecté. Ne pas réinitialiser l’application pour mettre à jour.

1. Faire au moins trois tours dans chaque sens, relâcher lentement puis rapidement, interrompre l’inertie et centrer un voisin.
2. Vérifier que titre, prix et ouverture correspondent au booster central.
3. Ouvrir Zeus depuis l’album ou l’aperçu : tourner à 360°, double toucher, incliner, voir le dos puis recentrer ; vérifier la lecture non inversée.
4. Zoomer la peinture, revenir puis suivre une relation.
5. Vérifier filtres, cartes masquées et progression sur téléphone et tablette.
6. Ouvrir un booster, interrompre l’application et reprendre le même reçu ; tester aussi « Passer les animations » et les sept résultats.
7. Activer Réduire les animations, passer en arrière-plan et vérifier l’arrêt des mouvements décoratifs.


## Mise à jour des ressources

Les 29 peintures OLY-001 à OLY-029 ont depuis été intégrées : [détails de l’import](ILLUSTRATIONS-OLYMPE.md). Les 30 cartes des Maîtres de l’Olympe disposent désormais d’une illustration ; les 90 peintures des trois autres extensions restent à fournir.
