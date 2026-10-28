# Charte visuelle de l’interface

Tous les textes React Native passent par AppText : Cinzel Regular pour le texte courant et les petites informations ; Cinzel SemiBold pour les sous-titres et catégories ; Cinzel Bold pour les titres, boutons importants et nombres. Les trois fontes TTF locales sont chargées avant le premier écran. Le réglage de taille du texte du téléphone reste actif. Les dimensions de la planche typographique sont adaptées aux écrans mobiles, sans imposer 48 pt aux longs titres de sections.

Trajan Pro Regular n’a pas été fourni et ne peut pas être distribué sans licence : Cinzel Regular sert de remplacement déclaré. Fournir le TTF/OTF et les droits de redistribution pour le remplacer. Les lettres déjà imprimées dans les illustrations approuvées restent intactes.

Palette : or olympien #D4AF37, marbre clair #F5E6D0, bleu nuit #0B1E3A, fond #07121e. Les textes emploient aussi un or clair #f0d59d pour le contraste. Les illustrations et sachets conservent leurs couleurs validées et leur alpha. Aucun cadre ni rectangle opaque n’est ajouté autour des sachets.

Le fond assets/backgrounds/sanctuary-night.png est un décor original généré pour l’interface : colonnes corinthiennes, temple, ciel étoilé et pavement grec. Il ne remplace aucune illustration de carte et reste local. Des ornements SVG discrets complètent les titres et panneaux. Les rectos non fournis restent explicitement provisoires.

Boutique et collection partagent une navigation à deux onglets. L’offrande reste unique, en haut à droite, avec le délai de 24 h ou le bouton d’ouverture lorsqu’elle est disponible. Son horloge est isolée dans OfferingBadge pour éviter de recalculer le carrousel chaque seconde ; elle s’arrête en arrière-plan. Les règles économiques et les tirages ne changent pas.

Validation : typage strict, suite métier et contrôle alpha, export natif iOS et Android. Contrôle visuel complémentaire avec les composants réels via React Native Web et des adaptateurs temporaires pour SQLite, les animations et modules natifs ; ce contrôle valide la composition et les fontes, pas le comportement natif iOS. Vérifier sur iPhone les encoches, l’accessibilité, les grandes tailles de texte et les animations avant de considérer le rendu appareil comme validé.
