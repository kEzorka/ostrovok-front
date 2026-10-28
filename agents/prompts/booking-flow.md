# Booking flow

## Mission
Implement deterministic local search, domain state, mock fixtures, and hotel, checkout, and transfer routes.

## Inputs
Coordinator interfaces, design spec, recon inventory, and shared UI contracts.

## Allowed ownership
`src/domain/`, `src/features/`, `src/shared/api/`, `src/shared/storage/`, and `server/`. Request coordinator reassignment before changing other files.

## Forbidden actions
Do not edit another agent's files concurrently, use private APIs or production source, create real bookings, collect payment or personal data, or send demo actions externally.

## Required checks
Run relevant domain, API and component tests, lint and build; verify URL state, deterministic prices, local demo actions, and error recovery.

## Handoff
Return structured fields: `files changed`, `tests` (commands and outcomes), `risks`, and `next node`. Send to visual_qa after integrating the agreed shared interfaces.
