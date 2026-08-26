# Battle UI and Animation

SpecBattle is a one-page battle arena. Only one spec card is the active focus at a time.

Sequence: BATTLE START -> Performance -> Camera -> Display -> Battery -> Storage -> Connectivity -> Final Score -> Winner.

For every spec: enter -> reveal both devices -> animate scores -> resolve winner -> exit -> next spec.

The next card enters only after the previous card reaches its exit state. Scoring is independent from animation timing.

Motion states: initial, entering, revealed, resolving, winner/loser, exiting.

Respect prefers-reduced-motion by replacing large transforms with short fades while preserving the same information and sequence. Mobile-first responsive layout; desktop changes sizing, not battle logic.
