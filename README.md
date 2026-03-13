# Dr.G Mobile Application

Dr.G is a clinical mobile application built for healthcare professionals. It enables physicians to view patient genomic test results, analyze medical reports using AI-powered RAG (Retrieval-Augmented Generation), interact with an AI assistant named Dr.G via voice or text, and record patient consultation sessions using a built-in scribe feature.

The application is built with React Native (Expo SDK 55), TypeScript, NativeWind for styling, and Expo Router for navigation.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Routing and Screens](#routing-and-screens)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Services and API Layer](#services-and-api-layer)
- [Authentication Flow](#authentication-flow)
- [Environment Variables](#environment-variables)
- [Key Dependencies](#key-dependencies)
- [Build and Deployment](#build-and-deployment)

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Expo CLI installed globally or via `npx`
- iOS Simulator (macOS only) or Android Emulator

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npx expo start
```

From the Expo developer tools, choose to run on:

- iOS Simulator
- Android Emulator
- Physical device via Expo Go

### Platform-Specific Commands

```bash
npm run ios       # Run on iOS simulator
npm run android   # Run on Android emulator
npm run web       # Run in the browser
npm run lint      # Lint the codebase
npm run format    # Auto-format with Prettier
```

---

## Project Structure

```
.
├── app/                         # All screens and routing (Expo Router)
│   ├── _layout.tsx              # Root layout: providers, Firebase, fonts, notifications
│   ├── index.tsx                # Entry point, redirects based on auth state
│   ├── login.tsx                # Login screen
│   ├── onboarding.tsx           # First-time onboarding screen
│   ├── forgot-password.tsx      # Forgot password screen
│   ├── reset-password.tsx       # Change password screen
│   ├── reports.tsx              # PDF report viewer with AI interaction
│   ├── profile.tsx              # User profile editor
│   ├── news.tsx                 # Medical news/trends screen
│   ├── tests.tsx                # Order tests screen
│   ├── scribe-detail.tsx        # Detail view for a single scribe session
│   ├── scribe-transcription.tsx # Audio transcription screen
│   └── (tabs)/                  # Bottom tab navigator group
│       ├── _layout.tsx          # Tab bar layout and configuration
│       ├── index.tsx            # Home / landing screen
│       ├── patients.tsx         # Patient list screen
│       ├── scribe.tsx           # Scribe session management
│       └── settings.tsx         # App settings screen
│
├── components/                  # Reusable UI components
│   ├── auth/                    # Authentication-related modals
│   ├── chat/                    # ElevenLabs conversational AI chat
│   ├── interaction/             # Video and chat interaction overlay components
│   ├── navigation/              # Navigation UI primitives
│   ├── patient/                 # Patient list and detail components
│   ├── profile/                 # Profile form field components
│   ├── widgets/                 # Dashboard widgets (news cards, tips, etc.)
│   └── NetworkLoggers.tsx       # Dev-only network request logger
│
├── context/
│   └── AuthContext.tsx          # Auth state, login/logout hooks, user context
│
├── services/                    # All external API integrations
│   ├── fetchClient.ts           # Centralized HTTP client with auth interceptors
│   ├── config.ts                # App config API (feature flags)
│   ├── users.ts                 # User authentication and profile API
│   ├── patients.ts              # Patient data via GraphQL
│   ├── rag.ts                   # Report ingestion and RAG query API
│   ├── storage.ts               # Blob storage and file upload API
│   └── elevenlabs.ts            # ElevenLabs conversational AI signed URL
│
├── stores/                      # Global state atoms (Jotai)
│   ├── mmkv.ts                  # MMKV storage instance and FCM token helpers
│   ├── ingestion.ts             # Report ingestion tracking atoms
│   ├── scribe.ts                # Persistent scribe sessions atom
│   ├── theme.ts                 # Theme preference atom (light/dark)
│   └── onboarding.ts            # Onboarding completion tracking atom
│
├── hooks/
│   ├── NetworkChecker.tsx       # Network connectivity monitor
│   └── useThemeSync.ts          # Syncs Jotai theme atom with NativeWind color scheme
│
├── types/
│   ├── api.ts                   # GraphQL request/response types
│   ├── users.ts                 # User, profile field, and role types
│   ├── scribe.ts                # Scribe session type
│   └── types.ts                 # Shared enums (e.g., IngestionStatus)
│
├── constants/
│   └── colors.ts                # App-wide color palette (light/dark/common)
│
├── util/
│   ├── helpers.ts               # Utility functions (date formatting, JWT parsing)
│   └── toast.ts                 # Toast notification helper wrappers
│
├── assets/                      # Static assets (images, fonts)
├── app.json                     # Expo application configuration
├── eas.json                     # EAS Build configuration
├── tailwind.config.js           # Tailwind CSS configuration for NativeWind
├── metro.config.js              # Metro bundler configuration
└── global.css                   # Global CSS entry point for NativeWind
```

---

## Routing and Screens

The application uses Expo Router with a file-based routing system. There are two route groups:

### Public Routes (unauthenticated)

| Route | File | Description |
|---|---|---|
| `/` | `app/index.tsx` | Entry point; redirects to login or tabs based on auth state |
| `/login` | `app/login.tsx` | Username and password login |
| `/forgot-password` | `app/forgot-password.tsx` | Request a password reset link via email |
| `/onboarding` | `app/onboarding.tsx` | First-time setup screen for new users |

### Protected Routes (authenticated)

| Route | File | Description |
|---|---|---|
| `/(tabs)` | `app/(tabs)/_layout.tsx` | Bottom tab bar container |
| `/(tabs)/index` | `app/(tabs)/index.tsx` | Home screen with clinical and education shortcuts |
| `/(tabs)/patients` | `app/(tabs)/patients.tsx` | Paginated, searchable patient list |
| `/(tabs)/scribe` | `app/(tabs)/scribe.tsx` | Local scribe session list and recording UI |
| `/(tabs)/settings` | `app/(tabs)/settings.tsx` | Theme toggle, logout, and app preferences |
| `/reports` | `app/reports.tsx` | PDF viewer with AI analysis, RAG chat, and video interaction |
| `/profile` | `app/profile.tsx` | User profile editing and MFA settings |
| `/reset-password` | `app/reset-password.tsx` | In-app password change form |
| `/news` | `app/news.tsx` | Medical news and genomics trends |
| `/tests` | `app/tests.tsx` | Test ordering interface |
| `/scribe-detail` | `app/scribe-detail.tsx` | Detail view for a recorded scribe session |
| `/scribe-transcription` | `app/scribe-transcription.tsx` | Audio transcription result for a session |

---

## Component Architecture

Components are grouped by feature domain under `components/`.

### `components/auth/`

| Component | Description |
|---|---|
| `ESignatureModal.tsx` | Modal for capturing an e-signature (username + password) when modifying sensitive profile data |
| `MfaChangeWarningModal.tsx` | Warning modal displayed before changing the MFA delivery method |
| `OtpVerificationModal.tsx` | OTP entry modal for verifying a newly selected MFA method |

### `components/chat/`

| Component | Description |
|---|---|
| `ElevenLabsChat.tsx` | Full conversational AI chat interface backed by the ElevenLabs WebSocket API. Renders inside the reports screen as a split-panel overlay. |

### `components/interaction/`

| Component | Description |
|---|---|
| `Interactions.tsx` | Router component that conditionally renders either video or chat interaction |
| `VideoInteraction.tsx` | Embedded video avatar interaction powered by a WebView |

### `components/navigation/`

| Component | Description |
|---|---|
| `HeadingDivider.tsx` | Section header divider used on the home screen |
| `HScroller.tsx` | Horizontal scrolling card strip for featured content |
| `IconButtonCard.tsx` | Tappable card with an icon, heading, and subheading |
| `SimpleButton.tsx` | Primary icon button used in the clinical workspace grid |

### `components/patient/`

| Component | Description |
|---|---|
| `PatientHeader.tsx` | Search bar and total count header for the patients list |
| `PatientRow.tsx` | Individual patient row card with lab details and report action |
| `FilterModal.tsx` | Modal for filtering the patient list |
| `EmptyState.tsx` | Placeholder displayed when no patients are found |
| `LoadingIndicator.tsx` | Spinner used for initial load and pagination |
| `NotificationPermissionModal.tsx` | Modal requesting push notification permission before report ingestion |

### `components/profile/`

| Component | Description |
|---|---|
| `ProfileHeader.tsx` | Displays user initials and name at the top of the profile screen |
| `ProfileTextField.tsx` | Editable text input field for profile data |
| `ProfileDropdownField.tsx` | Dropdown select field for enumerated profile options |
| `ProfileCheckboxField.tsx` | Boolean toggle field for profile settings |
| `FieldDropdownModal.tsx` | Full-screen modal for selecting a dropdown option |
| `ProfileActionButtons.tsx` | Save and cancel action row for the profile form |

### `components/widgets/`

| Component | Description |
|---|---|
| `NewsCard.tsx` | Card component for displaying a single news article |
| `OncoCard.tsx` | Highlighted oncology content card |
| `Tipoftheday.tsx` | Displays a rotating clinical tip of the day from a local dataset |

---

## State Management

The application uses **Jotai** for global reactive state and **react-native-mmkv** for fast, synchronous persistent storage. These two are combined to create atoms that automatically persist their values across app restarts.

### Stores

#### `stores/mmkv.ts`

Initializes the MMKV storage instance and exposes typed helpers:

- `storage` — the raw MMKV instance used throughout the app
- `setFcmToken(token)` / `getFcmToken()` — read and write the Firebase Cloud Messaging token
- `hasSeenNotificationPermission()` / `setHasSeenNotificationPermission(value)` — tracks whether the notification permission modal has been shown

#### `stores/ingestion.ts`

Tracks the in-flight state of report RAG ingestion requests. This allows the UI to show an "Analyzing" spinner on rows that are currently being ingested, even while navigating between screens.

| Atom | Type | Description |
|---|---|---|
| `ingestionIdsAtom` | `Set<string>` | Set of assay result IDs currently being ingested |
| `addIngestionIdAtom` | write-only | Adds an ID to the ingestion set |
| `removeIngestionIdAtom` | write-only | Removes an ID from the ingestion set |
| `getIngestionIdsAtom` | read-only derived | Returns the current ingestion set |

#### `stores/scribe.ts`

Manages locally stored scribe (audio recording) sessions. Sessions are persisted to MMKV as a JSON string so they survive app restarts.

| Atom | Description |
|---|---|
| `scribeSessionsAtom` | Base atom initialized from MMKV storage on startup |
| `persistentScribeSessionsAtom` | Derived atom that writes to both the base atom and MMKV on every update |

#### `stores/theme.ts`

Manages the user's theme preference (`'light'` or `'dark'`). The selected theme is persisted to MMKV and synced with NativeWind's color scheme system via the `useThemeSync` hook.

---

## Services and API Layer

All network communication flows through a single centralized HTTP client (`services/fetchClient.ts`) which handles authentication headers, content-type negotiation, 401 session expiry, and error normalization.

### HTTP Client — `services/fetchClient.ts`

The `apiFetch` function wraps the native `fetch` API with the following behavior:

- **Request Interceptor**: Reads the JWT token from MMKV and attaches it as a `Bearer` token in the `Authorization` header. Attaches the device's local timezone in a `Timezone` header for server-side time formatting.
- **Response Interceptor**: On a `401 Unauthorized` response, clears all MMKV storage and redirects to the app's root route, effectively logging the user out.
- **Content Negotiation**: Automatically parses JSON responses or falls back to raw text.
- **Error Normalization**: Normalizes HTTP errors into a structured object containing `status`, `message`, and `data`.

---

### `services/config.ts` — App Configuration API

Fetches server-side feature flags for the application.

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `configAPI.getConfig()` | GET | `{CHAT_URL}/drg/api/config` | Returns a configuration object. Currently controls the `showVideoAvatar` flag that shows or hides the video call button on the reports screen. |

---

### `services/users.ts` — Users and Authentication API

Handles all user identity operations. REST endpoints use `EXPO_PUBLIC_API_BASE_URL` and GraphQL operations use `EXPO_PUBLIC_GQL_URL`.

| Method | Transport | Endpoint / Query | Description |
|---|---|---|---|
| `usersAPI.authenticateUser(username, password)` | POST REST | `/api/token` | Submits credentials and returns a JWT token on success. |
| `usersAPI.revokeToken(token)` | POST REST | `/api/token/revoke` | Invalidates the current session token on logout. |
| `usersAPI.getUserDetail(userMasterId)` | GraphQL Query | `getUserDetail` | Fetches structured field data for a user by their internal ID. Used during login to populate the user profile in context. |
| `usersAPI.getUserProfile()` | GraphQL Query | `getUserProfile` | Fetches the full profile data for the currently authenticated user, including all editable fields and role/organization mappings. |
| `usersAPI.updateUserProfile(userMasterModel, eSignatureModel)` | GraphQL Mutation | `saveUserProfile` | Saves updated profile fields. Requires an e-signature payload for audit trail compliance. |
| `usersAPI.sendMfaOtp(otpMedium)` | GraphQL Mutation | `sendMfaOtp` | Triggers an OTP to be sent to the specified delivery medium (email or phone). |
| `usersAPI.verifyMfaOtp(otpMedium, otp)` | GraphQL Mutation | `verifyMfaOtp` | Verifies the OTP provided by the user to confirm MFA method changes. |
| `usersAPI.changePassword(params)` | POST REST | `/api/v1/users/changePassword` | Changes the user's password, submitted as `application/x-www-form-urlencoded`. |
| `usersAPI.sendResetPasswordLink(email)` | POST REST | `/api/v1/users/resetPasswordLink` | Triggers a password reset email, submitted as `application/x-www-form-urlencoded`. |

---

### `services/patients.ts` — Patient Data API

Fetches paginated and searchable patient test result data via GraphQL.

| Method | GraphQL Query | Description |
|---|---|---|
| `patientsAPI.fetchTestsDetails(page, count, searchQuery)` | `fetchTestsDetailsForDrG` | Returns a paginated list of patient records with lab and workflow metadata. Sorted by `analysisCompletionDate` descending. Supports free-text search and is scoped to the authenticated user's role via `restrictByRole: true`. Page size defaults to 10. |

**Patient Object Fields**

Each returned `Patient` object includes: `patientName`, `assayName`, `sampleBarcode`, `gender`, `age`, `physicianName`, `facility`, `diseaseName`, `workflowStatus`, `analysisCompletionDate`, `full_report_path`, `summary_report_path`, `documentId`, `drg_ingestion_status`, and `assayResultIds`.

---

### `services/rag.ts` — Report Ingestion and RAG Query API

Handles the ingestion of patient reports into a vector store for AI-powered question answering.

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `ragAPI.ingestReport(assayResultIds)` | POST REST | `/api/v1/drg/rag` | Submits a set of assay result IDs for ingestion into the RAG vector store. Sent as `multipart/form-data`. If a Firebase Cloud Messaging token is available and the user has granted notification permissions, the `fcmKey` is included so the server can push a notification when ingestion is complete. |
| `ragAPI.fetchReportResult(documentId, authorization)` | GET REST | `/api/v1/drg/rag` | Retrieves raw vector data for a given document ID. Used to verify ingestion results with parameters `rawVector=true`, `topK=100`, `scope=general`. |
| `ragAPI.getSignedUrl(blobPath)` | GET REST | `/api/v1/storage/blobStoreObjects/{encodedPath}/signedUrl` | Fetches a temporary signed URL for accessing a blob storage object (used here to open PDFs). |

---

### `services/storage.ts` — Blob Storage API

Handles file uploads and signed URL generation for the blob storage system.

| Method | Transport | Endpoint / Query | Description |
|---|---|---|---|
| `storageAPI.getUploadConfig()` | GraphQL Query | `getUploadConfig` | Returns configuration for the blob storage system, including the default `targetLocation` for file uploads. |
| `storageAPI.uploadFile(file, targetLocation, eSignature)` | POST REST | `/api/v1/storage/blobStoreObjects` | Uploads a file to blob storage as `multipart/form-data`. Requires an e-signature payload. Returns a `storageId` on success. |
| `storageAPI.getSignedUrl(blobPath)` | GET REST | `/api/v1/storage/blobStoreObjects/{encodedPath}/signedUrl?viewFile=true` | Generates a time-limited signed URL to access a file in blob storage. Used to render PDF reports in the viewer. |

---

### `services/elevenlabs.ts` — ElevenLabs AI Chat API

Obtains a signed WebSocket URL for initiating a real-time conversational AI session.

| Method | HTTP | Endpoint | Description |
|---|---|---|---|
| `elevenLabsAPI.getSignedUrl()` | POST REST | `{CHAT_URL}/drg/api/auth/elevenlabs/?agent_id={AGENT_ID}` | Returns a signed WebSocket URL. The client uses this URL to open a direct WebSocket connection to ElevenLabs for low-latency audio and text streaming. The URL is short-lived and scoped to the configured agent ID. |

---

## Authentication Flow

1. On app launch, `AuthContext` reads the JWT token from MMKV storage.
2. If no token is found, the user is redirected to `/login`.
3. If a token exists, it is decoded using `decryptToken` (a JWT payload parser in `util/helpers.ts`). If the token is invalid or expired, storage is cleared and the user is sent to login.
4. Upon a valid token, `getUserDetail` and `getUploadConfig` are called in parallel to hydrate the user context and retrieve the file upload target location.
5. The user is then redirected to `/(tabs)`.
6. On login form submission, `authenticateUser` is called, the returned token is stored in MMKV, and the same hydration sequence runs.
7. On logout, `revokeToken` is called asynchronously (failures are silently swallowed), and the router navigates to `/login?logout=true`. The login screen handles clearing MMKV and resetting context state.
8. Any API response with HTTP 401 triggers the `apiFetch` interceptor which independently clears MMKV and redirects to `/`.

---

## Environment Variables

The application reads environment variables from `.env`, `.env.preview`, and `.env.production` files. All variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the client bundle.

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Base URL for all REST API calls |
| `EXPO_PUBLIC_GQL_URL` | Base URL for GraphQL API calls (appended with `/graphql`) |
| `EXPO_PUBLIC_CHAT_URL` | Base URL for the Dr.G chat and config service |
| `EXPO_PUBLIC_ELEVENLABS_AGENT_ID` | ElevenLabs agent ID for conversational AI sessions |
| `EXPO_PUBLIC_MTB_URL` | External URL for the Molecular Tumor Board (MTB) web app |
| `EXPO_PUBLIC_PUBLICATIONS_URL` | External URL for 1Cell.Ai publications and posters |
| `EXPO_PUBLIC_ENABLE_FIREBASE` | Set to `"true"` to enable Firebase Cloud Messaging for push notifications |
| `EXPO_PUBLIC_FIREBASE_IOS_API_KEY` | Firebase iOS API key |
| `EXPO_PUBLIC_FIREBASE_ANDROID_API_KEY` | Firebase Android API key |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket name |
| `EXPO_PUBLIC_FIREBASE_IOS_APP_ID` | Firebase iOS application ID |
| `EXPO_PUBLIC_FIREBASE_ANDROID_APP_ID` | Firebase Android application ID |
| `EXPO_PUBLIC_FIREBASE_IOS_MESSAGING_SENDER_ID` | Firebase iOS messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_DATABASE_URL` | Firebase Realtime Database URL |

---

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~55.0.2 | Core Expo SDK |
| `expo-router` | ~55.0.2 | File-based navigation |
| `react-native` | 0.83.2 | Core React Native runtime |
| `nativewind` | ^4.2.1 | Tailwind CSS utility classes for React Native |
| `tailwindcss` | ^3.4.18 | Underlying CSS framework for NativeWind |
| `jotai` | ^2.15.2 | Atomic global state management |
| `react-native-mmkv` | ^4.1.0 | High-performance key-value persistent storage |
| `@shopify/flash-list` | 2.0.2 | Performant virtualized list for patient data |
| `react-native-reanimated` | 4.2.1 | Native-thread animations |
| `@react-native-firebase/messaging` | ^23.7.0 | Firebase Cloud Messaging for push notifications |
| `expo-notifications` | ~55.0.10 | Local and push notification scheduling |
| `react-native-pdf` | ^7.0.3 | PDF rendering for medical reports |
| `expo-audio` | ~55.0.8 | Audio recording for the scribe feature |
| `expo-speech-recognition` | ^3.0.1 | Speech recognition for voice input |
| `lucide-react-native` | ^0.555.0 | Icon set |
| `react-native-gesture-handler` | ~2.30.0 | Native gesture recognition |
| `react-native-safe-area-context` | ~5.6.0 | Safe area inset handling |
| `react-native-toast-message` | ^2.3.3 | In-app toast notifications |
| `@expo-google-fonts/poppins` | ^0.4.1 | Poppins font family |

---

## Build and Deployment

The project uses **EAS Build** (Expo Application Services) for creating production binaries.

**EAS Project ID:** `5b4db04e-a018-4387-9b2e-92bbbdc58c37`
**EAS Owner:** `1cellapps`

Build profiles are defined in `eas.json`. To trigger a build:

```bash
eas build --platform ios
eas build --platform android
```

**Application Identifiers**

| Platform | Identifier |
|---|---|
| iOS bundle | `ai.onecell.drg` |
| Android package | `com.onecellai.drg` |
| App version | `1.1.3` |

**Required Native Permissions**

- Microphone — for voice interactions and scribe recording
- Speech Recognition — for voice input
- Camera — for video calls
- Photo Library — for uploading documents
- Push Notifications — for report ingestion completion alerts

---

## Development Conventions

- **Styling**: NativeWind utility classes are applied directly via the `className` prop. Custom theme tokens are defined in `tailwind.config.js`.
- **Fonts**: Poppins is the primary typeface, loaded via `useFonts` in the root layout.
- **Path Aliases**: The `@/` prefix resolves to the project root, configured in `tsconfig.json`.
- **Formatting**: Prettier with `@trivago/prettier-plugin-sort-imports` enforces import ordering and consistent code style. Run `npm run format` before committing.
- **Network Debugging**: In development builds, `react-native-network-logger` is automatically started and a network log overlay is rendered at the bottom of the screen.
