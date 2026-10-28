# OLYMPUS — Divine Collection

**Mode test actif : drachmes illimitées.** La boutique affiche ∞ et les ouvertures principales ne débitent pas le solde réel.

## Tester sur iPhone depuis un iPad

1. Installer **Expo Go** sur l’iPhone (projet prévu pour Expo SDK 58).
2. Sur l’iPad, ouvrir [le lancement de Codespaces](https://codespaces.new/chrisdvd12-hub/OLYMPUS) dans Safari, se connecter à GitHub et créer l’environnement.
3. Attendre la fin de l’installation automatique des dépendances (`npm ci`).
4. Dans le terminal en bas de Codespaces, saisir **`npm run start:go`**, puis valider.
5. Lorsque le tunnel est prêt, scanner le QR code affiché sur l’iPad avec l’app **Appareil photo de l’iPhone**, puis ouvrir dans Expo Go.

Garder Codespaces ouvert pendant le test. Après le test, arrêter le Codespace depuis GitHub pour économiser le quota. Codespaces dépend de sa disponibilité et du quota de votre compte ; des frais peuvent s’appliquer au-delà du quota inclus. Si le terminal affiche une erreur de tunnel ou de SDK, relever ce message : aucun accès sur téléphone n’est validé tant que l’application ne s’y ouvre pas.

Le dépôt seul ne lance pas l’application. Le lien ci-dessus ouvre un environnement de développement, pas directement le jeu. [Parcours de test détaillé](docs/TEST-IPHONE.md).

Base mobile Expo / React Native / TypeScript strict créée dans un dépôt initialement vide. Aucun combat, publicité ou paiement réel.

## Démarrage

Node 24 recommandé (tests TypeScript natifs). `npm install`, puis `npx expo install --check`, `npm run typecheck`, `npm start`. Ouvrir dans Expo Go SDK 58 ou un development build iOS/Android. SQLite natif : la cible web n'est pas prise en charge ici.

`npm test` : sept tests couvrant 10000 boosters, les probabilités initiales et conditionnelles exactes, les garanties rare et légendaire, l'économie, les doublons, les charges gratuites et la sérialisation transactionnelle SQLite. Le test SQLite utilise le moteur Node ; il ne remplace pas un test d'intégration expo-sqlite sur appareil.

## Fichiers

- `app/` : routage Expo Router.
- `src/components/` : BoosterPack, BoosterCarousel, BoosterShop, BoosterOpening, BoosterTearAnimation, BoosterCardReveal, BoosterResults, BoosterParticles, BoosterShimmer et CardFrame.
- `src/domain/catalog.ts` : quatre extensions de 30 identifiants, catalogue de démonstration à remplacer par les fiches éditoriales définitives.
- `src/domain/boosters.ts` : tirages, garanties, recharges et transitions pures.
- `src/storage/store.ts` : transaction SQLite exclusive, achats sérialisés, attribution avant révélation, reprise du reçu et clôture idempotente.
- `assets/references/` : références historiques de la planche des boosters et du cadre divin.
- `assets/boosters/` : quatre JPG individuels fournis par l’utilisateur, utilisés via `src/components/packArt.ts`. Les anciennes esquisses SVG sont conservées comme archives non utilisées.
- `tests/boosters.test.ts` : tests métier.

## Comportement

Un achat enregistre en une seule ligne transactionnelle les 100 drachmes dépensées (ou la charge gratuite), les sept cartes, les quantités, la protection légendaire et un reçu persistant. Aucun tirage n'est effectué par une animation. Un reçu en cours bloque tout achat suivant et est repris au lancement. Les cartes sont déjà attribuées : le résultat propose « VOIR MA COLLECTION ». Le bouton d'autre ouverture retourne à la boutique pour choisir le mode de paiement.

La protection légendaire est globale aux quatre extensions. Les poids initiaux sont 5500/2500/1200/500/250/45/5 sur 10000. La garantie rare est appliquée avant la protection légendaire, qui conserve nécessairement la première. Une rareté sélectionnée est suivie d'un tirage uniforme parmi les cartes de cette rareté dans l'extension.

Compte de démonstration : 500 drachmes, deux charges gratuites. Aucun gain récurrent de drachmes n'a été spécifié. Recharges fondées sur l'horloge locale ; sans serveur, le changement manuel d'heure ne peut pas être empêché.

## Limites et ressources attendues

Ce livrable constitue une base fonctionnelle à valider sur appareil, pas une version commerciale définitive.

- Les 120 peintures individuelles, descriptions et fiches définitives manquent. Chaque carte affiche « ART PROVISOIRE ».
- Zeus divin utilise son recto complet approuvé. Les six autres cadres ont été fournis pour toutes les extensions ; les compositions des prochaines cartes restent à valider. Les autres cartes utilisent encore les cadres de repli provisoires.
- Les quatre sachets individuels sont intégrés en PNG transparents. Les JPG originaux sont conservés comme références. Il manque encore le décor peint du temple pour la boutique.
- Brillance animée, balayage de découpe, particules douces et retournements sont présents. Flottement, retrait de la languette, apparition en éventail puis grille, rayons légendaires, constellation mythique et halo divin sont intégrés sous une forme simplifiée. La déchirure physique réaliste et la mise en scène commerciale définitive restent à finaliser.
- Réduction des animations : préférence système et interrupteur pendant la session ; les effets continus sont arrêtés pour les boosters non sélectionnés.
- Les tests de fermeture réelle pendant transaction, gestes, VoiceOver/TalkBack, rendu et performances iOS/Android restent à exécuter.

## Vérification dans cet environnement

`npm test` : 7/7 réussis. `npm run typecheck` : réussi. `npx expo install --check` : dépendances compatibles. Installation effectuée avec cache npm dans `/tmp` après activation de l'accès réseau ; `package-lock.json` fourni. Export Metro iOS/Android réussi (1501 / 1504 modules, deux bundles Hermes et assets locaux dans `dist/`). Aucun simulateur ou appareil disponible pour valider les interactions natives.

## Préparation Expo Go — 27 octobre 2026

Projet migré vers Expo SDK 57, version annoncée par le service Expo pour Expo Go, avec React Native 0.86.3 et React 19.2.3. Correction de l'ancienne API `StyleSheet.absoluteFillObject`. `npm run start:go` et configuration Codespaces ajoutés ; voir `docs/TEST-IPHONE.md`.

Typage strict, sept tests métier et compatibilité des dépendances : validés après migration. Export iOS réussi dans `dist-go57/` (1709 modules). L'ancien export `dist/` reste celui du SDK 54. Aucun test natif iPhone effectué. Le tunnel ngrok a échoué deux fois par expiration du délai, avec et sans configuration du proxy ; aucun accès public fourni. React Native DevTools signale aussi une incompatibilité avec le sandbox de cet environnement, sans empêcher l'export Metro. Aucun contournement du sandbox effectué.

## Mise à niveau Expo Go SDK 58

Le SDK 58 est la cible actuelle, correspondant à la version demandée par Expo Go sur l’iPhone de test. Les mentions du SDK 57 ci-dessus documentent les vérifications historiques, et ne définissent plus la version courante.

Dépendances alignées sur `expo@58.0.19/bundledNativeModules.json`, notamment React 19.3.0, React Native 0.88.0, Reanimated 4.7.1, Worklets 0.13.0 et les types React 19.3. Le correctif des protocoles de proxy répétés est conservé. Après mise à jour du dépôt, `npm ci` est obligatoire avant de relancer Expo ; `git pull` seul ne met pas à jour les modules déjà installés.

Validation SDK 58 : typage strict et 8 tests réussis, dépendances compatibles selon Expo, export iOS réussi (1810 modules). Le lancement sur l’iPhone reste à confirmer.

## Ouverture céleste et mythologie grecque

L'ouverture dispose maintenant d'un fond fixe avec deux plans d'étoiles mobiles, une étoile filante, un cercle céleste en rotation lente et des silhouettes de colonnes et de temple. Les motifs des extensions sont des interprétations graphiques : aigle de Zeus, voûte primordiale des Titans, lyre d'Orphée et Pégase. Ils ne prétendent pas constituer des cartes astronomiques exactes.

Des poussières dorées montent dans le décor ; la déchirure déclenche une onde et une gerbe d'étincelles. Les sept cartes se déploient progressivement en éventail avec le dos fourni. Les effets de rareté restent derrière les cartes et les commandes. Aucun flash plein écran ajouté.

Les boucles utilisent Reanimated sur le thread UI, s'arrêtent en arrière-plan et à l'écran de résultats. Le mode réduction des animations conserve un décor statique et masque les particules. Aucun nouvel asset externe ni dépendance ajouté. Le rendu et la fluidité doivent encore être confirmés sur l'iPhone de test.

## Sachets individuels définitifs fournis

Les images de Zeus, Cronos, Achille et Méduse remplacent le cadrage de la planche dans la boutique et l’ouverture. Sources originales JPG de 853 × 1280 pixels, copiées sans retouche ; proportions conservées, fonds blancs des sources inclus. Aucun cadre, bordure, arrondi, fond coloré, texte supplémentaire ou ombre rectangulaire ajouté par `BoosterPack`. Les dorures et les textes restent ceux déjà imprimés sur les images.

La brillance et la déchirure sont conservées : la languette et le corps du sachet utilisent des portions complémentaires du même fichier, sans duplication persistante de la languette sous la partie déchirée.

## Drachmes illimitées temporaires

Activées à la demande du propriétaire dans `src/config/testing.ts` (`UNLIMITED_DRACHMAS = true`). La boutique affiche « ∞ drachmes · TEST » et son bouton principal reste disponible même avec un solde réel nul. Le stockage transmet cette option au tirage transactionnel : aucun débit ni contrôle de fonds pour les ouvertures payantes en mode test. Aucun `Infinity` n'est écrit en JSON/SQLite ; le solde réel, la collection et les reçus existants sont conservés.

Les sept cartes, les garanties, le suivi des doublons et la protection contre les achats répétés restent appliqués. Les charges gratuites conservent leur fonctionnement normal. Remettre la constante à `false` rétablit le prix de 100 drachmes sans migration ni réinitialisation des sauvegardes. Les tests couvrent les deux politiques et une série de 25 ouvertures à solde nul, avec sérialisation et protection légendaire.

## Suppression des contours blancs des boosters

Les quatre sachets affichés utilisent désormais les PNG RGBA `assets/boosters/*-transparent.png` préparés à partir des JPG fournis. Les dimensions sont de 1024 × 1536, avec un fond extérieur alpha transparent. Les JPG originaux et les sorties de génération locales sont conservés ; les anciennes descriptions des fonds blancs ci-dessus documentent l'intégration précédente.

`BoosterShimmer` applique aussi un masque alpha du sachet à son reflet pour éviter toute bande lumineuse dans les marges transparentes. Aucun cadre ou fond de remplacement n'est ajouté dans `BoosterPack`. Le changement couvre la boutique et la présentation d'ouverture, qui partagent ce composant.

## Zeus divin — recto validé et encyclopédie

`OLY-30` désigne désormais Zeus, Le Souverain Céleste, dans Les Maîtres de l’Olympe. L’identifiant interne `olympe-30` reste inchangé afin de préserver les collections et les reçus enregistrés. Cet emplacement était auparavant une donnée de démonstration nommée Dionysos. Le catalogue conserve 120 identifiants uniques, 30 par extension, avec les mêmes poids de rareté.

Le recto local `assets/cards/zeus-divine-front.png` est la copie exacte du dernier aperçu approuvé : code OLY-30 à gauche, collection à droite. Il est utilisé sans surimpression de cadre ni de texte dans les révélations, les résultats et la fiche de carte. Le cadre et l’illustration originaux restent conservés séparément pour les prochaines créations. Les textes du recto sont aplatis dans ce visuel validé : toute modification de ces textes nécessite un nouvel export approuvé.

La fiche affiche la description, l’histoire, les attributs et les relations fournis par le propriétaire. Elle s’ouvre depuis les résultats, les lignes de collection et le bouton « VOIR ZEUS DIVIN » dans la boutique de l’extension. L’aperçu d’une carte non possédée ne l’attribue pas et ne modifie aucune probabilité. Les anciens reçus sont résolus contre les métadonnées actuelles à l’affichage, sans nouveau tirage ni changement de quantité.

Les polices Cinzel Regular, SemiBold et Bold sont embarquées localement pour la fiche, avec la licence OFL. Trajan Pro n’a pas été fournie : Cinzel Regular sert de repli pour les petits textes. Les éléments de combat et les exemples de boosters à 6 cartes du guide visuel ne sont pas repris : le jeu reste consacré à la collection, avec 7 cartes par booster.

Fichiers principaux : `src/domain/zeus.ts`, `src/domain/catalog.ts`, `src/components/cardArt.ts`, `CardFace.tsx`, `CardDetailModal.tsx`, `BoosterCardReveal.tsx`, `BoosterResults.tsx`, `BoosterShop.tsx` et `BoosterOpening.tsx`. Les six autres cadres définitifs ont été reçus dans l’ordre Commune, Peu commune, Rare, Épique, Légendaire, Mythique, pour les quatre extensions. Ils sont conservés pour les prochaines compositions à valider ; les autres illustrations restent attendues. Aucun autre design de carte n’a été inventé.

Validation de cette intégration : typage strict et 12 tests réussis (dont identité de Zeus dans les tirages divins et compatibilité des reçus existants). SDK 58 conservé ; correctifs Expo 58.0.20 et Router 58.0.27 appliqués conformément au contrôle des dépendances. Les prochains rectos doivent suivre le même flux de validation visuelle avant publication ; la présente version de Zeus a été approuvée et sa publication explicitement autorisée.


## Offrande des dieux — règle actuelle

Une seule offrande de deux boosters d’extensions aléatoires toutes les 24 h remplace la recharge de 12 h et la section « Le cadeau quotidien ». En haut à droite de l’accueil, le compte à rebours est remplacé par « OUVRIR UN BOOSTER » dès que des boosters offerts sont disponibles. Le bouton permet de les ouvrir un par un, puis le décompte réapparaît. Échéance, extensions attribuées et ouvertures sont persistantes ; les sauvegardes et boosters déjà reçus sont conservés.


## Interface et typographie

Charte Cinzel appliquée à tous les textes de l’interface : chargement local au démarrage, trois graisses, décor de sanctuaire nocturne, ornements grecs et collection avec miniatures. Les images approuvées restent intactes. Trajan Pro n’étant pas fourni, les petites informations utilisent Cinzel Regular. Voir [la charte et les limites de validation](docs/VISUAL-CHARTER.md).


## Refonte premium interactive

La roue `BoosterWheelCarousel` remplace le slider sur l’accueil : perspective, tours infinis, inertie et sélection centrale. L’album propose une grille filtrable, une galerie et un visualiseur 360° recto/verso avec matières réactives, zoom et encyclopédie à relations cliquables. Profil local et missions de collection sont accessibles depuis la navigation. Les ressources officielles, reçus et sauvegardes sont conservés ; les illustrations individuelles manquantes restent identifiées. L’ouverture peut être passée sans retirer de nouvelles cartes.

Voir [le compte rendu, les fichiers et les limites de validation](docs/PREMIUM-IMPLEMENTATION.md). Après mise à jour, lancer `npm ci` pour installer le retour tactile Expo ajouté.


## Illustrations des Maîtres de l’Olympe

Les 29 peintures OLY-001 à OLY-029 fournies sont associées aux cartes et au zoom, en conservant les originaux. Avec Zeus divin déjà intégré, l’extension possède ses 30 illustrations. Voir [les associations et contrôles](docs/ILLUSTRATIONS-OLYMPE.md). `npm test` contrôle également les fichiers d’illustration et leurs empreintes.
