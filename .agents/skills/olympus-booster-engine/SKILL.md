---
name: olympus-booster-engine
description: Implement or revise OLYMPUS booster opening, drop tables, pack inventory and reveal mechanics.
---


# Booster engine workflow
1. Inspect existing pack definitions, probability tables, RNG, inventory, persistence, currency and API boundaries.
2. Use the game-approved weights, slot guarantees and eligibility rules. If none exist, request a specification or implement a clearly labeled configurable placeholder; never silently invent production rates.
3. Keep pack rolls separate from animations: one authorized open action generates one immutable result that the UI reveals without rerolling.
4. For server-backed or paid/valuable packs, resolve outcomes server-side using suitable randomness, transaction IDs and atomic inventory updates; do not trust client-supplied results.
5. Support duplicates according to existing rules, empty inventory, interrupted animations, reloads and network failures; avoid double grants from repeated taps.
6. Test distributions with deterministic seedable RNG for tests only; test slot guarantees, boundaries, persistence, idempotency and reveal sequencing.
7. Preserve original booster art; any carousel or wheel must remain mobile accessible and not affect actual probabilities unless explicitly designed to.
