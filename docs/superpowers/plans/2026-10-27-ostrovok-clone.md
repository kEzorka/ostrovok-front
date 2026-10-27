# Ostrovok Clone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, fully clickable local clone of Ostrovok's public booking flow using mock data and no real booking or payment integrations.

**Architecture:** A Vite React application is split into feature modules for home, search, hotel, checkout, and transfers, with a small shared UI kit. Search state is serialized to query parameters, favorites are stored through a versioned localStorage adapter, and all catalog/pricing behavior is implemented as pure TypeScript domain functions over local fixtures.

**Tech Stack:** React, TypeScript, Vite, React Router, CSS modules/global design tokens, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-27-ostrovok-clone-design.md`

## Global Constraints

- No private Ostrovok APIs, copied production source, real authentication, real booking, payment collection, e-mail submission, or personal-data collection.
- All hotel and transfer data must be typed local fixtures; all demo actions remain local.
- Search state must survive refresh through query parameters; favorites and last search use a versioned localStorage adapter.
- Price is deterministic: base rate × nights × rooms.
- Support mobile `<768px`, tablet `768–1099px`, and desktop `>=1100px`.
- Interactive controls need keyboard access, visible focus, labels, and reduced-motion support.
- Use neutral locally bundled demo imagery with known reuse rights or project-owned placeholders.

## Review Focus

- Missing or malformed search query values fall back safely instead of crashing; covered in Task 2 parsing tests.
- Check-out before check-in is normalized to a valid one-night stay; covered in Task 2 date normalization tests.
- Filters producing zero hotels show a recoverable empty state and working reset; covered in Task 4 component tests.
- Unavailable or unknown rate IDs cannot produce a fake success; covered in Task 6 checkout tests.
- Corrupt or old localStorage payloads migrate or reset without breaking render; covered in Task 2 storage tests.

---

### Task 1: Application Foundation and Design System

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `eslint.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/app/routes.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/shared/ui/Button.tsx`
- Create: `src/shared/ui/Button.module.css`
- Create: `src/shared/ui/FieldShell.tsx`
- Create: `src/shared/ui/FieldShell.module.css`
- Create: `src/shared/layout/SiteHeader.tsx`
- Create: `src/shared/layout/SiteFooter.tsx`
- Create: `src/shared/layout/layout.module.css`
- Create: `src/test/setup.ts`
- Create: `src/app/App.test.tsx`
- Create: `.gitignore`

**Interfaces:**
- Produces: `App`, `appRoutes`, `Button`, `FieldShell`, `SiteHeader`, and `SiteFooter` used by all later tasks.
- Produces: scripts `dev`, `build`, `lint`, `test`, `test:watch`, and `e2e` in `package.json`.

- [ ] **Step 1: Write the failing shell test**

  Add `renders the shared shell and a route outlet` in `src/app/App.test.tsx`; assert the logo, navigation controls, and route content are visible.

- [ ] **Step 2: Run the shell test and verify failure**

  Run: `npm test -- src/app/App.test.tsx`
  Expected: FAIL because the app shell does not exist.

- [ ] **Step 3: Create the Vite/React foundation and shared shell**

  Implement the listed files, define the blue/green/neutral design tokens, global resets, responsive container, accessible `Button` variants, `FieldShell`, header, footer, and placeholder routes.

- [ ] **Step 4: Verify the foundation**

  Run: `npm test -- src/app/App.test.tsx`
  Expected: PASS.

  Run: `npm run lint`
  Expected: PASS.

  Run: `npm run build`
  Expected: a production bundle in `dist/`.

- [ ] **Step 5: Commit**

  Run: `git add package.json package-lock.json tsconfig.json tsconfig.app.json vite.config.ts vitest.config.ts playwright.config.ts eslint.config.js index.html src .gitignore`

  Run: `git commit -m "feat: scaffold ostrovok clone shell"`

---

### Task 2: Typed Fixtures, Search State, Pricing, and Persistence

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/fixtures/destinations.ts`
- Create: `src/domain/fixtures/hotels.ts`
- Create: `src/domain/fixtures/transfers.ts`
- Create: `src/domain/searchParams.ts`
- Create: `src/domain/searchParams.test.ts`
- Create: `src/domain/hotelSearch.ts`
- Create: `src/domain/hotelSearch.test.ts`
- Create: `src/domain/pricing.ts`
- Create: `src/domain/pricing.test.ts`
- Create: `src/shared/storage/appStorage.ts`
- Create: `src/shared/storage/appStorage.test.ts`
- Create: `src/assets/hotels/README.md`
- Create: `src/assets/hotels/city-grand.webp`
- Create: `src/assets/hotels/river-view.webp`
- Create: `src/assets/hotels/garden-house.webp`
- Create: `src/assets/hotels/modern-loft.webp`
- Create: `src/assets/hotels/atrium.webp`
- Create: `src/assets/hotels/classic-suite.webp`

**Interfaces:**
- Produces: `SearchState`, `Hotel`, `HotelRate`, `TransferOption`, `HotelFilters`, and `SortMode` types.
- Produces: `parseSearchParams(params: URLSearchParams, today?: Date): SearchState`.
- Produces: `serializeSearchState(state: SearchState): URLSearchParams`.
- Produces: `filterAndSortHotels(hotels: Hotel[], state: SearchState, filters: HotelFilters, sort: SortMode): Hotel[]`.
- Produces: `calculateStayPrice(rate: HotelRate, state: SearchState): number`.
- Produces: `appStorage.getFavorites()`, `setFavorites(ids)`, `getLastSearch()`, and `setLastSearch(state)`.

- [ ] **Step 1: Write failing query and date tests**

  Assert round-trip serialization, safe defaults for malformed guests/rooms, normalization of reversed dates to one night, and ignored unknown parameters.

- [ ] **Step 2: Write failing filtering, pricing, and storage tests**

  Assert combined filters, stable sort order, deterministic multiplication, duplicate-free favorites, corrupt JSON recovery, and migration from storage version `0` to `1`.

- [ ] **Step 3: Run the domain tests and verify failure**

  Run: `npm test -- src/domain src/shared/storage`
  Expected: FAIL because the domain modules do not exist.

- [ ] **Step 4: Implement types, at least 12 hotels, 6 transfers, and pure domain functions**

  Include multiple hotel types, star ratings, meal/cancellation combinations, amenities, distances, and price bands so every filter has meaningful results.

- [ ] **Step 5: Add and document local demo imagery**

  Store optimized WebP files locally and record source/license notes in `src/assets/hotels/README.md`.

- [ ] **Step 6: Verify domain behavior**

  Run: `npm test -- src/domain src/shared/storage`
  Expected: PASS.

- [ ] **Step 7: Commit**

  Run: `git add src/domain src/shared/storage src/assets`

  Run: `git commit -m "feat: add booking domain and demo catalog"`

---

### Task 3: Search Controls and Home Page

**Files:**
- Create: `src/features/home/HomePage.tsx`
- Create: `src/features/home/HomePage.module.css`
- Create: `src/features/home/HomePage.test.tsx`
- Create: `src/features/search-form/HotelSearchForm.tsx`
- Create: `src/features/search-form/HotelSearchForm.test.tsx`
- Create: `src/features/search-form/DestinationCombobox.tsx`
- Create: `src/features/search-form/DateRangePicker.tsx`
- Create: `src/features/search-form/GuestsPopover.tsx`
- Create: `src/features/search-form/TransferSearchForm.tsx`
- Create: `src/features/search-form/searchForm.module.css`
- Create: `src/shared/ui/Modal.tsx`
- Create: `src/shared/ui/Popover.tsx`
- Modify: `src/app/routes.tsx`

**Interfaces:**
- Consumes: `SearchState`, destination/transfer fixtures, serializers, shared shell/UI.
- Produces: `HotelSearchForm({ initialState, onSubmit })` and `TransferSearchForm({ onSubmit })`.
- Route contract: hotel submit navigates to `/search?<serialized state>`; transfer submit navigates to `/transfers?<serialized transfer state>`.

- [ ] **Step 1: Write failing hotel-form component tests**

  Assert destination keyboard selection, date validation, room/adult/child controls, apartment toggle, trip type, and exact `/search` navigation parameters.

- [ ] **Step 2: Write failing transfer-form and responsive-content tests**

  Assert one-way/round-trip fields, passenger selection, `/transfers` navigation, hero tabs, benefits, app block, subscription presentation, and footer landmarks.

- [ ] **Step 3: Run the home tests and verify failure**

  Run: `npm test -- src/features/home src/features/search-form`
  Expected: FAIL because the controls and page do not exist.

- [ ] **Step 4: Implement accessible search controls and the home page**

  Match the observed Ostrovok layout and states without submitting newsletter or personal data; the subscription CTA shows a local informational message only.

- [ ] **Step 5: Verify the home feature**

  Run: `npm test -- src/features/home src/features/search-form`
  Expected: PASS.

  Run: `npm run build`
  Expected: PASS.

- [ ] **Step 6: Commit**

  Run: `git add src/features src/shared/ui src/app/routes.tsx`

  Run: `git commit -m "feat: build responsive search home"`

---

### Task 4: Hotel Search Results, Filters, Favorites, and Local Map

**Files:**
- Create: `src/features/search/SearchPage.tsx`
- Create: `src/features/search/SearchPage.module.css`
- Create: `src/features/search/SearchPage.test.tsx`
- Create: `src/features/search/HotelCard.tsx`
- Create: `src/features/search/FilterDrawer.tsx`
- Create: `src/features/search/SortSelect.tsx`
- Create: `src/features/search/LocalMap.tsx`
- Create: `src/features/search/useHotelSearch.ts`
- Modify: `src/app/routes.tsx`

**Interfaces:**
- Consumes: query parser, `filterAndSortHotels`, fixtures, `appStorage`, `HotelSearchForm` summary mode.
- Produces: `SearchPage`, reusable `HotelCard`, and `useHotelSearch(searchParams)`.
- Route contract: card click navigates to `/hotel/:slug?<current search params>`.

- [ ] **Step 1: Write failing search-page tests**

  Assert initial cards from URL state, sort order, multi-filter composition, live result count, favorite persistence, list/map toggle, marker/card synchronization, and selected category tabs.

- [ ] **Step 2: Add the zero-results review-focus test**

  Apply incompatible filters, assert the empty state, click reset, and assert the original results return.

- [ ] **Step 3: Run search tests and verify failure**

  Run: `npm test -- src/features/search`
  Expected: FAIL because the results feature does not exist.

- [ ] **Step 4: Implement the search feature**

  Use a desktop sidebar and mobile filter drawer, sticky query summary, responsive cards, and a CSS local map with deterministic marker positions from fixtures.

- [ ] **Step 5: Verify search behavior**

  Run: `npm test -- src/features/search`
  Expected: PASS.

  Run: `npm run build`
  Expected: PASS.

- [ ] **Step 6: Commit**

  Run: `git add src/features/search src/app/routes.tsx`

  Run: `git commit -m "feat: add interactive hotel search results"`

---

### Task 5: Hotel Details, Gallery, Rates, Amenities, and Reviews

**Files:**
- Create: `src/features/hotel/HotelPage.tsx`
- Create: `src/features/hotel/HotelPage.module.css`
- Create: `src/features/hotel/HotelPage.test.tsx`
- Create: `src/features/hotel/HotelGallery.tsx`
- Create: `src/features/hotel/RateFilters.tsx`
- Create: `src/features/hotel/RoomRateCard.tsx`
- Create: `src/features/hotel/HotelSections.tsx`
- Modify: `src/app/routes.tsx`

**Interfaces:**
- Consumes: hotel/rate fixtures, query parser, pricing, shared modal, search summary.
- Produces: `HotelPage` and route `/hotel/:slug`.
- Route contract: a rate CTA navigates to `/checkout/:rateId?<current search params>`.

- [ ] **Step 1: Write failing hotel-page tests**

  Assert gallery navigation, hotel metadata, date/guest summary, rate filtering by bed/meal/payment/cancellation, price calculation, amenities expansion, reviews, and similar-hotel navigation.

- [ ] **Step 2: Write failing missing-hotel test**

  Visit an unknown slug, assert a helpful not-found state and a link back to search.

- [ ] **Step 3: Run hotel tests and verify failure**

  Run: `npm test -- src/features/hotel`
  Expected: FAIL because the hotel feature does not exist.

- [ ] **Step 4: Implement the hotel detail experience**

  Reproduce the observed information hierarchy: media, title/rating/address, search summary, available options, room/rate matrix, location panel, description, amenities, policies, reviews, and sticky mobile price CTA.

- [ ] **Step 5: Verify hotel behavior**

  Run: `npm test -- src/features/hotel`
  Expected: PASS.

  Run: `npm run build`
  Expected: PASS.

- [ ] **Step 6: Commit**

  Run: `git add src/features/hotel src/app/routes.tsx`

  Run: `git commit -m "feat: add hotel details and rate selection"`

---

### Task 6: Demo Checkout and Transfer Results

**Files:**
- Create: `src/features/checkout/CheckoutPage.tsx`
- Create: `src/features/checkout/CheckoutPage.module.css`
- Create: `src/features/checkout/CheckoutPage.test.tsx`
- Create: `src/features/transfers/TransfersPage.tsx`
- Create: `src/features/transfers/TransfersPage.module.css`
- Create: `src/features/transfers/TransfersPage.test.tsx`
- Modify: `src/app/routes.tsx`

**Interfaces:**
- Consumes: rate/transfer fixtures, query parsing, pricing, shared shell/UI.
- Produces: `/checkout/:rateId` and `/transfers` routes.
- Demo contract: confirmation mutates only component state; no fetch, form submission, credentials, or personal fields.

- [ ] **Step 1: Write failing checkout tests**

  Assert the hotel/rate/search summary, explicit demo notice, deterministic total, local success state, and absence of personal/payment fields.

- [ ] **Step 2: Add the unknown-rate review-focus test**

  Visit an unknown rate ID, assert confirmation is unavailable and navigation back to the hotel is offered.

- [ ] **Step 3: Write failing transfer tests**

  Assert query summary, six options, capacity details, price sort, selection, and local demo confirmation.

- [ ] **Step 4: Run feature tests and verify failure**

  Run: `npm test -- src/features/checkout src/features/transfers`
  Expected: FAIL because the features do not exist.

- [ ] **Step 5: Implement checkout and transfers**

  Keep all actions local and use the shared visual system on mobile and desktop.

- [ ] **Step 6: Verify checkout and transfers**

  Run: `npm test -- src/features/checkout src/features/transfers`
  Expected: PASS.

  Run: `npm run build`
  Expected: PASS.

- [ ] **Step 7: Commit**

  Run: `git add src/features/checkout src/features/transfers src/app/routes.tsx`

  Run: `git commit -m "feat: complete demo booking and transfers"`

---

### Task 7: Agent Graph and System Prompts

**Files:**
- Create: `agents/graph.yaml`
- Create: `agents/README.md`
- Create: `agents/prompts/coordinator.md`
- Create: `agents/prompts/recon.md`
- Create: `agents/prompts/design-system.md`
- Create: `agents/prompts/booking-flow.md`
- Create: `agents/prompts/visual-qa.md`
- Create: `scripts/validate-agent-graph.mjs`
- Create: `scripts/validate-agent-graph.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: graph nodes `coordinator`, `recon`, `design_system`, `booking_flow`, `visual_qa` and the exact directed edges specified by the design.
- Produces: `npm run agents:validate` that checks unique IDs, known models, prompt existence, edge validity, and acyclic execution dependencies.

- [ ] **Step 1: Write the failing graph validation tests**

  Assert required nodes/models, required edges, prompt file existence, no duplicate ownership paths, no unknown dependencies, and acyclic graph structure.

- [ ] **Step 2: Run graph tests and verify failure**

  Run: `npm test -- scripts/validate-agent-graph.test.ts`
  Expected: FAIL because the graph and validator do not exist.

- [ ] **Step 3: Implement the graph, validator, and prompts**

  Each prompt must declare mission, inputs, allowed file ownership, forbidden actions, required checks, and a structured handoff containing files changed, tests, risks, and next node.

- [ ] **Step 4: Verify the agent system**

  Run: `npm test -- scripts/validate-agent-graph.test.ts`
  Expected: PASS.

  Run: `npm run agents:validate`
  Expected: PASS and a printed topological execution order.

- [ ] **Step 5: Commit**

  Run: `git add agents scripts package.json package-lock.json`

  Run: `git commit -m "feat: add multi-agent development graph"`

---

### Task 8: End-to-End Tests, Browser QA, and Handoff

**Files:**
- Create: `e2e/hotel-booking.spec.ts`
- Create: `e2e/transfers.spec.ts`
- Create: `e2e/responsive.spec.ts`
- Create: `README.md`
- Modify: `package.json`
- Modify: feature CSS or components only where QA finds defects.

**Interfaces:**
- Consumes: complete application and agent validation script.
- Produces: documented one-command setup and verified end-to-end demo flows.

- [ ] **Step 1: Write the hotel booking E2E smoke**

  Navigate home → select Moscow → set dates/guests → search → apply free-cancellation filter → open a hotel → choose a rate → confirm local demo success.

- [ ] **Step 2: Write transfer and responsive E2E smoke tests**

  Test transfer selection/confirmation and assert no horizontal overflow at `390×844`, `768×1024`, and `1440×1000`.

- [ ] **Step 3: Run E2E and record failures**

  Run: `npx playwright install chromium`
  Expected: Chromium runtime is available for local E2E tests.

  Run: `npm run e2e`
  Expected: tests initially expose any integration or layout defects.

- [ ] **Step 4: Fix only observed E2E, accessibility, and responsive defects**

  Preserve the established interfaces; add regression assertions for every fixed defect.

- [ ] **Step 5: Write the README**

  Document prerequisites, install/dev/test/build/e2e commands, route inventory, fixture architecture, demo limitations, asset provenance, and how to run or extend the agent graph.

- [ ] **Step 6: Run the full verification suite**

  Run each command separately: `npm run lint`, `npm test`, `npm run agents:validate`, `npm run build`, `npm run e2e`.
  Expected: every command exits `0`.

- [ ] **Step 7: Perform browser QA**

  Compare home, search, filters, hotel, checkout, and transfers against the audited public interaction patterns at mobile and desktop sizes; verify keyboard focus and reduced-motion behavior.

- [ ] **Step 8: Commit**

  Run: `git add README.md e2e package.json package-lock.json src`

  Run: `git commit -m "test: verify complete ostrovok demo flow"`
