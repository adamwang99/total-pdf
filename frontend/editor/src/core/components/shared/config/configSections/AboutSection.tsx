import React from "react";
import { Paper, Stack, Text, Group, Badge, Divider, Anchor, ThemeIcon, List } from "@mantine/core";
import { useTranslation } from "react-i18next";
import LocalIcon from "@app/components/shared/LocalIcon";

const AboutSection: React.FC = () => {
  const { t } = useTranslation();

  const tools = [
    { group: "onboarding.about.groups.edit", tools: ["AddText", "AddImage", "AddStamp", "AddWatermark", "AddPageNumbers", "Annotate", "pdfTextEditor"] },
    { group: "onboarding.about.groups.organize", tools: ["Merge", "Split", "ExtractPages", "RemovePages", "ReorganizePages", "Rotate", "Crop", "PageLayout", "BookletImposition"] },
    { group: "onboarding.about.groups.security", tools: ["Sign", "CertSign", "Redact", "AddPassword", "RemovePassword", "Sanitize", "ValidateSignature"] },
    { group: "onboarding.about.groups.convert", tools: ["Convert", "OCR", "Compress", "ExtractImages", "Flatten"] },
    { group: "onboarding.about.groups.utility", tools: ["Compare", "Repair", "ChangeMetadata", "GetPdfInfo", "formFill", "Automate"] },
  ];

  return (
    <Stack gap="lg">
      {/* What is Total PDF */}
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="md" mb="xs">
          {t("onboarding.about.whatIs.title", "What is Total PDF?")}
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          {t(
            "onboarding.about.whatIs.body",
            "Total PDF is a full-featured PDF platform that runs completely locally — no documents ever leave your machine. Use it as a desktop app, a browser UI, or a self-hosted server with a private REST API. Edit, sign, redact, OCR, convert, merge, split, compress, and automate PDF workflows without sending data to third-party services. Built with Spring Boot, React, and Tauri, running on Java 25.",
          )}
        </Text>
        <Group gap="xs" wrap="wrap">
          <Badge variant="light" color="blue" size="sm">v2.11.0</Badge>
          <Badge variant="light" color="green" size="sm">{t("onboarding.about.badge.local", "100% Local")}</Badge>
          <Badge variant="light" color="violet" size="sm">54 {t("onboarding.about.badge.tools", "Tools")}</Badge>
          <Badge variant="light" color="orange" size="sm">40+ {t("onboarding.about.badge.languages", "Languages")}</Badge>
          <Badge variant="light" color="teal" size="sm">171 API {t("onboarding.about.badge.endpoints", "Endpoints")}</Badge>
        </Group>
      </Paper>

      {/* Why offline-first */}
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="md" mb="xs">
          {t("onboarding.about.privacy.title", "Privacy-First Design")}
        </Text>
        <List spacing="xs" size="sm">
          <List.Item>
            <Text size="sm">
              <strong>{t("onboarding.about.privacy.zeroEgress", "Zero Egress")}</strong> — {t("onboarding.about.privacy.zeroEgressDesc", "All processing runs on your machine. Total PDF never uploads documents to any external service.")}
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>{t("onboarding.about.privacy.noTelemetry", "No Telemetry")}</strong> — {t("onboarding.about.privacy.noTelemetryDesc", "The app does not phone home. No analytics, no crash reporters, no usage tracking by default.")}
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>{t("onboarding.about.privacy.airGap", "Air-Gap Ready")}</strong> — {t("onboarding.about.privacy.airGapDesc", "Self-host mode runs on networks with no internet access. Nothing leaves the deployment boundary.")}
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>{t("onboarding.about.privacy.encryption", "Encryption at Rest")}</strong> — {t("onboarding.about.privacy.encryptionDesc", "Password-protected PDFs use AES-128/256, matching PDF 2.0 spec.")}
            </Text>
          </List.Item>
        </List>
      </Paper>

      {/* Tools overview */}
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="md" mb="md">
          {t("onboarding.about.tools.title", "54 Tools — One Platform")}
        </Text>
        {tools.map((group) => (
          <React.Fragment key={group.group}>
            <Text fw={500} size="sm" mt="sm" mb="xs" c="blue">
              {t(group.group, group.group.split(".").pop()!)}
            </Text>
            <Group gap="xs" wrap="wrap">
              {group.tools.map((tool) => (
                <Badge key={tool} variant="outline" color="gray" size="sm">
                  {tool}
                </Badge>
              ))}
            </Group>
          </React.Fragment>
        ))}
      </Paper>

      {/* Deployment modes */}
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="md" mb="md">
          {t("onboarding.about.deploy.title", "Three Ways to Run")}
        </Text>
        <Stack gap="md">
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <ThemeIcon size="md" radius="md" variant="light" color="blue">
              <LocalIcon icon="desktop-windows-rounded" width="1rem" height="1rem" />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500}>
                {t("onboarding.about.deploy.desktop", "Desktop App")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("onboarding.about.deploy.desktopDesc", "Native macOS .dmg, Windows .msi, Linux .AppImage. Bundled JRE — no server setup needed.")}
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <ThemeIcon size="md" radius="md" variant="light" color="violet">
              <LocalIcon icon="language-rounded" width="1rem" height="1rem" />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500}>
                {t("onboarding.about.deploy.browser", "Browser UI")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("onboarding.about.deploy.browserDesc", "Full SPA at http://localhost:8080. All 54 tools, pipeline builder, REST API explorer.")}
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <ThemeIcon size="md" radius="md" variant="light" color="green">
              <LocalIcon icon="dns-rounded" width="1rem" height="1rem" />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500}>
                {t("onboarding.about.deploy.server", "Self-Host Server")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("onboarding.about.deploy.serverDesc", "Docker, Kubernetes, or raw JAR. Private REST API. On-prem, air-gapped, or cloud VPC.")}
              </Text>
            </div>
          </Group>
        </Stack>
      </Paper>

      {/* Quick links */}
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="md" mb="xs">
          {t("onboarding.about.resources.title", "Resources")}
        </Text>
        <Stack gap="xs">
          <Anchor href="https://github.com/adamwang99/total-pdf" target="_blank" size="sm">
            {t("onboarding.about.resources.github", "GitHub Repository")}
          </Anchor>
          <Anchor href="https://github.com/adamwang99/total-pdf/blob/rebrand/total-pdf/README.md" target="_blank" size="sm">
            {t("onboarding.about.resources.readme", "README — Full Feature Documentation")}
          </Anchor>
          <Anchor href="https://github.com/adamwang99/total-pdf/issues" target="_blank" size="sm">
            {t("onboarding.about.resources.issues", "Report Issues")}
          </Anchor>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default AboutSection;
