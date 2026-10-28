# Skills de développement retenus

Audit réalisé le 28 octobre 2026 à partir de :

- <https://github.com/topics/codex-skills>
- <https://agenticskills.io/skills/react-native-skills>

Le paquet propriétaire `OLYMPUS_Codex_Skills.zip` (SHA-256 `b1ed79d5e68f418e6b194adb12c4bb64781ceb2c0c183c519afe83d09102d494`) a également été contrôlé. Ses six skills sans script exécutable sont installés dans `.agents/skills/` et deviennent les routeurs prioritaires propres au projet.

## Skills OLYMPUS prioritaires

| Skill | Responsabilité |
| --- | --- |
| `olympus-card-designer` | composition des cartes, cadres, illustrations, textes et détourage |
| `olympus-booster-engine` | tirage immuable, probabilités, garantie, persistance et reprise d'ouverture |
| `olympus-3d-animations` | roue, manipulation 360°, holographie, gestes et réduction des animations |
| `olympus-collection-manager` | album, quantités, filtres, recherche et progression |
| `olympus-mythology-database` | catalogue, extensions, identifiants, accents et encyclopédie |
| `olympus-game-qa` | tests, régressions, accessibilité, assets manquants et parcours critiques |

## Utilisation immédiate

| Skill | Application dans OLYMPUS |
| --- | --- |
| `expo-animation` | roue de boosters, gestes, inertie, retournement des cartes, révélations, haptique et réduction des animations |
| `vercel-react-native-skills` | 60 FPS, listes de l'album, images, stabilité des callbacks et limitation des rendus |
| `expo-design-system` | palette OLYMPUS, Cinzel, espacements, composants et cohérence entre les écrans |
| `expo-native-ui` | interface adaptée à l'iPhone, Android et tablette, zones sûres et effets visuels natifs |
| `expo-ui` | choix de contrôles Expo natifs avant d'ajouter une dépendance communautaire |
| `expo-router` | navigation entre accueil, album, encyclopédie et visualiseur de carte |
| `design-dna` | mesure des couleurs et traduction des références visuelles en règles réutilisables |

## Utilisation ciblée

| Skill | Moment d'utilisation |
| --- | --- |
| `expo-data-fetching` | future synchronisation distante, cache, mode hors ligne et reprise réseau |
| `expo-dev-client` | passage d'Expo Go à un client de développement quand une fonction native non incluse devient nécessaire |
| `expo-upgrade` | mise à niveau d'Expo et résolution des incompatibilités de SDK |
| `eas-update` | diffusion de mises à jour JavaScript et d'assets compatibles avec la version native installée |
| `eas-app-stores` | builds signés, TestFlight, App Store et Google Play |

## Audit du thème GitHub

Les vingt dépôts visibles dans le thème ont été classés selon leur utilité directe pour ce jeu.

| Dépôt | Décision | Motif |
| --- | --- | --- |
| `Egonex-AI/Understand-Anything` | Non retenu | outil d'analyse générique, sans guide React Native nécessaire au jeu |
| `Yuan1z0825/nature-skills` | Non retenu | collection généraliste sans avantage spécifique face aux sources officielles |
| `sickn33/antigravity-awesome-skills` | Source d'orientation | catalogue très large ; le skill d'animation a été récupéré depuis sa source officielle Expo |
| `VoltAgent/awesome-agent-skills` | Non retenu | index de ressources, pas un skill nécessaire à embarquer |
| `alirezarezvani/claude-skills` | Non retenu | collection généraliste et redondante |
| `JimLiu/baoyu-skills` | Non retenu | workflows de contenu sans lien direct avec le jeu mobile |
| `titanwings/distilly` | Non retenu | outil de synthèse de dépôts, inutile à l'exécution du jeu |
| `composio-community/awesome-codex-skills` | Non retenu | index, pas une source technique spécifique à OLYMPUS |
| `gosom/google-maps-scraper` | Non retenu | cartographie sans rapport avec le jeu |
| `VoltAgent/awesome-codex-subagents` | Non retenu | modèles d'agents, pas de compétence mobile à intégrer |
| `CCOSTAN/Home-AssistantConfig` | Non retenu | domotique |
| `michael-denyer/pstack-claude` | Non retenu | workflow de productivité générique |
| `kaomei/stickman-video-director` | Non retenu | génération vidéo sans rapport avec le rendu mobile du jeu |
| `ciembor/agent-rules-books` | Non retenu | règles génériques, redondantes avec les guides officiels retenus |
| `tourmind-com/Tourmind-Booking-Skills` | Non retenu | réservation de voyages |
| `zanwei/design-dna` | Retenu | analyse structurée des références, palettes et effets visuels |
| `Mahanaicoach/google-maps-scraper-kit` | Non retenu | cartographie sans rapport avec le jeu |
| `a5c-ai/babysitter` | Non retenu | orchestration d'agent, sans bénéfice pour l'application |
| `hashgraph-online/awesome-codex-plugins` | Non retenu | index de plugins, pas de besoin fonctionnel actuel |
| `specstoryai/getspecstory` | Non retenu | historique de développement, sans impact sur le jeu |

## Contrôle avant intégration

- Les dossiers complets retenus sont conservés sous `skills/vendor/` avec leur révision source.
- Aucun script tiers n'est lancé automatiquement.
- Les guides généralistes, redondants ou sans lien avec Expo ont été écartés afin d'éviter des instructions contradictoires.
- Toute commande de publication EAS ou App Store reste une action explicite et contrôlée.
