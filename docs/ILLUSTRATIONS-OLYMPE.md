# Illustrations — Les Maîtres de l’Olympe

Les 29 peintures originales OLY-001 à OLY-029 ont été fournies dans quatre lots : huit premières images avec INDEX.csv, huit images complémentaires, huit images OLY-017 à OLY-024 et cinq images OLY-025 à OLY-029. Les PNG de 750 × 1050 sont copiés sans retouche, recompression, agrandissement ni suppression de leur décor. Leurs empreintes SHA-256 sont enregistrées dans assets/illustrations.manifest.json. INDEX.csv est conservé à l’identique pour le premier lot.

Avec Zeus divin OLY-030 déjà présent, les 30 cartes de l’extension disposent d’une illustration. Les 90 cartes des autres extensions attendent encore leurs peintures individuelles. Les sources et le recto approuvé de Zeus divin restent inchangés.

Le registre illustrationArt.ts associe les fichiers aux identifiants persistants olympe-1 à olympe-29 ; il est partagé par CardFront et le zoom. Chaque peinture utilise le cadre maître de sa rareté, les textes existants et le ratio 5:7. La fenêtre du cadre affiche la peinture sans étirement ; le zoom permet de voir la source entière. Les décors des peintures restent opaques, tandis que l’extérieur des cadres conserve sa transparence.

Les variantes restent distinctes : Athéna épique OLY-023 / mythique OLY-028, Poséidon légendaire OLY-026 / mythique OLY-029 et Zeus légendaire OLY-027 / divin OLY-030. Aucune carte ni progression n’est attribuée par l’import ; seules les illustrations des cartes existantes changent.

Validation : npm run typecheck, npm test (30 tests et contrôles d’images), exports iOS et Android. check:illustrations vérifie les identifiants du catalogue, l’index fourni, les associations réelles du registre, les fichiers, dimensions 5:7 et empreintes des originaux. Le contrôle alpha des cadres/sachets reste séparé, car les peintures n’ont pas vocation à être transparentes.
