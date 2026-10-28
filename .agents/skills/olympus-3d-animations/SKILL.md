---
name: olympus-3d-animations
description: Build or refine OLYMPUS 3D card spins, touch gestures, holographic effects, booster wheel and reveal motion.
---


# 3D animation workflow
1. Inspect graphics stack and existing components before choosing CSS transforms, Canvas, WebGL or Three.js. Prefer the least complex solution that achieves the result.
2. For card inspection, implement 360-degree horizontal rotation and optional tilt through pointer/touch gestures; use controlled camera perspective and consistent front/back art.
3. Keep animation state separate from game state. Cancel or clean up animation frames/listeners and dispose GPU resources when components unmount.
4. Make tap/drag thresholds explicit so scrolling on phones remains usable. Add keyboard and pointer alternatives where appropriate.
5. Use rarity effects sparingly; respect prefers-reduced-motion and graphics quality settings. Avoid expensive unbounded shaders and excessive textures.
6. For the home booster wheel, maintain stable item selection, responsive drag/snapping, and an accessible nonanimated option. Do not conflate visual selection with random draw odds.
7. Test real card proportions, high-DPI layouts, touch interaction, back-face rendering, low-end device fallback and frame-time regressions.
