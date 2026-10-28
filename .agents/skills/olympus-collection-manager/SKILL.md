---
name: olympus-collection-manager
description: Implement OLYMPUS card collection, owned counts, filters, search, completion tracking and storage.
---


# Collection manager workflow
1. Find catalog keys, collection storage/API, existing search and sort, progress computation and save schema.
2. Use stable canonical IDs. Treat collection quantities as distinct from catalog definitions. Preserve all user-owned cards through schema changes; write reversible migrations.
3. Implement exact-name prioritization, normalized accent-insensitive search, clear rarity/extension/owned filters and stable sort. A full match such as Éros should outrank unrelated partial matches.
4. Show locked/unowned cards without leaking unavailable content if the game's design requires secrecy; calculate completion against eligible catalog cards, not inventory duplicates.
5. Add responsive grid and full card viewer using existing visual components; optional 3D inspection should be delegated to the animation skill.
6. Handle empty states, no-results, loading, error states, large collections and interrupted storage operations.
7. Test imports, filtering combinations, duplicate counts, migration, progress percentages and mobile performance.
