import { AppConfig } from "@app/contexts/AppConfigContext";

/**
 * Default configuration used while the bundled backend starts up.
 * All premium/enterprise features unlocked for desktop standalone mode.
 */
export const DESKTOP_DEFAULT_APP_CONFIG: AppConfig = {
  enableLogin: false,
  isAdmin: true,
  premiumEnabled: true,
  runningProOrHigher: true,
  runningEE: true,
  license: "ENTERPRISE",
};
