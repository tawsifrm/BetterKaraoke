/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0891b2'; // Cyan-600
const tintColorDark = '#06b6d4'; // Cyan-500

export const Colors = {
  light: {
    text: '#1e293b',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    primary: '#0891b2', // Cyan-600
    secondary: '#0e7490', // Cyan-700
    accent: '#06b6d4', // Cyan-500
    surface: '#f8fafc', // Slate-50
    card: '#ffffff',
  },
  dark: {
    text: '#f1f5f9',
    background: '#0f172a', // Slate-900
    tint: tintColorDark,
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
    primary: '#0891b2', // Cyan-600
    secondary: '#0e7490', // Cyan-700
    accent: '#06b6d4', // Cyan-500
    surface: '#1e293b', // Slate-800
    card: '#334155', // Slate-700
  },
};
