# Dr.G Mobile — React Native App

A React Native mobile application built with Expo for the **Dr.G / 1Cell AI** healthcare platform. It provides authenticated access to patient management, medical report handling, an AI scribe (voice-to-text), chat, and more.

---

## Tech Stack

| Area | Technology |
|------|-----------|
| Framework | [Expo](https://expo.dev/) (SDK 54+) |
| Language | TypeScript |
| Styling | [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native) |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| State Management | [Jotai](https://jotai.org/) atoms |
| Persistent Storage | [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) |
| Lists | [@shopify/flash-list](https://shopify.github.io/flash-list/) |
| Animations | [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| Push Notifications | `@react-native-firebase/messaging` + `expo-notifications` |
| Icons | [lucide-react-native](https://lucide.dev/) |
| WebView | [react-native-webview](https://github.com/react-native-webview/react-native-webview) |
| Audio | [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/) |
| Speech-to-Text | [expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition) |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` (or edit `.env` directly) and fill in all required values:

```bash
cp .env.example .env
```

See the **Environment Variables** section below for all keys.

### 3. Start the development server

```bash
npx expo start
```

Other useful commands:

```bash
npm run android   # Run on Android emulator
npm run ios       # Run on iOS simulator
npm run web       # Run in web browser
npm run lint      # Lint the codebase
npm run format    # Format the codebase
```

---

## Environment Variables

All variables prefixed with `EXPO_PUBLIC_` are available at runtime in the app bundle.

```env
# Backend API
EXPO_PUBLIC_API_BASE_URL=https://dev.1cell.ai/platform
EXPO_PUBLIC_GQL_URL=https://dev.1cell.ai/bl

# WebView / External URLs
EXPO_PUBLIC_AMPLIFY_URL=https://dev.d1zsdhe7mq5v6z.amplifyapp.com
EXPO_PUBLIC_ORDER_TESTS_URL=https://service-1cell-ai-precision-oncology-...
EXPO_PUBLIC_MTB_URL=https://mtb.1cell.ai/reports
EXPO_PUBLIC_PUBLICATIONS_URL=https://service-1cell-ai-publications-...

# Patients Web Module (loaded inside the WebView on the Patients screen)
EXPO_PUBLIC_PATIENTS_URL=http://localhost:3000

# AI / RAG
EXPO_PUBLIC_RAG_SOCKET_URL=https://dev.1cell.ai

# ElevenLabs
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=agent_...

# Firebase (push notifications & DB)
EXPO_PUBLIC_FIREBASE_PROJECT_ID=drg-1cellai
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://drg-1cellai-default-rtdb.asia-southeast1.firebasedatabase.app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=drg-1cellai.firebasestorage.app
EXPO_PUBLIC_FIREBASE_IOS_API_KEY=...
EXPO_PUBLIC_FIREBASE_ANDROID_API_KEY=...
EXPO_PUBLIC_FIREBASE_IOS_APP_ID=...
EXPO_PUBLIC_FIREBASE_ANDROID_APP_ID=...
EXPO_PUBLIC_FIREBASE_IOS_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_ENABLE_FIREBASE=true
```

> **Important:** `EXPO_PUBLIC_PATIENTS_URL` is required for the Patients screen WebView to load. Set it to the URL of the deployed patients web module, or `http://localhost:3000` for local development.

---

## Project Structure

```
drg-mobile/
├── app/                        # All screens & routes (Expo Router)
│   ├── _layout.tsx             # Root Stack navigator + auth guard + FCM setup
│   ├── index.tsx               # Entry screen – redirects based on auth & onboarding state
│   ├── login.tsx               # Login screen
│   ├── onboarding.tsx          # Onboarding flow (shown once on first launch)
│   ├── profile.tsx             # User profile editor
│   ├── reset-password.tsx      # Change / reset password flow
│   ├── patients.tsx            # Patients WebView screen (see section below)
│   ├── news.tsx                # News articles screen (WebView/NewsCard)
│   ├── tests.tsx               # Order tests screen (OncoCard list)
│   ├── scribe-detail.tsx       # Audio playback & details for a Scribe session
│   ├── scribe-transcription.tsx# Live transcription of a Scribe session
│   └── (tabs)/                 # Bottom-tab navigator group
│       ├── _layout.tsx         # Tab bar config & shared header options
│       ├── index.tsx           # Home screen (feature cards)
│       ├── reports_list.tsx    # Patient reports list
│       ├── scribe.tsx          # AI Scribe – session list & new recording modal
│       └── settings.tsx        # Settings (theme, notifications, logout, etc.)
│
├── components/                 # Reusable UI components
│   ├── NetworkLoggers.tsx      # Network request logging overlay
│   ├── auth/                   # Authentication-related modals
│   │   ├── ESignatureModal.tsx
│   │   ├── MfaChangeWarningModal.tsx
│   │   └── OtpVerificationModal.tsx
│   ├── chat/
│   │   └── Chat.tsx            # AI chat interface (ElevenLabs integration)
│   ├── interaction/
│   │   ├── Interactions.tsx    # Interaction container
│   │   └── VideoInteraction.tsx# Video call / interaction component
│   ├── navigation/             # General navigation & layout helpers
│   │   ├── HScroller.tsx
│   │   ├── HeadingDivider.tsx
│   │   ├── IconButtonCard.tsx
│   │   └── SimpleButton.tsx
│   ├── patient/                # Patient list & detail components
│   │   ├── EmptyState.tsx
│   │   ├── FilterModal.tsx
│   │   ├── LoadingIndicator.tsx
│   │   ├── NotificationPermissionModal.tsx
│   │   ├── PatientHeader.tsx
│   │   ├── PatientRow.tsx
│   │   └── index.ts
│   ├── profile/                # Profile form field components
│   │   ├── FieldDropdownModal.tsx
│   │   ├── ProfileActionButtons.tsx
│   │   ├── ProfileCheckboxField.tsx
│   │   ├── ProfileDropdownField.tsx
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfileTextField.tsx
│   │   └── index.ts
│   └── widgets/                # Standalone content widgets
│       ├── NewsCard.tsx
│       ├── OncoCard.tsx
│       ├── Tipoftheday.tsx
│       └── tips.js
│
├── constants/
│   └── colors.ts               # Light/dark mode color palette (hex values)
│
├── context/
│   └── AuthContext.tsx         # Auth state, useAuth, useLogin, useLogout hooks
│
├── hooks/
│   ├── NetworkChecker.tsx      # Online/offline detection hook
│   └── useThemeSync.ts         # Jotai + NativeWind theme synchronisation hook
│
├── services/                   # API layer
│   ├── config.ts               # Base URL & Axios configuration
│   ├── fetchClient.ts          # Authenticated fetch wrapper (token injection, 401 handling)
│   ├── patients.ts             # Patient list & detail GraphQL queries
│   ├── rag.ts                  # RAG / AI document search service
│   ├── storage.ts              # File upload config & presigned URL logic
│   ├── users.ts                # User auth, profile, token revocation
│   └── elevenlabs.ts           # ElevenLabs voice AI client
│
├── stores/                     # Jotai atoms + MMKV persistence
│   ├── mmkv.ts                 # MMKV storage instance
│   ├── theme.ts                # Persisted theme atom
│   ├── onboarding.ts           # Persisted onboarding-seen atom
│   ├── scribe.ts               # Persisted Scribe sessions atom
│   ├── ingestion.ts            # Report ingestion status tracking atom
│   └── ApiData.ts              # Shared API data atoms
│
├── types/                      # TypeScript type definitions
│   └── scribe.ts               # ScribeSession type
│
├── util/
│   └── helpers.ts              # JWT decode (decryptToken) & misc utilities
│
├── assets/                     # Images, fonts, icons
├── tailwind.config.js          # NativeWind / Tailwind config
├── metro.config.js             # Metro bundler config
├── app.json                    # Expo app config
└── .env                        # Environment variables (never commit)
```

---

## Screen-by-Screen Guide

### `app/index.tsx` — Entry / Redirect

The first screen rendered. It reads `isAuthenticated` from `AuthContext` and `hasSeenOnboarding` from Jotai/MMKV and redirects accordingly:

- Not authenticated → `/login`
- Authenticated but onboarding not seen → `/onboarding`
- Authenticated & onboarding done → `/(tabs)`

---

### `app/login.tsx` — Login Screen

Username/password login form that calls `useLogin()` from `AuthContext`. On success the token is stored in MMKV and the user is routed to `/(tabs)`.

---

### `app/(tabs)/index.tsx` — Home Screen

Feature card dashboard. Tapping a card navigates to:

- **Patients** → `/patients` (WebView)
- **Order Tests** → `/tests`
- **News** → `/news`
- and other sections

---

### `app/(tabs)/reports_list.tsx` — Reports List

Fetches patient reports from the GraphQL API. Supports:

- Pull-to-refresh
- Infinite scroll / load more
- Ingestion status tracking (via `ingestionAtom`)
- Navigation to the report viewer

---

### `app/(tabs)/scribe.tsx` — AI Scribe (Session List)

Lists all recorded Scribe sessions (stored persistently via `persistentScribeSessionsAtom`). A floating **"New Scribe"** button opens a modal where a clinician can:

1. Enter the patient name and phone number
2. Confirm consent
3. Record audio (with pause/resume support) using `expo-audio`
4. Save the recording to the device's document directory as an `.m4a` file

Tapping a session card navigates to `scribe-detail`.

---

### `app/scribe-detail.tsx` — Scribe Session Detail

- Displays patient name, phone, and session timestamp
- Plays back the recorded `.m4a` using `expo-audio`
- Shows a progress bar for the audio
- **Transcribe Recording** button → navigates to `scribe-transcription`
- **Delete Session** button → removes the audio file and deletes the session from the atom

---

### `app/scribe-transcription.tsx` — Scribe Transcription

Transcribes the saved audio using `expo-speech-recognition`:

- Shows a live preview of in-progress text
- Persists the transcript to the Scribe session atom (MMKV) on completion
- Loads cached transcripts instantly on re-open (no re-processing)
- **Re-transcribe** button to discard and re-run
- **Copy** and **Share** actions on the completed transcript

---

### `app/patients.tsx` — Patients WebView Screen

Loads the patients web module (`EXPO_PUBLIC_PATIENTS_URL`) inside a full-screen `react-native-webview`. See the **WebView Integration** section for details.

---

### `app/(tabs)/settings.tsx` — Settings

| Setting | Behaviour |
|---------|-----------|
| My Profile | Navigates to `/profile` |
| Change Password | Navigates to `/reset-password` with `userMasterId` param |
| Dark / Light Mode | Toggles `useThemeSync` / persisted theme atom |
| Push Notifications | Requests/checks `expo-notifications` permission |
| Delete Account | Confirmation alert → `useLogout()` |
| Show Onboarding | Resets `hasSeenOnboardingAtom` → `/onboarding` |
| Sign Out | `useLogout()` → `router.replace('/login?logout=true')` |

---

## WebView Integration — Patients Screen

`app/patients.tsx` renders a **headerless, full-screen WebView** that hosts the patients web module. There is a bi-directional JavaScript bridge between the React Native shell and the web app.

### Architecture

```
React Native (patients.tsx)
        │
        │  injectJavaScript()
        ▼
  WebView (react-native-webview)
        │
        │  window.ReactNativeWebView.postMessage()
        ▼
  handleMessage() in patients.tsx
```

### What happens on load (`handleLoadEnd`)

When the WebView finishes loading, the following JavaScript is injected in a single call:

```js
// 1. Authenticate the web app
window.initPatientWebApp({ token: "<JWT>", patients: [] });

// 2. Set the initial theme
window.setAppTheme('dark' | 'light');

// 3. Expose navigation functions to the web app
window.navigateBack = function() {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: 'navigate', target: 'back' })
  );
};
window.navigateHome = function() {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: 'navigate', target: 'home' })
  );
};
```

### Dynamic theme sync

A `useEffect` watches NativeWind's `colorScheme`. Whenever the user changes the device theme while the screen is active, the new scheme is injected:

```js
if (window.setAppTheme) { window.setAppTheme('dark'); }  // or 'light'
```

### Message handling (`handleMessage`)

Messages from the web app are parsed as JSON:

| `type` | `target` | React Native action |
|--------|----------|---------------------|
| `navigate` | `back` | `router.back()` or `router.replace('/(tabs)')` if no history |
| `navigate` | `home` | `router.replace('/(tabs)')` |

### Header

The native header is **disabled** for the `patients` route in `app/_layout.tsx`:

```tsx
<Stack.Screen name="patients" options={{ headerShown: false }} />
```

A `SafeAreaView` wraps the WebView to handle device insets (status bar etc.) correctly, with a background colour that matches the current theme (`#111827` dark / `#FDF5E6` light).

---

## Authentication Flow

1. **App start** — `AuthContext.initAuth()` reads the JWT from MMKV
2. If a valid token is found, it is decoded with `decryptToken` and user details + upload config are fetched in parallel
3. The parsed user object is set in context and the app navigates to `/(tabs)`
4. All API calls (via `fetchClient.ts`) automatically attach `Authorization: Bearer <token>`
5. 401 responses redirect the user back to `/login?logout=true`
6. **Logout** — `useLogout()` calls the revoke-token endpoint, then navigates to login

---

## State Management

State is managed with **Jotai** atoms, persisted via **react-native-mmkv**:

| Atom (store file) | Persisted | Purpose |
|-------------------|-----------|---------|
| `themeAtom` (`stores/theme.ts`) | ✅ | `'light' \| 'dark'` user preference |
| `hasSeenOnboardingAtom` (`stores/onboarding.ts`) | ✅ | Whether onboarding has been shown |
| `persistentScribeSessionsAtom` (`stores/scribe.ts`) | ✅ | All recorded Scribe sessions + transcripts |
| `ingestionAtom` (`stores/ingestion.ts`) | ❌ | In-memory ingestion status for reports |
| Various API data atoms (`stores/ApiData.ts`) | ❌ | Shared in-memory API results |

The `useThemeSync` hook (`hooks/useThemeSync.ts`) is the single source of truth for reading and toggling the app theme — it keeps NativeWind's `colorScheme` and the Jotai `themeAtom` in sync.

---

## Services & API Layer

All network calls go through `services/fetchClient.ts`, which:

- Reads the JWT from MMKV on every request
- Attaches the `Authorization: Bearer` header
- Intercepts `401` responses and redirects to login

| Service file | What it does |
|-------------|-------------|
| `services/users.ts` | `authenticateUser`, `getUserDetail`, `revokeToken`, `resetPassword` |
| `services/patients.ts` | GraphQL queries for patient list and detail |
| `services/storage.ts` | Upload config, presigned S3 URLs |
| `services/rag.ts` | RAG / AI document search (WebSocket or HTTP) |
| `services/elevenlabs.ts` | ElevenLabs voice agent integration |
| `services/config.ts` | Axios base config |

---

## Theming & Color Palette

Colors are defined centrally in `constants/colors.ts`.

### Key hex values

**Dark mode:**
| Role | Hex |
|------|-----|
| Background | `#111827` (gray-900) |
| Card / Surface | `#1f2937` (gray-800) |
| Border | `#374151` (gray-700) |
| Text primary | `#f9fafb` (gray-100) |
| Text secondary | `#9ca3af` (gray-400) |

**Light mode:**
| Role | Hex |
|------|-----|
| Background | `#FDF5E6` (warm cream) |
| Card / Surface | `#ffffff` |
| Border | `#e5e7eb` (gray-200) |
| Text primary | `#111827` (gray-900) |
| Text secondary | `#6b7280` (gray-500) |

**Brand / common:**
| Role | Hex |
|------|-----|
| Primary / accent | `#daa521` (goldenrod) |
| Info / blue | (via `colors.common.info`) |
| Success / green | (via `colors.common.success`) |
| Warning / amber | (via `colors.common.warning`) |

---

## Development Conventions

- **Styling:** Use NativeWind `className` prop. All tokens come from `tailwind.config.js`. Avoid inline styles except for dynamic values (e.g., animated transforms).
- **Routing:** File-based via Expo Router. All screens live under `app/`. The `(tabs)` group is the authenticated bottom-tab navigator.
- **Auth guard:** Handled in `app/_layout.tsx` and `app/index.tsx` by reading `AuthContext`.
- **New atoms:** Add them in `stores/` and use `atomWithMMKV` (see existing patterns) for persistence.
- **New API calls:** Add a function to the relevant service file and call it from the screen via `useEffect` or event handler.

---

## Removing IPA / APK build artifacts

Build outputs (`.ipa`, `.apk`, `.aab`) should never be committed. Ensure they are listed in `.gitignore`.
