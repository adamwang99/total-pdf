import React from "react";
import { useTranslation } from "react-i18next";
import { SlideConfig } from "@app/types/types";
import styles from "@app/components/onboarding/InitialOnboardingModal/InitialOnboardingModal.module.css";
import { UNIFIED_CIRCLE_CONFIG } from "@app/components/onboarding/slides/unifiedBackgroundConfig";
import { Group, Badge, Text } from "@mantine/core";

function WelcomeSlideTitle() {
  const { t } = useTranslation();

  return (
    <span className={styles.welcomeTitleContainer}>
      {t("onboarding.welcomeSlide.title", "Welcome to Total PDF")}
      <span className={styles.v2Badge}>V2</span>
    </span>
  );
}

const WelcomeSlideBody = () => {
  const { t } = useTranslation();
  return (
    <>
      <Text size="sm" mb="sm">
        {t(
          "onboarding.welcomeSlide.body",
          "Total PDF is a full-featured PDF platform that runs completely locally — no documents ever leave your machine. Edit, sign, redact, OCR, convert, merge, split, compress, and automate PDFs without sending data to third-party services.",
        )}
      </Text>
      <Group gap="xs" justify="center" mt="md">
        <Badge variant="light" color="blue" size="sm">
          {t("onboarding.welcomeSlide.badge.local", "100% Local")}
        </Badge>
        <Badge variant="light" color="green" size="sm">
          {t("onboarding.welcomeSlide.badge.tools", "54 Tools")}
        </Badge>
        <Badge variant="light" color="violet" size="sm">
          {t("onboarding.welcomeSlide.badge.privacy", "Zero Egress")}
        </Badge>
      </Group>
    </>
  );
};

export default function WelcomeSlide(): SlideConfig {
  return {
    key: "welcome",
    title: <WelcomeSlideTitle />,
    body: <WelcomeSlideBody />,
    background: {
      gradientStops: ["#7C3AED", "#EC4899"],
      circles: UNIFIED_CIRCLE_CONFIG,
    },
  };
}
