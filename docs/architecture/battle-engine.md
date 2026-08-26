# Battle Engine Specification

## Core rounds
MVP uses six scoring rounds:
1. Performance
2. Camera
3. Display
4. Battery
5. Storage
6. Connectivity

The seventh state is the final result and is not a spec round.

## Engine contract
Input: two normalized Device objects and a BattleConfig.
Output: deterministic BattleResult containing ordered RoundResult records, total scores, winner, and tie state.

The engine must be pure: same inputs and rules produce the same output. UI timing, animation, database calls, and sockets never belong inside the scoring functions.

## Round lifecycle
IDLE -> READY -> BATTLE_START -> ROUND_ENTER -> REVEAL -> RESOLVE -> ROUND_EXIT -> next round -> FINAL_SCORE -> WINNER.

## Scoring
Each category produces a normalized score from 0-100 for each device. Category weights are configurable, but the MVP defaults to equal weighting. Missing data is handled explicitly and never silently treated as zero.

## Tie handling
If total scores are equal within the configured precision, result is TIE. The UI may show a rematch/compare-again action.
