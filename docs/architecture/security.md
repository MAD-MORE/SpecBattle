# Security and Reliability

- Validate every API input server-side.
- Never trust client-submitted scores or winners.
- Keep scoring code deterministic and versioned.
- Use authorization for private user/device mutations.
- Rate-limit battle creation and room actions when multiplayer exists.
- Sanitize user-controlled display names.
- Do not expose database credentials to the browser.
- Handle missing device specs explicitly and expose an unavailable state instead of inventing data.
- Record rules_version on completed battles for auditability.
