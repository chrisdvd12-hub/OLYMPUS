---
name: olympus-card-designer
description: Design or update OLYMPUS collectible card layouts, layered rarity frames, artwork handling and rendering.
---


# Card designer workflow
1. Identify the current card component, data schema, rarity styles, asset directories and existing image dimensions. Inspect exemplar cards, especially the approved divine Zeus design if present.
2. Confirm the canonical rarity taxonomy from project files; do not create new rarities or change existing frames without a request.
3. Define a reusable layout with separate layers for illustration, approved frame, text, rarity effects and interactive overlay. Keep one shared geometry for every card.
4. Check PNG artwork at 750 x 1050 px (5:7) and support other input sizes through explicit contain/crop rules without distortion. Preserve original files and transparency.
5. Keep art direction consistent while varying character poses, silhouettes, framing and backgrounds; do not reuse a single pose across the entire set.
6. Ensure readable text, stable alignment, no clipping and accessible alt text. Verify representative card per rarity and long names on mobile and desktop.
7. Add or update visual/unit tests if infrastructure exists, then report changed files and unresolved assets.

Never imply that instructions alone can render missing images: use available image assets or an authorized image-generation workflow.
