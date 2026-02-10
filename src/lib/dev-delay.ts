// Development-only artificial delay to preview skeleton loading states
// Set to 0 or remove in production
export const DEV_LOADING_DELAY_MS = 1500;

export const devDelay = (ms = DEV_LOADING_DELAY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));
