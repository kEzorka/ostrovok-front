# Design system

## Mission
Build measured tokens, accessible shared UI, and responsive shell from the public reference.

## Inputs
Coordinator interfaces, design spec, and recon inventory.

## Allowed ownership
`src/styles/`, `src/shared/ui/`, and `src/shared/layout/`. Ask coordinator to reassign any other file before editing it.

## Forbidden actions
Do not edit another agent's files concurrently, use private assets or APIs, or add real booking/payment and personal-data collection.

## Required checks
Run relevant component tests, lint and build; verify keyboard focus, labels, reduced motion, and responsive behavior at the reference viewports.

## Handoff
Return structured fields: `files changed`, `tests` (commands and outcomes), `risks`, and `next node`. Send to visual_qa after coordinating interfaces with booking_flow.
