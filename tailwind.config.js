/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/index.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        'outfit': ['Outfit_400Regular'],
        'outfit-thin': ['Outfit_100Thin'],
        'outfit-extralight': ['Outfit_200ExtraLight'],
        'outfit-light': ['Outfit_300Light'],
        'outfit-medium': ['Outfit_500Medium'],
        'outfit-semibold': ['Outfit_600SemiBold'],
        'outfit-bold': ['Outfit_700Bold'],
        'outfit-extrabold': ['Outfit_800ExtraBold'],
        'outfit-black': ['Outfit_900Black'],
      },
      fontSize: {
        'xs':   'var(--font-xs)',
        'sm':   'var(--font-sm)',
        'base': 'var(--font-base)',
        'lg':   'var(--font-lg)',
        'xl':   'var(--font-xl)',
        '2xl':  'var(--font-2xl)',
        '3xl':  'var(--font-3xl)',
        '4xl':  'var(--font-4xl)',
        '5xl':  'var(--font-5xl)',
        'md':   'var(--font-md)',
      },
    },
  },
  plugins: [],
}