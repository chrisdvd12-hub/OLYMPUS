# Premier test sur iPhone

## Lancement depuis un ordinateur

1. Installer Node.js 24 et les dépendances avec `npm ci` à la racine du projet.
2. Vérifier la compatibilité avec `npx expo install --check`.
3. Installer Expo Go sur l'iPhone. Ce projet utilise Expo SDK 57 : vérifier que la version d'Expo Go installée prend en charge ce SDK. Une erreur de SDK incompatible impose une mise à niveau du projet ou un development build iOS. Ne pas considérer un simple QR code comme une validation de compatibilité.
4. Connecter l'ordinateur et l'iPhone au même réseau Wi-Fi.
5. Exécuter `npm start` puis scanner le QR code avec l'app Appareil photo de l'iPhone. Autoriser l'accès au réseau local si iOS le demande.

Le serveur lancé dans l'environnement distant de développement n'est pas accessible au téléphone par une adresse localhost. Aucun lien de test public ou build TestFlight n'a encore été créé.

## Parcours à vérifier sur une installation neuve

- [ ] La boutique affiche 500 drachmes et 2 charges gratuites.
- [ ] Les quatre extensions sont sélectionnables ; chaque sachet indique 7 cartes.
- [ ] Un achat payé retire exactement 100 drachmes et démarre une ouverture.
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
