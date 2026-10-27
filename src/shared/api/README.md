# Demo API contract

Browser code imports `apiClient` from `client.ts` and JSON types from
`src/domain/types.ts`. Never import `server/fixtures` into browser modules.
`createApiClient(baseUrl)` is available for integration tests and a future backend.
The default base URL is `/api` (covered by Vite's existing API proxy).

| Client method | GET endpoint | Response |
| --- | --- | --- |
| `searchHotels(state)` | `/api/hotels` | `{ hotels: Hotel[], total, search: SearchState }` |
| `getHotel(slug)` | `/api/hotels/:slug` | `{ hotel: Hotel }` |
| `searchDestinations(query)` | `/api/destinations?q=…` | `{ destinations: Destination[] }` |
| `listTransfers(query)` | `/api/transfers` | `{ transfers: TransferOption[], total, query: TransferQuery }` |

Hotel queries use the field names in `SearchState`: `destination` is a destination
ID (`moscow`, `saint-petersburg`, `sochi`, `kazan`), dates are `YYYY-MM-DD`, children
are comma-separated ages (`0,8`), and `apartmentsOnly` is `true` or `false`.
`serializeSearchState` and `parseSearchParams` own this encoding. Unknown parameters
are ignored. Defaults are Moscow, today/next day, two adults, one room, no children,
all property types, and a leisure trip. Adults must be 1–30, rooms 1–9, and up to
ten child ages must be 0–17. Invalid values use the defaults. Historical valid
dates stay reproducible; checkout on or before checkin becomes the following day.

Search returns destination/capacity/apartment matches. Use `filterAndSortHotels`
for the remaining client filters and sorting. `minPrice` and `maxPrice` represent
the total stay price in RUB. Meal, cancellation, capacity, availability, and price
must all match one rate. Sorting uses the cheapest matching rate, with stable
ties. Supported sorts: `popular`, `rating`, `price-asc`, `price-desc`.
`distanceFromCenter` and `maxDistance` are in kilometres. `maxGuests` is per room;
the demo distributes total guests evenly across requested rooms. Prices multiply
`nightlyPrice × calendar nights × rooms`, without variable taxes or randomness.

Transfer queries contain `from`, `to`, `date`, `time` (`HH:mm`), `passengers`, and
optional `returnDate`. Passenger capacity filters the six fixed one-way demo
options; prices remain the fixture values. A return date is retained in the
query when valid and on/after departure. It does not create a booking or a
separate return option. Transfer sorting and demo selection belong to the UI.

Missing hotels return HTTP 404 and
`{ error: { code: "HOTEL_NOT_FOUND", message: "Отель не найден" } }`.
Non-success responses throw `ApiError` with `status`, `code`, and `message`.
Network failures propagate for the UI's retry/error state. Images are local
project illustrations served at the returned `/api/assets/hotels/*.webp` URLs.

## Local persistence

`appStorage` stores one JSON record under `ostrovok-demo`:
`{ version: 1, favorites: string[], lastSearch: SearchState | null }`.
Version 0 is `{ version: 0, favoriteIds: string[], search: SearchState | null }`;
reading migrates it in place. Favorites are unique, insertion-ordered IDs.
Malformed records recover to empty state, and unavailable storage never breaks
the app. Unsupported versions are read as empty and preserved without writes.
