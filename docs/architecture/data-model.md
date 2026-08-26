# Data Model

## users
id, username, email, created_at.

## devices
id, owner_id (nullable for catalog devices), brand, model, image_url, specs_json, created_at, updated_at.

## battles
id, device_a_id, device_b_id, status, winner_device_id (nullable), score_a, score_b, rules_version, created_at, completed_at.

## battle_rounds
id, battle_id, spec_key, score_a, score_b, winner_device_id (nullable), sequence, created_at.

## Relationships
users 1-to-many devices. devices participate in many battles through battles. battles 1-to-many battle_rounds.

Store the rules_version with each completed battle so historical results remain explainable after scoring rules evolve.
