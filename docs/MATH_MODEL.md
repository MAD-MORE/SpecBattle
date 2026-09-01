# Spec Battle — Mathematical & Statistical Model v1

## Objective

Produce a reproducible phone-vs-phone result from validated specifications while making the calculation explainable.

## 1. Specification record

Every specification is defined by:

- `key`: stable identifier
- `category`: logical group
- `unit`: normalized measurement unit
- `comparison_direction`: higher, lower, or custom
- `default_weight`: contribution inside its category
- `model_version`: version of the scoring rules
- `confidence`: confidence in the source/value

## 2. Pairwise normalization

For a numerical specification where larger is better:

`S_A = (A - min(A,B)) / (max(A,B) - min(A,B))`

`S_B = (B - min(A,B)) / (max(A,B) - min(A,B))`

For a numerical specification where smaller is better:

`S_A = (max(A,B) - A) / (max(A,B) - min(A,B))`

`S_B = (max(A,B) - B) / (max(A,B) - min(A,B))`

When `A = B`, both scores are `0.5` and the specification is a draw.

This MVP uses pairwise normalization so the battle asks a direct question: how does this phone compare with this opponent?

## 3. Category aggregation

For each category:

`C_A = sum(w_i * S_Ai) / sum(w_i)`

`C_B = sum(w_i * S_Bi) / sum(w_i)`

Only valid comparable specifications participate.

## 4. Overall aggregation

Version 1 uses the mean of the available category scores:

`O_A = mean(C_A1 ... C_An)`

`O_B = mean(C_B1 ... C_Bn)`

This keeps category influence balanced while the specification weights control importance inside a category. A future model version may introduce explicit category weights after validation against real battle data.

## 5. Missing data

If one or both phones lack a valid value, the specification is `UNKNOWN` and does not award a point to either side.

The system records the number of comparable and unknown specifications.

## 6. Confidence

Each comparable specification has a source confidence in `[0,1]`. Battle confidence is the mean confidence across comparable specifications. This is reported separately from the score.

## 7. Correlated specifications

Specifications that measure substantially overlapping concepts must not create hidden double-counting. The data model therefore places related fields under categories and assigns explicit weights. Future versions can apply correlation analysis using historical data to regularize weights.

## 8. Winner rule

Use a deterministic epsilon for floating-point comparisons. If `O_A > O_B + epsilon`, A wins. If `O_B > O_A + epsilon`, B wins. Otherwise the battle is a draw.

## 9. League rating

The initial league model is Elo-style with starting rating `1500` and `K=32`.

Expected score for A:

`E_A = 1 / (1 + 10^((R_B - R_A)/400))`

New rating:

`R'_A = R_A + K(S_A - E_A)`

where `S_A` is `1` for an A win, `0` for a B win, and `0.5` for a draw.

Separate rating streams are maintained for overall and category leagues.

## 10. Explainability

Every battle result should retain:

- specification-level winners
- normalized scores
- specification weights
- category scores
- overall scores
- comparable count
- unknown count
- confidence
- model version

This makes a result auditable instead of a black-box number.

## 11. Important limitation

A specification value is not necessarily a real-world performance metric. For example, camera megapixels, battery capacity, CPU clock speed, and RAM capacity can be poor standalone proxies for user experience. Custom scoring functions and trusted benchmark data should be introduced only when the underlying data is defensible. Model changes must be versioned.
