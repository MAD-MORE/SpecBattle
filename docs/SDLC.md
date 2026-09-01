# Spec Battle — Software Development Life Cycle

## 1. Product Vision

Spec Battle is an Android application that settles smartphone debates by allowing two users to connect their phones, compare their specifications mathematically, watch the phones battle in real time, and record results in overall and category-specific leagues.

**Core promise:** Stop arguing. Let the phones battle.

## 2. Problem

Smartphone users often debate which phone is better. Raw specifications are difficult to compare objectively because specifications use different units, have different meanings, and can favor different devices. Spec Battle provides a transparent, data-driven comparison and turns the result into an entertaining real-time battle.

## 3. MVP Scope

- Android APK
- Two-user phone-vs-phone battles
- Real-time battle synchronization
- Phone specification database
- Comparison of every valid comparable specification available
- Mathematical normalization and statistical scoring
- Category and overall results
- Animated 3D phone battle
- Battle history
- Overall phone league
- Category-specific leagues
- Data-quality/confidence indicators

## 4. Technology Stack

### Android
- Kotlin
- Jetpack Compose
- Android device APIs
- Google Filament for real-time 3D rendering

### Backend
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Realtime
- Supabase Storage
- Supabase Edge Functions

### Source control / CI
- GitHub
- GitHub Actions

## 5. High-Level Architecture

```text
                         SPEC BATTLE
                              |
                   +----------+----------+
                   |                     |
                USER A                USER B
                   |                     |
                Android                Android
                   |                     |
                   +----------+----------+
                              |
                       REAL-TIME LAYER
                              |
                              v
                      BATTLE COORDINATOR
                              |
                              v
                    SPECIFICATION ENGINE
                              |
                    +---------+---------+
                    |                   |
              MATHEMATICS          STATISTICS
                    |                   |
                    +---------+---------+
                              |
                              v
                         BATTLE RESULT
                              |
                    +---------+---------+
                    |                   |
                 3D BATTLE           LEAGUE
                 ANIMATION           RATINGS
```

## 6. Functional Requirements

### FR-01 Authentication
Users can create accounts and securely authenticate.

### FR-02 Device Identification
The Android app identifies the user's device and obtains specifications available through Android APIs.

### FR-03 Phone Specification Model
A phone has a structured specification profile covering processor, GPU, RAM, storage, display, battery, charging, cameras, video, audio, connectivity, sensors, software, physical characteristics, and other available specifications.

### FR-04 Battle Creation
A user can create a battle and receive a battle identifier.

### FR-05 Battle Joining
A second user can join an existing battle and become the opponent.

### FR-06 Ready State
Both players must be ready before the battle starts.

### FR-07 Real-Time Synchronization
Battle state and battle events are synchronized between both clients using Supabase Realtime.

### FR-08 Specification Comparison
Every valid comparable specification available for both phones is considered by the comparison engine. Missing data must not automatically count as a loss.

### FR-09 Mathematical Scoring
Specifications are converted to comparable normalized scores before aggregation.

### FR-10 Statistical Scoring
Specification and category weights are used to calculate category and overall scores while avoiding double-counting correlated measurements.

### FR-11 Battle Animation
The mathematical result drives the 3D battle animation. Animation never determines the winner.

### FR-12 League Updates
Completed battles update overall and category-specific phone ratings.

### FR-13 History
Users can view completed battle results and analysis.

## 7. Specification Categories

Initial categories:

- Performance
- Display
- Camera
- Battery
- Connectivity
- Audio / Multimedia
- Physical / Build
- Storage / Memory
- Software
- Other validated specifications

The schema must allow new categories without redesigning the database.

## 8. Mathematical Model

### 8.1 Normalization

For a higher-is-better numerical attribute:

`S = (x - xmin) / (xmax - xmin)`

For a lower-is-better attribute:

`S = (xmax - x) / (xmax - xmin)`

Normalization must account for units, direction, invalid values, and edge cases such as equal minimum and maximum values.

### 8.2 Specification Aggregation

A category score can be calculated as:

`Cj = sum(wi * Si)`

where `Si` is a normalized specification score and `wi` is its normalized weight.

### 8.3 Overall Score

`Overall = sum(Wj * Cj)`

where `Cj` is a category score and `Wj` is the category weight.

Weights must be versioned and configurable rather than permanently hard-coded.

### 8.4 Correlation / Double Counting

Related specifications must not accidentally dominate the model. The system should group correlated measurements or cap their combined contribution.

### 8.5 Missing Data

Unknown or unavailable specifications are marked as unknown/not comparable. They do not automatically award the opponent a point.

### 8.6 Data Confidence

The system should track specification coverage and source confidence separately from the battle score. A result can be decisive while still having low data confidence if the dataset is incomplete.

## 9. Statistical League Model

The league should use a rating model rather than simply counting wins. An Elo-style model is the initial candidate:

`EA = 1 / (1 + 10^((RB - RA) / 400))`

`RA' = RA + K * (SA - EA)`

The exact rating model and K-factor will be validated during testing.

Ratings are maintained for:

- Overall league
- Performance league
- Display league
- Camera league
- Battery league
- Gaming/performance-derived league where supported
- Connectivity league
- Other supported categories

## 10. Authoritative Battle Architecture

Clients must not be trusted to decide the winner.

```text
Phone A ----+
            |
Phone B ----+--> Authoritative Battle Engine --> Result --> Database

Realtime distributes battle state/events to both clients.
```

The final result and rating update are performed server-side.

## 11. Database Design

Core tables:

- `profiles`
- `phones`
- `specification_definitions`
- `phone_specifications`
- `battles`
- `battle_players`
- `battle_rounds`
- `battle_events`
- `battle_results`
- `phone_ratings`
- `category_ratings`

### Specification definition

Suggested fields:

- id
- name
- category
- unit
- comparison_direction
- normalization_method
- default_weight
- model_version

### Phone specification

Suggested fields:

- phone_id
- specification_id
- value
- source
- confidence
- verified_at

## 12. Battle State Machine

```text
CREATED
  |
WAITING_FOR_OPPONENT
  |
PLAYER_JOINED
  |
READY
  |
RUNNING
  |
ROUND_COMPLETE
  |
FINISHED
  |
RATINGS_UPDATED
```

Important failure states include cancellation, timeout, disconnect, and recovery/reconnection.

## 13. Real-Time Events

Initial event types:

- `BATTLE_CREATED`
- `PLAYER_JOINED`
- `PLAYER_READY`
- `BATTLE_START`
- `ROUND_START`
- `SPEC_RESULT`
- `SCORE_UPDATE`
- `ROUND_END`
- `BATTLE_END`
- `BATTLE_CANCELLED`
- `PLAYER_DISCONNECTED`
- `PLAYER_RECONNECTED`

## 14. Front-End UX

Primary navigation:

- Battle
- Leagues
- History
- My Phone

Battle flow:

```text
Home
  -> Create / Join Battle
  -> Battle Lobby
  -> Ready
  -> Countdown
  -> 3D Battle
  -> Category Results
  -> Overall Result
  -> League Update
```

The UI should clearly explain why a phone won or lost.

## 15. 3D Battle System

Google Filament is the planned Android 3D renderer.

The 3D layer is presentation-only:

```text
Battle Engine
    -> Battle Event
    -> Animation Controller
    -> Filament
    -> 3D phone action
```

Examples include attacks, defensive reactions, category transitions, score effects, and victory animations.

## 16. Development Phases

### Phase 1 — Foundation
- Android project
- Supabase project
- Repository structure
- Authentication
- Base navigation

### Phase 2 — Data Model
- Phone schema
- Specification definitions
- Phone specification records
- Validation rules
- Data confidence

### Phase 3 — Mathematics Engine
- Unit conversion
- Normalization
- Weighting
- Category aggregation
- Overall scoring
- Missing-data handling
- Model versioning

### Phase 4 — Battle Engine
- Battle creation
- Joining
- Ready state
- State machine
- Server-authoritative calculation
- Realtime events

### Phase 5 — Android Battle UI
- Lobby
- Countdown
- Category screens
- Results
- Battle history

### Phase 6 — 3D
- Filament integration
- 3D phone models
- Arena
- Lighting/materials
- Battle animations
- Victory sequence

### Phase 7 — League
- Rating system
- Overall ranking
- Category rankings
- Rating history

### Phase 8 — Testing and Hardening
- Unit tests
- Integration tests
- Realtime tests
- Statistical validation
- Security testing
- Performance testing

### Phase 9 — Release
- Internal testing
- Closed testing
- Production release
- Monitoring

## 17. Testing Strategy

### Unit Tests
Test normalization, weighting, scoring, confidence, tie handling, and rating calculations.

### Integration Tests
Test Android -> Supabase -> battle engine -> database -> Realtime flows.

### Realtime Tests
Test disconnects, reconnects, duplicate events, latency, simultaneous actions, timeouts, and server restart/recovery.

### Statistical Tests
Test dominant wins, split category wins, equal phones, missing data, extreme values, correlated specifications, and model-version reproducibility.

## 18. Security

- Supabase Row Level Security
- Server-authoritative battle results
- Protected rating updates
- Input validation
- Specification validation
- Anti-tampering checks
- Battle authorization
- Secure authentication

Users must not be able to directly modify battle winners or league ratings.

## 19. CI/CD

Every meaningful change should pass appropriate automated checks before release:

```text
Git push
  -> CI
  -> Build
  -> Unit tests
  -> Integration tests
  -> Security checks
  -> APK artifact
```

## 20. Maintenance and Model Evolution

The scoring model must be versioned:

- Model v1
- Model v2
- Model v3

Historical battles must retain the model version used to calculate them so results remain reproducible.

Specification corrections should be audited and traceable.

## 21. Definition of Done for MVP

Spec Battle MVP is complete when:

1. Two authenticated Android users can connect to a battle.
2. Both phones have valid specification profiles.
3. The engine compares all valid comparable specifications in the model.
4. Mathematical normalization and statistical weighting produce reproducible results.
5. The server determines the authoritative winner.
6. Both clients receive synchronized battle events.
7. The 3D battle animation accurately represents the calculated events.
8. The final result is saved.
9. Overall and category ratings update correctly.
10. Users can inspect the reasons behind the result.
11. Missing data and confidence are clearly represented.
12. Automated tests cover the critical battle and scoring paths.

## 22. First Engineering Deliverable

Before implementing the 3D battle UI, produce and approve the **formal specification catalog, database schema, and mathematical scoring specification**. These become the contract for the rest of the system.
