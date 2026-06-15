const ENV = process.env.APP_ENV || 'development';

const GOOGLE_SERVICES_JSON = './google-services.json';
const GOOGLE_SERVICES_PLIST = './GoogleService-Info.plist';

const API_URL = process.env.API_URL || '';
const GQL_URL = process.env.GQL_URL || '';
const AMPLIFY_URL = process.env.AMPLIFY_URL || '';
const RAG_SOCKET_URL = process.env.RAG_SOCKET_URL || '';
const NEWS_API_URL = process.env.NEWS_API_URL || '';
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';

const envConfig = {
  development: {
    name: 'DrG (Dev)',
    package: 'com.onecellai.drg.dev',
    bundleIdentifier: 'ai.onecell.drg.dev',
  },
  qa: {
    name: 'DrG (QA)',
    package: 'com.onecellai.drg.qa',
    bundleIdentifier: 'ai.onecell.drg.qa',
  },
  production: {
    name: 'DrG',
    package: 'com.onecellai.drg',
    bundleIdentifier: 'ai.onecell.drg',
  },
};

const current = envConfig[ENV] || envConfig.development;

export default {
  expo: {
    name: current.name,
    slug: "drg",
    version: "1.1.8",
    orientation: "portrait",
    icon: "./assets/images/DrG-logo.png",
    scheme: "drg",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      buildNumber: "6",
      supportsTablet: true,
      googleServicesFile: GOOGLE_SERVICES_PLIST,
      infoPlist: {
        NSSpeechRecognitionUsageDescription: "This app uses speech recognition to enable voice input when you choose to interact with Dr.G.",
        NSMicrophoneUsageDescription: "This app requires access to your microphone to capture your voice for voice interactions with Dr.G.",
        NSCameraUsageDescription: "This app requires access to your camera for video calls and capturing images when you choose to do so.",
        NSPhotoLibraryUsageDescription: "This app accesses your photo library only when you choose to upload images or documents such as medical records or reports.",
        NSPhotoLibraryAddUsageDescription: "This app requires access to your photo library to save medical reports and images."
      },
      bundleIdentifier: current.bundleIdentifier,
      appleTeamId: "W2K6NCXTGV"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: "./assets/images/DrG-android-foreground.png"
      },
      googleServicesFile: GOOGLE_SERVICES_JSON,
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "RECORD_AUDIO",
        "MODIFY_AUDIO_SETTINGS",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.DOWNLOAD_WITHOUT_NOTIFICATION",
        "android.permission.ACCESS_NETWORK_STATE"
      ],
      package: current.package
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/onecell-brand.png"
    },
    plugins: [
      "@config-plugins/react-native-blob-util",
      "@config-plugins/react-native-pdf",
      "expo-speech-recognition",
      "expo-router",
      "expo-notifications",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/Drg_logo_splash.png",
          imageWidth: 210,
          resizeMode: "contain",
          backgroundColor: "#1A365D",
          dark: {
            image: "./assets/images/Drg_logo_splash.png",
            backgroundColor: "#1A365D"
          }
        }
      ],
      "expo-web-browser",
      "expo-font",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            buildReactNativeFromSource: true,
            deploymentTarget: "16.0",
            ccacheEnabled: false,
            extraPodfileProperties: {
              SWIFT_VERSION: "5.0"
            }
          }
        }
      ],
      "expo-audio",
      "expo-speech-transcriber"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: false
    },
    extra: {
      router: {},
      eas: {
        projectId: "5b4db04e-a018-4387-9b2e-92bbbdc58c37"
      },
      apiUrl: API_URL,
      gqlUrl: GQL_URL,
      amplifyUrl: AMPLIFY_URL,
      ragSocketUrl: RAG_SOCKET_URL,
      newsApiUrl: NEWS_API_URL,
      newsApiKey: NEWS_API_KEY,
      appEnv: ENV,
    },
    owner: "1cellapps"
  }
};