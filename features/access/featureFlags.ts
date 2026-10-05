export const isResearchToolsEnabled = process.env.EXPO_PUBLIC_ENABLE_RESEARCH_TOOLS === 'true';

const isDevelopmentBuild = typeof __DEV__ !== 'undefined' && __DEV__;

export const isDeveloperDiagnosticsEnabled =
  isDevelopmentBuild || process.env.EXPO_PUBLIC_SHOW_AUTH_DIAGNOSTICS === 'true';
