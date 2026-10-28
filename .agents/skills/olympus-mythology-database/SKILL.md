---
name: olympus-mythology-database
description: Import, validate and maintain OLYMPUS Greek mythology card catalog, expansions, rarity and character lore.
---


# Mythology database workflow
1. Locate source-of-truth spreadsheets, JSON, database schema and character reference assets. Never assume a specific expansion/card count from memory.
2. Inventory explicit columns, extension identifiers, card numbers, names, rarity and descriptions; map them to the existing schema and document unknowns.
3. Validate unique canonical IDs, exact expansion membership, missing mandatory fields, image mapping, duplicate rows and invalid cross-references.
4. Separate canonical catalog fields from optional educational lore; avoid inventing mythology facts and distinguish variant traditions when needed.
5. Import via idempotent scripts with dry-run preview, error report and rollback/backup strategy. Do not overwrite existing descriptions without explicit authorization.
6. Keep Unicode and French accents intact; add normalized search indexes separately rather than rewriting display names.
7. Test completeness by extension and rarity using the source catalog, report counts and unresolved rows, and preserve all prior collection references.
