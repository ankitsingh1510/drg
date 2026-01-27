# Project Overview

This is a React Native mobile application built with Expo. It uses TypeScript, NativeWind for styling (which is based on Tailwind CSS), and Expo Router for file-based routing. The application appears to be a client for a system that manages patient data and medical reports, likely for a system called "Dr.G". It includes features for user authentication, fetching patient data from a GraphQL API, and displaying reports.

## Building and Running

To get started with the app, follow these steps:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Start the development server:**

    ```bash
    npx expo start
    ```

    This will open the Expo developer tools in your browser. You can then choose to run the app on:
    - An Android emulator
    - An iOS simulator
    - Expo Go on a physical device

### Other useful commands:

- **Run on Android:** `npm run android`
- **Run on iOS:** `npm run ios`
- **Run on Web:** `npm run web`
- **Lint the code:** `npm run lint`
- **Format the code:** `npm run format`

## Development Conventions

- **Styling:** The project uses NativeWind for styling, which is based on Tailwind CSS. Utility classes are used directly in the `className` prop of components.
- **Routing:** The project uses Expo Router for file-based routing. The `app` directory contains all the screens and routes.
- **Authentication:** Authentication is handled via a `AuthContext` which stores the user's token and profile information. The `useAuth` hook provides access to the authentication state and functions.
- **Data Fetching:** Data is fetched from a GraphQL API. The `services` directory contains the API client and functions for fetching data.
- **State Management:** The project uses `jotai` for state management, as seen in the dependencies.
- **Storage:** The project uses `react-native-mmkv` for persistent storage, as seen in `context/AuthContext.tsx` and the `stores` directory.

## File Structure

- `app/`: Contains all the screens and routes for the application.
  - `_layout.tsx`: The root layout of the application.
  - `index.tsx`: The initial screen, which handles redirection based on authentication state.
  - `login.tsx`: The login screen.
  - `landing.tsx`: The landing screen after login.
  - `patients.tsx`: The screen for displaying a list of patients.
- `components/`: Contains reusable components.
- `context/`: Contains React context providers, such as the `AuthContext`.
- `services/`: Contains the API client and functions for fetching data from the GraphQL API.
- `types/`: Contains TypeScript type definitions.
- `assets/`: Contains static assets like images and fonts.
- `tailwind.config.js`: Configuration for Tailwind CSS.
- `metro.config.js`: Configuration for the Metro bundler.
- `app.json`: Configuration for the Expo project.

## Remove IPA / APK files
