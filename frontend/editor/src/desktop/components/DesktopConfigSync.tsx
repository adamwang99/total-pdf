/**
 * Desktop-only bridge: intentionally disabled for standalone mode.
 *
 * The bundled backend returns its own (non-premium) config, which would
 * downgrade the frontend to free tier. Since Total PDF Desktop is always
 * fully unlocked, we never overwrite the initial all-premium config.
 */
export function DesktopConfigSync() {
  return null;
}
