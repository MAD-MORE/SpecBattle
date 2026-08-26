# API Architecture

## MVP endpoints
POST /api/battles - validate two device IDs, calculate a deterministic battle, persist it, return the battle result.
GET /api/battles/:id - return a persisted battle and its rounds.
GET /api/devices/:id - return normalized device data.

## Rules
API handlers validate input with Zod, authorize access where required, call services, and return stable DTOs. Database errors are not exposed directly to clients.

## Future multiplayer endpoints
POST /api/battle-rooms - create room.
POST /api/battle-rooms/:id/join - join room.
POST /api/battle-rooms/:id/ready - mark player ready.
The WebSocket layer will then publish canonical battle events for the room.
