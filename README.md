# DFN LWAPI Book

**Developed by Hansana Ranaweera**

A premium React + TypeScript + Vite frontend for demonstrating the Saudi share-market **DFN LWAPI GW APIs - Rest** token flow. The app is dark-mode first with a new royal blue / electric cyan / violet palette, animated with Framer Motion, styled with Tailwind CSS, and uses TanStack Query, Zustand, Axios, Lucide React, Recharts, and localStorage.

## API scope

The UI intentionally implements only the API requests specified from the Postman collection flow. It does **not** invent unsupported endpoints.

| Flow | Method | Endpoint | Auth header | Payload |
| --- | --- | --- | --- | --- |
| Trade Authentication – Classic | `POST` | `/Auth/Login` | none | `{ "msgType": 1, "lgnNme": "<selected encrypted login name>" }` |
| Refresh token | `POST` | `/Auth/Refresh` | `tradeToken` | `{ "msgType": 3, "refreshToken": "<current refreshToken>" }` |
| Logout | `POST` | `/Auth/Logout` | `tradeToken` | `{ "msgType": 402, "customerId": "<current customerId>" }` |
| Token verification | `POST` | `/Auth/Verify` | `tradeToken` | `{ "msgType": 468 }` |
| OTP service | `POST` | `/Auth/OTP` | `tradeToken` | `{ "msgType": 406, "lgnNme": "<selected login name>", "otp": "<entered OTP>" }` |
| Customer profile | `POST` | `/Customer/Profile` | `tradeToken` | `{ "msgType": 0 }` |
| Customer details | `POST` | `/Customer/Details` | `tradeToken` | `{ "msgType": 6, "customerId": "<current customerId>" }` |
| Buying power | `POST` | `/Customer/BuyingPower` | `tradeToken` | `{ "msgType": 46, "cashAccId": "<default cashAccId>" }` |
| Symbol marginability buying power | `POST` | `/Customer/BuyingPower` | `tradeToken` | `{ "msgType": 46, "cashAccId": "<default cashAccId>", "tradingAccId": "<default tradingAccId>", "symbol": "1050", "exchange": "TDWL" }` |
| Order list | `POST` | `/Order/List` | `tradeToken` | `{ "msgType": 23, "tradingAccId": "<default tradingAccId>" }` |
| Order execution history | `POST` | `/Order/Executions` | `tradeToken` | `{ "msgType": 48, "clOrdId": "250516000000011", "remoteClOrdID": "250516000000011" }` |
| Holdings list | `POST` | `/Customer/Holdings` | `tradeToken` | `{ "msgType": 23, "tradingAccId": "<default tradingAccId>" }` |
| New order | `POST` | `/Order/New` | `tradeToken` | Postman sample order body with `msgType: 2`, TDWL `1010`, `tradeDate`, `remoteClOrdID`, and default `tradingAccId` |
| Amend order | `POST` | `/Order/Update` | `tradeToken` | Postman sample amend body with `msgType: 15` and default `tradingAccId` |
| Cancel order | `POST` | `/Order/Cancel` | `tradeToken` | Postman sample cancel body with `msgType: 16` and default `tradingAccId` |
| Commission service | `POST` | `/Order/Commission` | `tradeToken` | Postman sample commission body with `msgType: 47` and default `tradingAccId` |
| Order search | `POST` | `/Order/Search` | `tradeToken` | Postman sample search body with `msgType: 24`, default `tradingAccId`, and current `endDte` |
| Customer availability | `POST` | `/Onboarding/Customer/Availability` | `tradeToken` | `{ "msgType": 335, "channel": 79, "nic": "<NIC entered by user>" }` |

## Setup

```bash
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## Dummy backend

A complete local mock backend is included for the implemented Postman collection endpoints. It uses Node's built-in HTTP server, keeps dummy session/order state in memory, supports CORS, and returns realistic LWAPI-shaped JSON responses.

Start it in a separate terminal:

```bash
npm run mock
```

The mock listens at `http://localhost:8080`, matching the frontend default `baseUrl`. You can verify it with:

```bash
curl http://localhost:8080/health
```

The dummy backend covers Auth, Customer, Order, Holdings, Buying Power, OTP, and Onboarding availability routes. It is for local demos only and does not connect to a real trading system.

## Environment configuration

Use the **Environment settings** panel before login:

- Enter the gateway `baseUrl`, for example `http://localhost:8080`.
- Click **Save** to persist it to localStorage.
- Click **Reset localhost** to restore the default localhost-friendly value.

All API calls are sent to `baseUrl + endpoint`.

## Authentication and token flow

1. Start with **Trade Authentication – Classic** (`POST /Auth/Login`).
2. Select a demo account card or paste the encrypted `lgnNme` from the Postman collection manually.
3. On `authSts === 1` or `authSts === 9`, the app stores these values in Zustand and localStorage:
   - `tradeToken`
   - `refreshToken`
   - `customerId`
   - `instId`
   - `cusNme`
   - `priceToken`
   - `tokenRefreshInt`
   - `lstLgnTme`
4. Axios requests that require authentication automatically inject the current `tradeToken` header.
5. Manual or automatic refresh calls `POST /Auth/Refresh` with the current `refreshToken`; on `authSts === 1`, new tokens replace old tokens. If refresh returns a non-success `authSts`, the app mirrors the Postman test script by clearing local token/session values.
6. Token verification calls `POST /Auth/Verify` with `msgType: 468` and the current `tradeToken` header.
7. Customer Details calls `POST /Customer/Details` and mirrors the Postman test script by saving the default `tradingAccId` and default `cashAccId` when available.
8. Buying Power, Holdings, and Order calls reuse the saved default account IDs from Customer Details.
9. Order/New, Order/Update, and Order/Cancel are editable demo requests from the Postman collection; review payload values before sending because they can affect orders on a connected gateway.
10. Logout calls `POST /Auth/Logout`; on `status === 1`, local session data is cleared.

> Security note: this is a localhost/demo application. Tokens are masked in the UI but stored in localStorage for persistence. Use **Clear Session** after demos.

## Demo accounts

The account switcher is populated from the Postman collection comments supplied with this task:

- `1000016` / `001000016011` / Jadwa Custody / symbols `1140 / 2222 / 7010`
- `1009665` / `100 trading account`
- `1008051` / `001008051001` / TDWL - ICM

Each card carries the encrypted `lgnNme` from the collection snippet. You can still paste a different encrypted login name into the manual override field before logging in.

## Request explorer

The request explorer provides:

- Category sidebar for Authentication and Authorization, Customer, Order, Onboarding, and supported Trading / Market sections.
- Method badges and endpoints.
- Editable JSON payloads with invalid JSON warnings.
- Header previews.
- Send buttons.
- Raw and formatted response panels.
- HTTP status and response time.
- Copy buttons.
- Local request history for dashboard charts.

## Dashboard

The dashboard shows session metadata and visual widgets powered only by local request history. Portfolio visuals are clearly labeled **demo/visual-only** and do not display fake real balances.

## Build

```bash
npm run build
```

## Scripts

- `npm run dev` starts the Vite frontend.
- `npm run mock` starts the dummy LWAPI backend on port `8080`.
- `npm run build` runs TypeScript and Vite production build checks.
- `npm run lint` runs ESLint.
