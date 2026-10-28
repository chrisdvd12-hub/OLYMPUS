# OLYMPUS — Project instructions for Codex

OLYMPUS is a Greek-mythology-themed collectible card game. Preserve the existing game, architecture, UI, content, and mechanics. Do not restart or rewrite the project unless explicitly requested.

## First steps for every task
1. Inspect the repository structure, package manifest, existing AGENTS.md, source assets, catalog, tests and current git diff.
2. State assumptions briefly; treat repository files and user-approved designs as the source of truth. Do not invent card names, rarity counts, extension contents, probabilities or gameplay rules.
3. Make minimal, reversible changes consistent with the existing tech stack. Avoid introducing dependencies unless necessary.
4. Never overwrite original artwork, frames, back designs, or catalog data. Separate source assets from generated derivatives.
5. Run relevant available tests, type checks, lint and build. Report tests not run and why.
6. At completion, explain changed files, observed outcomes and outstanding issues.

## Visual and data contracts
- Card illustration target is 750 × 1050 px (5:7 portrait), PNG, unless a project-specific specification supersedes it.
- Render artwork, rarity frame, labels and effects as separate layers when the existing system permits.
- Rarity frame artwork should remain identical across cards of the same rarity. Different card illustrations should use varied compositions and poses.
- Keep exact canonical card IDs, expansion, name, rarity and localization from the supplied catalog; never derive identity from array index.
- Prefer accessible, touch-friendly mobile UI, graceful fallback for reduced motion and low-end devices.
- Preserve save compatibility and never silently reset user collections.

## Skill routing
Use `olympus-card-designer` for card layout/assets; `olympus-booster-engine` for packs and randomization; `olympus-3d-animations` for previews and animation; `olympus-collection-manager` for inventory/filters; `olympus-mythology-database` for catalog/import/lore; `olympus-game-qa` for verification. Use multiple skills only if the task truly crosses their scopes.
