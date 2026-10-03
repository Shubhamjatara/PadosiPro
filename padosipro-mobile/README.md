# PadosiPro Mobile

An Expo and React Native frontend for the PadosiPro developer assignment. Users can register, verify their email, update their profile, search services, and review their selection before saving it.

This repository contains the frontend. A separate backend is required for authentication, OTP delivery, profiles, and task storage.

## Tech stack

- Expo SDK 57 and React Native 0.86
- React 19 and TypeScript
- Expo Router for navigation
- React Native Paper for UI components
- Axios for API requests
- Expo SecureStore on native devices and localStorage on web for session storage

## Implemented features

- Registration with email, password, and password confirmation validation.
- Login and locally stored authentication tokens.
- Six-digit email OTP verification and resend with a 30-second countdown.
- Profile editing: full name, Indian mobile number, address, and optional business name.
- Services grouped by category, with multiple selections allowed.
- Previously saved services checked when the Services screen opens.
- API search with a 300 ms typing delay, loading feedback, empty results, and retry.
- Selection preserved across searches, with a review step before saving.
- Home screen showing saved services.
- A right-side animated menu with Home, Services, Profile, and logout.

These features are implemented in code; full device verification is still pending.

## Local setup

### 1. Prerequisites

- Node.js compatible with Expo SDK 57 (minimum 22.13.x) and npm. See the [Expo SDK reference](https://docs.expo.dev/versions/v57.0.0/).
- The separate PadosiPro backend running and reachable from the device or browser.
- Access to the test email inbox used for registration and OTP verification.

### 2. Install dependencies

From the project folder, run:

```bash
npm install
```

### 3. Configure the API URL

Copy `.env.example` to `.env` in the project root. In PowerShell:

```powershell
Copy-Item .env.example .env
```

Or on macOS/Linux:

```bash
cp .env.example .env
```

Set the backend URL in `.env`, including the `/api` prefix:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

For a browser running on the same computer as the backend, this local URL can be used. The backend must allow requests from the frontend's browser origin through its CORS configuration.

For a physical phone, replace `localhost` with the backend computer's reachable LAN address, for example:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000/api
```

Replace that example address with your actual address. The phone and computer must be able to reach each other, and the backend must accept connections from the network. A hosted backend URL can also be used.

`api/api.ts` reads `process.env.EXPO_PUBLIC_API_URL`. If it is missing or empty, the app reports a configuration error. Your local `.env` is ignored by Git; `.env.example` provides the setup template.

After changing the URL, fully reload the app to use the new value. Expo includes `EXPO_PUBLIC_` values in the app bundle, so these variables are for public configuration such as this URL, not passwords or private keys. See [Expo environment variables](https://docs.expo.dev/guides/environment-variables/).

### 4. Start the app

```bash
npm start
```

Available platform commands:

| Command | Purpose |
| --- | --- |
| `npm run web` | Start Expo for the web browser |
| `npm run android` | Start Expo and open an available Android target |
| `npm run ios` | Start Expo and open an available iOS target |

The platform commands start the development server; they do not produce an APK or a store release. Use an Expo client or development build compatible with the project's SDK and dependencies. Check the [Expo development guide](https://docs.expo.dev/get-started/start-developing/) for device setup.

## Main user flow

1. Register with an email address and matching passwords.
2. Enter the email OTP. Resend becomes available after the countdown.
3. After verification, fill in and save the profile.
4. Open Services and select tasks. Previously saved choices are pre-selected.
5. Type into the search bar to fetch matching tasks from the backend.
6. Tap **Review selection**, then **Confirm & save**. Use **Edit selection** to return without saving.
7. View saved services on Home.
8. Open the right-side menu to navigate or log out.

Verified users currently go directly to Home after login. Mandatory profile completion on first login is still pending.

## API endpoints used

All paths below are relative to the configured base URL, which already includes `/api`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/register` | Create an account |
| POST | `/v1/login` | Sign in |
| POST | `/v1/verify` | Verify the email OTP |
| POST | `/v1/resend-otp` | Request another OTP |
| GET | `/v1/profile` | Load profile details |
| PATCH | `/v1/profile` | Save profile details |
| GET | `/v1/tasks` | Load the task catalog |
| GET | `/v1/tasks/search?search=washing` | Search tasks |
| GET | `/v1/tasks/selection` | Load saved tasks |
| PUT | `/v1/tasks/selection` | Save selected task IDs |

Axios adds `Authorization: Bearer <token>` when a saved token is available. Logout removes the local token and redirects to Login; it does not call a backend logout endpoint.

The frontend expects responses shaped like:

```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": [
    {
      "id": 18,
      "name": "Bike Washing",
      "category": "Automotive",
      "description": "Bike washing and cleaning services."
    }
  ]
}
```

Saving a selection sends:

```json
{
  "taskIds": [18, 17]
}
```

## Project structure

```text
.env.example                       Example API URL configuration
api/api.ts                         Axios environment configuration and auth header
src/app/_layout.tsx                Root navigation and UI provider
src/app/(auth)/                    Login, registration, and OTP screens
src/app/(tabs)/                    Home, Services, and Profile screens
src/components/custom/AppShell.tsx Shared header and sidebar access
src/components/custom/Sidebar.tsx  Right-side menu and logout
src/components/custom/TaskSearchBar.tsx
                                   Search input, API call, debounce, and feedback
src/constants/ui.ts                Shared colors and styles
src/hooks/useApi.ts                 Request helpers, loading, and error callbacks
src/services/                      Token storage and authentication helpers
src/types/task.ts                  Shared task type
UI-GUIDE.md                        Beginner guide to the UI code
```

`TaskSearchBar` sends results to the Tasks screen through `onResultsChange`. The screen manages selection and saving. It keeps previously seen task details so the review step can display selected tasks even when a different search hides them.

## Validation

Run these checks before submitting changes:

```bash
npx tsc --noEmit
npx expo lint
```

At the latest local check, TypeScript passed. Lint reports an existing `react-hooks/set-state-in-effect` error in `src/hooks/use-color-scheme.web.ts`, where `setHasHydrated(true)` runs inside an effect.

There is no automated test script configured in `package.json`. The search endpoint was checked locally with `search=washing` and returned Bike Washing, Car Washing, and Washing Machine Repair. Full UI and device testing has not been completed.

Manual checks still needed:

- Registration, valid/invalid/expired OTP, resend, and login.
- Profile validation and persistence after restarting the app.
- Saved tasks pre-selection, search changes, clearing search, and no results.
- Review, edit, successful save, failed save, and retry.
- Network failures, rapid typing, session expiry, and logout.
- Keyboard behavior, small-screen layouts, and sidebar navigation on a device.

## Remaining work

- Enforce profile completion for new users and skip it for completed profiles.
- Handle expired sessions consistently and redirect to Login.
- Update provider-oriented wording such as "Your business" to match the assignment's customer flow.
- Fix the existing lint error and complete device testing.
- Add `DESIGN.md` for assignment decisions and tradeoffs.
- Configure an Android build and provide the required APK. This repository does not currently include an `eas.json` build configuration.
