import React from "react";
import { Button, Group, Paper, Stack, Text, Divider, Anchor, List } from "@mantine/core";
import { useTranslation } from "react-i18next";
import LocalIcon from "@app/components/shared/LocalIcon";
import { requestStartTour } from "@app/constants/events";

interface HelpSectionProps {
  isAdmin: boolean;
  onRequestClose: () => void;
}

const HelpSection: React.FC<HelpSectionProps> = ({
  isAdmin,
  onRequestClose,
}) => {
  const { t } = useTranslation();

  const startTour = (tourType: "tools" | "admin") => {
    onRequestClose();
    setTimeout(() => requestStartTour(tourType), 300);
  };

  return (
    <Stack gap="lg">
      {/* Tours */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <div>
              <Text fw={600} size="sm">
                {t("settings.help.toolsTour.title", "Tools Tour")}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {t(
                  "settings.help.toolsTour.description",
                  "Walk through uploading files, picking a tool, and reviewing results.",
                )}
              </Text>
            </div>
            <Button
              variant="default"
              size="sm"
              leftSection={
                <LocalIcon
                  icon="build-outline-rounded"
                  width="1rem"
                  height="1rem"
                />
              }
              onClick={() => startTour("tools")}
            >
              {t("settings.help.toolsTour.start", "Start")}
            </Button>
          </Group>

          {isAdmin && (
            <Group justify="space-between" align="center">
              <div>
                <Text fw={600} size="sm">
                  {t("settings.help.adminTour.title", "Admin Tour")}
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  {t(
                    "settings.help.adminTour.description",
                    "Explore team management, system settings, and enterprise features.",
                  )}
                </Text>
              </div>
              <Button
                variant="default"
                size="sm"
                leftSection={
                  <LocalIcon icon="person-rounded" width="1rem" height="1rem" />
                }
                onClick={() => startTour("admin")}
              >
                {t("settings.help.adminTour.start", "Start")}
              </Button>
            </Group>
          )}
        </Stack>
      </Paper>

      {/* Quick Start Guide */}
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="md" mb="sm">
          {t("settings.help.quickStart.title", "Quick Start Guide")}
        </Text>
        <List spacing="sm" size="sm" type="ordered">
          <List.Item>
            <Text size="sm">
              <strong>{t("settings.help.quickStart.step1.title", "Upload a PDF")}</strong> — {t(
                "settings.help.quickStart.step1.desc",
                "Drag & drop a file onto the upload area, or click to select from your computer. You can also paste a URL to fetch a PDF from the web.",
              )}
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>{t("settings.help.quickStart.step2.title", "Pick a Tool")}</strong> — {t(
                "settings.help.quickStart.step2.desc",
                "Choose from 54 tools: edit, merge, split, sign, redact, OCR, compress, compare, and more. Each tool has its own panel with controls for fine-tuning.",
              )}
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>{t("settings.help.quickStart.step3.title", "Configure & Run")}</strong> — {t(
                "settings.help.quickStart.step3.desc",
                "Adjust parameters (pages to process, output format, quality, encryption, etc.), then click the action button. Processing happens locally.",
              )}
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>{t("settings.help.quickStart.step4.title", "Download or Chain")}</strong> — {t(
                "settings.help.quickStart.step4.desc",
                "Download the result, or use the Automate tool to chain multiple operations into a no-code pipeline. Reusable workflows can be saved and triggered via API.",
              )}
            </Text>
          </List.Item>
        </List>
      </Paper>

      {/* Common tasks */}
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="md" mb="sm">
          {t("settings.help.commonTasks.title", "Common Tasks")}
        </Text>
        <Stack gap="sm">
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <LocalIcon icon="merge-type-rounded" width="1.2rem" height="1.2rem" />
            <div>
              <Text size="sm" fw={500}>
                {t("settings.help.commonTasks.merge.title", "Merge Multiple PDFs")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("settings.help.commonTasks.merge.desc", "Upload 2+ files → Merge tool → reorder by drag & drop → run. The output preserves bookmarks and metadata from the first file.")}
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <LocalIcon icon="lock-outline-rounded" width="1.2rem" height="1.2rem" />
            <div>
              <Text size="sm" fw={500}>
                {t("settings.help.commonTasks.password.title", "Password-Protect a PDF")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("settings.help.commonTasks.password.desc", "Add Password tool → set owner password (full access) and/or user password (view only) → choose AES-128 or AES-256 → run.")}
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <LocalIcon icon="text-fields-rounded" width="1.2rem" height="1.2rem" />
            <div>
              <Text size="sm" fw={500}>
                {t("settings.help.commonTasks.ocr.title", "OCR a Scanned Document")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("settings.help.commonTasks.ocr.desc", "OCR tool → select languages (English, Vietnamese, Chinese, etc.) → run. The output is a searchable PDF with selectable text.")}
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <LocalIcon icon="signature-rounded" width="1.2rem" height="1.2rem" />
            <div>
              <Text size="sm" fw={500}>
                {t("settings.help.commonTasks.sign.title", "Sign a Document")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("settings.help.commonTasks.sign.desc", "Sign tool → draw, type, or upload your signature → place it on the desired page → download as a new PDF with your signature embedded.")}
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <LocalIcon icon="compress-rounded" width="1.2rem" height="1.2rem" />
            <div>
              <Text size="sm" fw={500}>
                {t("settings.help.commonTasks.compress.title", "Reduce PDF File Size")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("settings.help.commonTasks.compress.desc", "Compress tool → choose quality level — the tool downsamples images and removes redundant data. The result is typically 60-80% smaller.")}
              </Text>
            </div>
          </Group>
        </Stack>
      </Paper>

      {/* Automation guide */}
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="md" mb="sm">
          {t("settings.help.automation.title", "Automation & Pipelines")}
        </Text>
        <Text size="sm" c="dimmed" mb="sm">
          {t(
            "settings.help.automation.desc",
            "The Automate tool lets you chain PDF operations into reusable workflows without writing code. Each step picks a tool and its parameters. Pipelines can be saved, shared, and triggered via REST API for batch processing.",
          )}
        </Text>
        <Text size="xs" ff="monospace" bg="gray.0" p="xs" style={{ borderRadius: 4 }}>
          {t("settings.help.automation.example", "Input PDF → OCR → Compress → AddPageNumbers → AddWatermark → Sign → Output PDF")}
        </Text>
      </Paper>

      {/* API usage */}
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="md" mb="sm">
          {t("settings.help.api.title", "API Reference")}
        </Text>
        <Text size="sm" c="dimmed" mb="sm">
          {t(
            "settings.help.api.desc",
            "Total PDF exposes REST API endpoints for nearly all tools. Full Swagger/OpenAPI documentation is available at /swagger-ui/index.html when the server is running.",
          )}
        </Text>
        <Text size="xs" ff="monospace" bg="gray.0" p="xs" style={{ borderRadius: 4 }}>
          {`# Merge two PDFs via API\ncurl -X POST http://localhost:8080/api/v1/merge-pdfs \\\n  -F "fileInput=@doc1.pdf" \\\n  -F "fileInput=@doc2.pdf" \\\n  -o merged.pdf`}
        </Text>
      </Paper>
    </Stack>
  );
};

export default HelpSection;
