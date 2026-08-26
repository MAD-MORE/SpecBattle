# Realtime Architecture

## MVP
No WebSocket server. A completed battle is calculated from validated device data and the client plays the returned deterministic round sequence locally with Motion.

## Multiplayer
Use an authoritative Battle Room service. Each room has a room ID, two player slots, canonical state, sequence number, and rules version. Clients send commands; the server validates them and broadcasts events.

Event examples: room.joined, player.ready, battle.started, round.started, round.resolved, round.completed, battle.completed, player.disconnected, battle.cancelled.

The UI consumes the same BattleState regardless of whether events came from a local engine result or a WebSocket transport.
