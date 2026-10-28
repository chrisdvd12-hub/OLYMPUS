# Ressources détourées

Les PNG du manifeste artwork.manifest.json sont les versions détourées : extérieur transparent, et fenêtre centrale transparente pour les cadres seuls. Les marbres, dorures et panneaux de texte restent opaques. Les JPG originaux restent des références et ne doivent pas remplacer ces PNG dans le rendu final.

Les sept cadres de frames/ sont communs aux quatre extensions, dans l’ordre commune, peu commune, rare, épique, légendaire, mythique et divine. Ils sont utilisés par CardFront pour les cartes dont le recto complet n’a pas été approuvé ; les illustrations manquantes sont signalées « Illustration à fournir ». Zeus utilise son recto complet approuvé, avec extérieur détouré. Les cadres sont partagés et les originaux restent conservés.

Pour chaque nouvelle ressource : conserver l’original, produire un PNG avec canal alpha, vérifier visuellement les bords sur fond clair et sombre, ajouter le PNG au manifeste puis lancer `npm run check:artwork`. Les rectos terminés doivent conserver un intérieur opaque. Ne pas supprimer le blanc du marbre ou des nuages. Ne pas ajouter de rectangle opaque derrière le PNG dans l’application.

Le contrôle automatique vérifie les coins extérieurs, la présence de transparence et d’ornements opaques, la fenêtre des cadres et leurs panneaux de texte. Il complète la vérification visuelle, sans garantir à lui seul chaque pixel du contour. Tout nouveau recto composé est présenté au propriétaire avant publication.
