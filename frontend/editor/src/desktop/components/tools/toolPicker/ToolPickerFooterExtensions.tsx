import { useState, useEffect } from "react";
import { Group, Text, Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  connectionModeService,
  type ConnectionMode,
} from "@app/services/connectionModeService";
import { OPEN_SIGN_IN_EVENT } from "@app/constants/signInEvents";
import { useAppConfig } from "@app/contexts/AppConfigContext";

/**
 * Desktop-only footer shown at the bottom of the tool list.
 * In local (offline) mode with login enabled: prompts the user to sign in
 * to unlock cloud tools.
 * In desktop standalone (login disabled) or other modes: renders nothing.
 */
export function ToolPickerFooterExtensions() {
  const { t } = useTranslation();
  const { config } = useAppConfig();
  const loginEnabled = config?.enableLogin !== false;
  const [connectionMode, setConnectionMode] = useState<ConnectionMode | null>(
    null,
  );

  useEffect(() => {
    void connectionModeService.getCurrentMode().then(setConnectionMode);
    const unsubscribe = connectionModeService.subscribeToModeChanges(
      (config) => {
        setConnectionMode(config.mode);
      },
    );
    return unsubscribe;
  }, []);

  // Desktop standalone mode: no sign-in needed, all tools available locally
  if (!loginEnabled) return null;
  if (connectionMode !== "local") return null;

  return (
    <Group
      gap="xs"
      align="center"
      justify="space-between"
      wrap="nowrap"
      px="sm"
      py={10}
      style={{
        borderTop: "1px solid var(--border-default)",
        background: "var(--bg-toolbar)",
        flexShrink: 0,
      }}
    >
      <Text size="xs" c="dimmed" style={{ flex: 1, minWidth: 0 }}>
        {t("localMode.toolPicker.message", "Sign in to unlock all tools.")}
      </Text>
      <Button
        size="compact-xs"
        variant="light"
        color="blue"
        style={{ flexShrink: 0 }}
        onClick={() =>
          window.dispatchEvent(new CustomEvent(OPEN_SIGN_IN_EVENT))
        }
      >
        {t("localMode.toolPicker.signIn", "Sign In")}
      </Button>
    </Group>
  );
}
