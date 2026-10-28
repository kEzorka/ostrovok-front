# Ostrovok booking demo

A local, fictional hotel and transfer booking demo built with React, TypeScript, Vite and an Express mock API. It is not an official Ostrovok service.

## Setup and commands

Use Node.js 20.19+ or 22.12+ and npm. From the repository root:

```sh
npm ci
npx playwright install chromium
npm run dev
```

Open http://127.0.0.1:5173. The development command starts Vite and the API on port 3001; Vite proxies `/api` to it. Ports 5173 and 3001 must be available. Other commands:

```sh
npm run lint
npm test
npm run build
npm run e2e
npm run agents:validate
```

Playwright starts both servers automatically when needed and runs Chromium at mobile, tablet and desktop viewport sizes. `npm run test:watch` starts the interactive unit test runner.

## Routes and data

- `/`: hotel and transfer search forms.
- `/search`: hotel results, filters, favorites and a local schematic map.
- `/hotel/:slug`: gallery, details and available rates.
- `/checkout/:rateId`: local demo confirmation; the `hotel` query parameter identifies the property.
- `/transfers`: transfer results and local demo confirmation.
- `/info/:topic`: local information pages for secondary navigation.

Hotel search state travels in the query string. Favorites and the last search use versioned browser local storage. The typed fixtures in `server/fixtures` are served by the local mock API; browser code uses `src/shared/api/client.ts` rather than importing fixtures. See [the API contract](src/shared/api/README.md) for endpoints, schemas, price calculation and replacement guidance. The catalog, prices, reviews and vehicles are fictional. Images are original project-owned illustrations; their generator and provenance are documented in [the asset README](src/assets/hotels/README.md).

Confirmations only change local UI state: no booking, payment, authentication, email or personal-data collection occurs. The map is schematic, and transfer prices are fixed one-way demo prices even for a return date. There is no real inventory or backend booking integration.

## Agent graph

`agents/graph.yaml` describes the development roles, ownership and execution dependencies. Run `npm run agents:validate` to check the graph and print its order. The graph is a declaration, not an agent runner. To extend it, update the graph and corresponding prompts in `agents/prompts`, keep ownership paths non-overlapping, and update validator rules/tests when changing the required topology. See [agent graph guidance](agents/README.md) for coordination and feedback routing.
