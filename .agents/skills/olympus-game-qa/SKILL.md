---
name: olympus-game-qa
description: Verify OLYMPUS game changes through automated tests, mobile checks, accessibility and regression reviews.
---


# Game QA workflow
1. Identify the stack, scripts, test coverage, current git diff and the feature's acceptance criteria.
2. Run relevant existing formatting, lint, type-check, unit/integration tests and production build. Do not claim any test passed unless actually run.
3. Prioritize critical flows: view cards by rarity, open a pack exactly once, persist collection, search/filter, navigate touch UI and rotate a card.
4. Add regression tests for bugs found. Prefer deterministic fixtures and seeded test RNG; never modify live game state to simulate tests.
5. Check mobile viewport, reduced-motion behavior, accessibility labels, scroll/drag conflicts, missing artwork and slow-device graceful degradation.
6. Flag race conditions, duplicated awards, inconsistent odds, save migrations and broken links between card IDs and assets.
7. Return a concise report with tests run, outcomes, remaining risks and exact reproduction steps for failures.
