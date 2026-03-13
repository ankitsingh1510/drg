# SDK Migration Updates

**Date:** 2026-03-13
**Scope:** Expo SDK 55 to SDK 54 downgrade, Node update, dependency alignment, build fixes

---

## Node.js

- Updated Node.js from v20.19.2 to v20.19.4 via nvm (minimum required by SDK 54)

## Expo SDK

- Downgraded Expo from ~55.0.2 to ~54.0.0
- Ran `npx expo install --fix` to auto-resolve all expo-* subpackage versions for SDK 54
- Removed `.npmrc` with `legacy-peer-deps=true` (no longer needed with SDK 54)

## Core Dependencies

| Package | Before (SDK 55) | After (SDK 54) |
|---|---|---|
| expo | ~55.0.2 | ~54.0.0 |
| react | 19.2.0 | 19.1.0 |
| react-native | 0.83.2 | 0.81.5 |
| expo-router | ~55.0.2 | ~6.0.23 |
| react-native-reanimated | 4.2.1 | ~4.1.6 |
| react-native-worklets | 0.7.2 | 0.5.1 |
| react-native-safe-area-context | ~4.14.0 | ~5.6.0 |
| react-native-screens | ~4.16.0 | ~4.16.0 |
| react-native-gesture-handler | ~2.21.2 | ~2.28.0 |
| react-native-svg | ~15.9.0 | 15.12.1 |
| react-native-web | ~0.19.13 | ~0.21.0 |
| react-native-webview | 13.12.5 | 13.15.0 |
| @expo/vector-icons | ^14.0.4 | ^15.0.3 |
| @types/react | ~19.0.10 | ~19.1.0 |
| eslint-config-expo | ~8.0.0 | ~10.0.0 |
| typescript | ~5.8.3 | ~5.9.2 |
| lucide-react-native | ^0.475.0 | ^0.577.0 |
| @react-native-firebase/app | ^21.12.2 | ^23.7.0 |
| @react-native-firebase/messaging | ^21.12.2 | ^23.7.0 |
| @shopify/flash-list | 1.7.3 | 2.0.2 |

## react-native-mmkv

- Downgraded from v4.x to v3.2.0
- v4 uses Nitro Modules for its native bridge, which fails to resolve C++ headers (`PropNameIDCache.hpp`) when `useFrameworks: static` is enabled in expo-build-properties
- Updated `stores/mmkv.ts`: changed `import { createMMKV }` to `import { MMKV }` and `createMMKV()` to `new MMKV()`

## app.json

- Removed `expo-image` from the plugins array (expo-image v3 does not ship a config plugin; leaving it caused a PluginError during prebuild)
- Updated `expo-build-properties` config: removed `podfileProperties.use_modular_headers!`, added `ccacheEnabled: false` and `extraPodfileProperties`

## SafeAreaView Deprecation Warning

- Root cause: `react-native-css-interop` (NativeWind) registers CSS interop on the built-in `react-native` SafeAreaView at module load time, triggering the deprecation warning
- All project code already uses `SafeAreaView` from `react-native-safe-area-context`
- Added `LogBox.ignoreLogs(['SafeAreaView has been deprecated'])` in `app/_layout.tsx` to suppress the yellow warning box in the app UI
- The warning still appears in the Metro terminal console (developer-facing only, expected behavior)

## iOS Build Fix (Xcode 26 / Swift 6.2)

- The auto-generated `ExpoModulesProvider.swift` has `import Expo` which causes an "ambiguous implicit access level" error under Swift 6.2 strict mode
- Fix: patch `import Expo` to `public import Expo` in `ios/Pods/Target Support Files/Pods-drg/ExpoModulesProvider.swift`
- This patch must be re-applied after every `pod install` or `npx expo prebuild`
- Deleted ios/ directory and ran `npx expo prebuild --platform ios --clean` for a fresh native project
- Deleted Podfile.lock to resolve stale Firebase pod version conflicts (12.8.0 vs 12.10.0)

## Build and Run Status

- Native iOS build succeeds with xcodebuild targeting iPhone 16 Pro simulator (iOS 18.3)
- Metro bundler serves the JS bundle (3902 modules, ~1s bundle time)
- App launches and reaches the login screen
- MMKV storage working correctly with v3 API
- Firebase messaging initialized (skipped on simulator as expected)

## Known Warnings (Non-blocking)

- XHRInterceptor resolution warnings from react-native package.json exports field (react-native 0.81 issue, harmless)
- Xcode "Run script build phase" warnings about missing output declarations in CocoaPods targets
- react-native-blob-util deprecation warnings for `getBytes:fromOffset:length:error:` (iOS 9 API)
- IPHONEOS_DEPLOYMENT_TARGET set to 11.0 in react-native-blob-util privacy bundle (below minimum 12.0)

## Files Changed

- `package.json` -- all dependency versions updated for SDK 54
- `app.json` -- removed expo-image plugin, updated expo-build-properties config
- `stores/mmkv.ts` -- MMKV v4 API replaced with v3 API
- `app/_layout.tsx` -- added LogBox.ignoreLogs for SafeAreaView warning
- `.npmrc` -- deleted (no longer needed)
- `ios/` -- regenerated via `npx expo prebuild --platform ios --clean`
