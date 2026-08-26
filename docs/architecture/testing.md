# Testing Architecture

Unit tests cover each spec scorer, normalization, weighted totals, ties, missing-data behavior, and battle state transitions.

Integration tests cover API validation, battle persistence, and retrieval.

Browser tests cover the one-page experience: battle starts, one card appears at a time, each card resolves and exits, the next card enters, and the final winner is shown.

Animation tests should assert state transitions and accessible content rather than brittle pixel timing.
