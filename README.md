# OLYMPUS — Divine Collection

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
- `assets/references/` : planche des boosters et cadre divin originaux fournis par l'utilisateur, copiés localement sans retouche. Les sachets sont affichés par cadrage de la planche ; des exports individuels HD sont préférables pour la production.
- `assets/boosters/` et `src/components/packArt.ts` : quatre esquisses vectorielles provisoires conservées comme ressources de remplacement, non utilisées par défaut.
- `tests/boosters.test.ts` : tests métier.

## Comportement

Un achat enregistre en une seule ligne transactionnelle les 100 drachmes dépensées (ou la charge gratuite), les sept cartes, les quantités, la protection légendaire et un reçu persistant. Aucun tirage n'est effectué par une animation. Un reçu en cours bloque tout achat suivant et est repris au lancement. Les cartes sont déjà attribuées : le résultat propose « VOIR MA COLLECTION ». Le bouton d'autre ouverture retourne à la boutique pour choisir le mode de paiement.

La protection légendaire est globale aux quatre extensions. Les poids initiaux sont 5500/2500/1200/500/250/45/5 sur 10000. La garantie rare est appliquée avant la protection légendaire, qui conserve nécessairement la première. Une rareté sélectionnée est suivie d'un tirage uniforme parmi les cartes de cette rareté dans l'extension.

Compte de démonstration : 500 drachmes, deux charges gratuites. Aucun gain récurrent de drachmes n'a été spécifié. Recharges fondées sur l'horloge locale ; sans serveur, le changement manuel d'heure ne peut pas être empêché.

## Limites et ressources attendues

Ce livrable constitue une base fonctionnelle à valider sur appareil, pas une version commerciale définitive.

- Les 120 peintures individuelles, descriptions et fiches définitives manquent. Chaque carte affiche « ART PROVISOIRE ».
- Le cadre divin original est embarqué tel quel (JPEG à centre blanc) ; un PNG transparent en haute définition est nécessaire pour superposer les peintures. Les six autres cadres sont des substituts SVG simples, pas des reproductions finales.
- Il manque les quatre exports HD des sachets séparés, la texture métallisée/holographique et le décor de temple séparé. La boutique emploie actuellement un dégradé bleu nuit.
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
