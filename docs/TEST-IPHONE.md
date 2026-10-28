# Premier test sur iPhone

## Lancement depuis un ordinateur

1. Installer Node.js 24 et les dépendances avec `npm ci` à la racine du projet.
2. Vérifier la compatibilité avec `npx expo install --check`.
3. Installer Expo Go sur l'iPhone. Ce projet utilise Expo SDK 58 : vérifier que la version d'Expo Go installée prend en charge ce SDK. Une erreur de SDK incompatible impose une mise à niveau du projet ou un development build iOS. Ne pas considérer un simple QR code comme une validation de compatibilité.
4. Connecter l'ordinateur et l'iPhone au même réseau Wi-Fi.
5. Exécuter `npm start` puis scanner le QR code avec l'app Appareil photo de l'iPhone. Autoriser l'accès au réseau local si iOS le demande.

Le serveur lancé dans l'environnement distant de développement n'est pas accessible au téléphone par une adresse localhost. Aucun lien de test public ou build TestFlight n'a encore été créé.

## Parcours à vérifier sur une installation neuve

- [ ] La boutique affiche « ∞ drachmes · TEST » et 2 charges gratuites (mode test temporaire actif).
- [ ] Les quatre extensions sont sélectionnables ; chaque sachet indique 7 cartes.
- [ ] Le bouton principal démarre une ouverture même si le solde réel était épuisé ; aucun débit en mode test.
- [ ] Fermer complètement l'application pendant l'ouverture, puis la relancer : le même tirage reprend, sans nouveau débit.
- [ ] Le geste horizontal et le bouton de découpe fonctionnent tous deux.
- [ ] Exactement 7 cartes sont révélées, une à une ; au moins une est rare ou supérieure.
- [ ] Les résultats affichent les découvertes et les doublons ; le bouton indique « VOIR MA COLLECTION ».
- [ ] La collection contient exactement 7 exemplaires supplémentaires au total.
- [ ] Une ouverture gratuite utilise une charge et laisse le solde inchangé.
- [ ] Une nouvelle fermeture puis relance conserve le solde, les quantités et les charges.
- [ ] Le mode Réduire les animations est utilisable ; VoiceOver peut activer les boutons.

Pour chaque problème, relever le modèle d'iPhone, la version iOS, le message d'erreur exact et les étapes qui l'ont précédé. Ne pas désinstaller l'application entre les étapes de persistance.

Les recharges de 12 heures et la protection légendaire sont couvertes par les tests métier automatisés ; leur intégration native et le rendu des raretés restent à confirmer séparément.

## Sans ordinateur : iPad et environnement cloud

Le dépôt inclut `.devcontainer/devcontainer.json` pour préparer un environnement GitHub Codespaces avec Node 24 et les dépendances. Il faut d'abord placer le projet dans un dépôt GitHub accessible à votre compte. Depuis Safari sur iPad, ouvrir ce dépôt, puis créer un Codespace si ce service est disponible pour votre compte. Des quotas ou frais GitHub peuvent s'appliquer.

Dans son terminal, exécuter `npm run start:go`. Cette commande démarre Expo Go en mode tunnel ; garder la session ouverte. Sur l'iPhone, scanner le QR code affiché sur l'iPad. L'existence du fichier de configuration ne garantit pas que le tunnel sera autorisé dans l'environnement choisi : vérifier que la console affiche un tunnel prêt et une URL `exp://` avant de tester sur téléphone.

État au 27 octobre 2026 : le service de versions Expo annonce `expoGoSdkVersion: 57.0.0`. Projet mis à niveau vers Expo 57 / React Native 0.86.3 / React 19.2.3, et export iOS réussi (1709 modules). Le tunnel depuis l'environnement de cette conversation échoue après expiration du délai, même avec le proxy configuré. Aucun QR code ni lien public validé n'est disponible.

## Mise à niveau Expo Go SDK 58

Le SDK 58 est la cible actuelle, correspondant à la version demandée par Expo Go sur l’iPhone de test. Les mentions du SDK 57 ci-dessus documentent les vérifications historiques, et ne définissent plus la version courante.

Dépendances alignées sur `expo@58.0.19/bundledNativeModules.json`, notamment React 19.3.0, React Native 0.88.0, Reanimated 4.7.1, Worklets 0.13.0 et les types React 19.3. Le correctif des protocoles de proxy répétés est conservé. Après mise à jour du dépôt, `npm ci` est obligatoire avant de relancer Expo ; `git pull` seul ne met pas à jour les modules déjà installés.

## Vérifier Zeus divin

Après avoir récupéré la mise à jour, installer les dépendances avec `npm ci` puis relancer Expo. Dans la boutique « Les Maîtres de l’Olympe », toucher « VOIR ZEUS DIVIN ». Vérifier le recto validé, le code OLY-30 à gauche et la collection à droite. Faire défiler la fiche pour lire les textes de l’encyclopédie, les attributs et les relations. L’aperçu ne doit pas augmenter le nombre de cartes possédées.

Une fois la carte obtenue dans un booster, elle doit utiliser le même recto. Toucher sa miniature sur les résultats, ou sa ligne dans la collection, pour rouvrir la fiche. Les autres cartes conservent leurs visuels provisoires en attendant les cadres et illustrations définitifs.


## Cadeau de connexion : deux boosters aléatoires / 24 heures

À la première visite après cette mise à jour, deux boosters sont attribués automatiquement. Chaque extension a une chance sur quatre, les deux peuvent être identiques. Leurs extensions et la prochaine échéance sont enregistrées atomiquement. Le cadeau reste à ouvrir dans « Le cadeau quotidien » ; il ne dépense ni drachmes ni charges de l’offrande de 12 h, qui reste disponible.

Le décompte HH:MM:SS apparaît en haut à droite de l’accueil. Il part de 24 h à chaque attribution, persiste après fermeture et se recalcule au retour au premier plan. À échéance, une visite ou une session toujours active attribue exactement deux nouveaux boosters ; aucune compensation pour les jours d’absence. Les cadeaux reçus non ouverts restent stockés. Les cartes sont tirées et sauvegardées au moment de l’ouverture, avec sept cartes et les garanties habituelles.

Sur iPhone : constater le cadeau et 24:00:00, fermer et rouvrir sans recevoir deux cadeaux supplémentaires, ouvrir un cadeau puis reprendre la révélation après fermeture. Après 24 h, vérifier deux nouveaux cadeaux et le redémarrage du décompte. La sauvegarde utilise l’horloge du téléphone ; avancer manuellement l’heure peut avancer l’échéance dans ce jeu local sans serveur.
