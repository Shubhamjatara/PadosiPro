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

During development, fully reload the app after changing the URL. For an installed preview APK, update the build configuration and rebuild/reinstall the APK as described below. Expo includes `EXPO_PUBLIC_` values in the app bundle, so these variables are for public configuration such as this URL, not passwords or private keys. See [Expo environment variables](https://docs.expo.dev/guides/environment-variables/).

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

## Build and download an Android APK

EAS Build creates the APK in Expo's cloud. Run the following commands from the project folder. You need an Expo account with access to the linked EAS project.

### 1. Log in and check build setup

```bash
npx eas-cli@latest login
```

This project already contains `eas.json` and an EAS project ID in `app.json`. If setting up a new project without EAS configuration, run:

```bash
npx eas-cli@latest build:configure
```

Select Android and follow the setup prompts. See the [EAS setup guide](https://docs.expo.dev/build/setup/).

### 2. Set the backend URL for the APK

In `eas.json`, update only `build.preview`, keeping the other profiles and settings:

```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  },
  "env": {
    "EXPO_PUBLIC_API_URL": "https://your-backend.example.com/api"
  }
}
```

Replace the example with your actual backend URL, including `/api`. The current preview profile uses `http://localhost:3000/api`; change it before building for a physical phone. On a phone, `localhost` refers to the phone itself, not your computer.

The local `.env` file is ignored by Git and is not uploaded by the default EAS workflow. The `preview.env` setting supplies the API URL for this cloud build. The backend must remain available when the installed app makes requests.

### 3. Optional: connect the APK to a local backend

Skip this step if you use a hosted HTTPS backend.

1. Connect the phone and backend computer to the same Wi-Fi network.
2. Start the backend on port `3000`, listening on `0.0.0.0` so other devices can connect. Allow the backend through Windows Firewall on the private network.
3. Run `ipconfig` on Windows. Find the IPv4 address of the active Wi-Fi adapter, not a disconnected or virtual adapter.
4. If the address is `192.168.1.10`, use `http://192.168.1.10:3000/api` in both `.env` and `eas.json` under `build.preview.env.EXPO_PUBLIC_API_URL`. Replace this example IP with your current address.
5. Open `http://192.168.1.10:3000/api/v1/tasks/search?search=washing` in the phone's browser. A JSON response confirms the phone can reach the backend. If it does not load, check the IP, server binding, firewall, and whether the Wi-Fi network allows devices to communicate.

For an Android APK using local HTTP, install the Expo configuration plugin:

```bash
npx expo install expo-build-properties
```

Append this entry to the existing `expo.plugins` array in `app.json`; keep the other plugin entries:

```json
[
  "expo-build-properties",
  {
    "android": {
      "usesCleartextTraffic": true
    }
  }
]
```

This allows unencrypted HTTP for local testing. Use HTTPS and remove this exception for production. The plugin is not currently installed or configured in this project; these are setup instructions. See [Expo BuildProperties](https://docs.expo.dev/versions/v57.0.0/sdk/build-properties/#pluginconfigtypeandroid).

Keep the computer and backend running while using the app. If the computer's IP changes, update the URL and rebuild the APK. A successful browser check verifies connectivity; the APK still needs the HTTP configuration above.

### 4. Build the APK

After configuring the backend URL and, if needed, local HTTP support, run:

```bash
npx eas-cli@latest build --platform android --profile preview
```

If EAS asks to generate a new Android keystore for this app's first build, choose **Yes**. If credentials already exist for the app, reuse them. EAS signs the build and prints a build-details link.

The `preview` profile requests an installable `.apk`. The `production` profile normally produces an Android App Bundle (`.aab`) for Google Play instead. See [Expo's APK guide](https://docs.expo.dev/build-reference/apk/).

### 5. Download and install

- If the status is **Queued** or **In progress**, wait for it to finish.
- After **Build finished**, open the build link printed in the terminal and download the APK.
- You can also open the [Expo dashboard](https://expo.dev/), select the project, open **Builds**, and select the completed Android preview build to download it.
- Open the downloaded APK on your Android phone and follow the installation prompt. Android may ask you to allow installation from the browser or file manager used to open it.

The APK is built remotely and is not automatically saved in this project's folder. A failed build has no completed APK to download; inspect the build logs on its details page.

This preview APK includes the app's JavaScript and does not need the Expo development server running. It still needs the configured backend. Editing `.env` after installation does not change the URL inside that APK; update the preview configuration, rebuild, and install the new APK.

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
eas.json                           Cloud build profiles and preview API URL
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
- Configure a device-reachable preview backend URL, then verify and provide the required APK. The EAS preview profile is present; APK completion and installation have not been verified here.
