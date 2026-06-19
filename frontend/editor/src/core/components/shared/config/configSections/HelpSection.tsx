import React from "react";
import { Button, Group, Paper, Stack, Text, Anchor, List } from "@mantine/core";
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
                {t("settings.help.toolsTour.title", "Hướng dẫn Tools")}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {t(
                  "settings.help.toolsTour.description",
                  "Làm quen với cách upload file, chọn tool và xem kết quả.",
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
              {t("settings.help.toolsTour.start", "Bắt đầu")}
            </Button>
          </Group>

          {isAdmin && (
            <Group justify="space-between" align="center">
              <div>
                <Text fw={600} size="sm">
                  {t("settings.help.adminTour.title", "Hướng dẫn Admin")}
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  {t(
                    "settings.help.adminTour.description",
                    "Khám phá quản lý team, cài đặt hệ thống và tính năng doanh nghiệp.",
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
                {t("settings.help.adminTour.start", "Bắt đầu")}
              </Button>
            </Group>
          )}
        </Stack>
      </Paper>

      {/* Quick Start Guide */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: "4px solid var(--mantine-color-blue-6)" }}>
        <Text fw={600} size="md" mb="sm">
          {t("settings.help.quickStart.title", "Bắt đầu nhanh")}
        </Text>
        <List spacing="md" size="sm" type="ordered">
          <List.Item>
            <Text size="sm">
              <strong>{t("settings.help.quickStart.step1.title", "Tải PDF lên")}</strong> — {t(
                "settings.help.quickStart.step1.desc",
                "Kéo-thả file vào vùng upload, hoặc click để chọn từ máy tính. Bạn cũng có thể dán URL để tải PDF từ web.",
              )}
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>{t("settings.help.quickStart.step2.title", "Chọn công cụ")}</strong> — {t(
                "settings.help.quickStart.step2.desc",
                "Chọn từ 54 công cụ: ghép, chia, ký, OCR, nén, so sánh, v.v. Mỗi tool có bảng điều khiển riêng.",
              )}
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>{t("settings.help.quickStart.step3.title", "Cấu hình & Chạy")}</strong> — {t(
                "settings.help.quickStart.step3.desc",
                "Điều chỉnh tham số (trang cần xử lý, định dạng đầu ra, chất lượng, mã hoá...), sau đó bấm nút thực thi. Mọi thứ chạy trên máy bạn.",
              )}
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>{t("settings.help.quickStart.step4.title", "Tải về hoặc chuỗi tác vụ")}</strong> — {t(
                "settings.help.quickStart.step4.desc",
                "Tải kết quả về, hoặc dùng công cụ Automate để ghép nhiều thao tác thành pipeline không cần code. Có thể lưu và gọi lại qua API.",
              )}
            </Text>
          </List.Item>
        </List>
      </Paper>

      {/* Common tasks */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: "4px solid var(--mantine-color-green-6)" }}>
        <Text fw={600} size="md" mb="sm">
          {t("settings.help.commonTasks.title", "Tác vụ thường dùng")}
        </Text>
        <Stack gap="md">
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <LocalIcon icon="merge-type-rounded" width="1.2rem" height="1.2rem" />
            <div>
              <Text size="sm" fw={500}>
                {t("settings.help.commonTasks.merge.title", "Ghép nhiều PDF")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("settings.help.commonTasks.merge.desc", "Upload 2+ file → chọn Merge → kéo-thả sắp xếp → chạy. Kết quả giữ bookmark và metadata từ file đầu tiên.")}
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <LocalIcon icon="lock-outline-rounded" width="1.2rem" height="1.2rem" />
            <div>
              <Text size="sm" fw={500}>
                {t("settings.help.commonTasks.password.title", "Đặt mật khẩu PDF")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("settings.help.commonTasks.password.desc", "Chọn Add Password → đặt owner password (toàn quyền) và/hoặc user password (chỉ xem) → chọn AES-128 hoặc AES-256 → chạy.")}
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <LocalIcon icon="text-fields-rounded" width="1.2rem" height="1.2rem" />
            <div>
              <Text size="sm" fw={500}>
                {t("settings.help.commonTasks.ocr.title", "OCR tài liệu quét")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("settings.help.commonTasks.ocr.desc", "Chọn OCR → chọn ngôn ngữ (Tiếng Việt, Anh, Trung, v.v.) → chạy. Kết quả là PDF có thể tìm kiếm và copy chữ.")}
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <LocalIcon icon="signature-rounded" width="1.2rem" height="1.2rem" />
            <div>
              <Text size="sm" fw={500}>
                {t("settings.help.commonTasks.sign.title", "Ký tài liệu")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("settings.help.commonTasks.sign.desc", "Chọn Sign → vẽ, gõ hoặc upload chữ ký → đặt vào vị trí mong muốn → tải PDF đã ký.")}
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <LocalIcon icon="compress-rounded" width="1.2rem" height="1.2rem" />
            <div>
              <Text size="sm" fw={500}>
                {t("settings.help.commonTasks.compress.title", "Nén dung lượng PDF")}
              </Text>
              <Text size="xs" c="dimmed">
                {t("settings.help.commonTasks.compress.desc", "Chọn Compress → chọn chất lượng. Tool sẽ giảm ảnh và loại bỏ dữ liệu thừa. Kết quả thường nhỏ hơn 60-80%.")}
              </Text>
            </div>
          </Group>
        </Stack>
      </Paper>

      {/* Automation guide */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: "4px solid var(--mantine-color-violet-6)" }}>
        <Text fw={600} size="md" mb="sm">
          {t("settings.help.automation.title", "Tự động hoá & Pipeline")}
        </Text>
        <Text size="sm" c="dimmed" mb="sm">
          {t(
            "settings.help.automation.desc",
            "Công cụ Automate cho phép bạn ghép các thao tác PDF thành pipeline không cần viết code. Mỗi bước chọn một tool và tham số của nó. Pipeline có thể lưu, chia sẻ, và gọi qua REST API để xử lý hàng loạt.",
          )}
        </Text>
        <Text size="xs" ff="monospace" bg="gray.0" p="xs" style={{ borderRadius: 4 }}>
          {t("settings.help.automation.example", "Input PDF → OCR → Nén → Đánh số trang → Thêm watermark → Ký → Output PDF")}
        </Text>
      </Paper>

      {/* API usage */}
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="md" mb="sm">
          {t("settings.help.api.title", "API & Tích hợp")}
        </Text>
        <Text size="sm" c="dimmed" mb="sm">
          {t(
            "settings.help.api.desc",
            "Total PDF cung cấp REST API cho hầu hết các công cụ. Tài liệu Swagger/OpenAPI đầy đủ tại /swagger-ui/index.html khi server đang chạy.",
          )}
        </Text>
        <Text size="xs" ff="monospace" bg="gray.0" p="xs" style={{ borderRadius: 4 }}>
          {`# Ghép hai file PDF qua API\ncurl -X POST http://localhost:8080/api/v1/merge-pdfs \\\n  -F "fileInput=@doc1.pdf" \\\n  -F "fileInput=@doc2.pdf" \\\n  -o merged.pdf`}
        </Text>
      </Paper>

      {/* Liên kết hữu ích */}
      <Paper withBorder p="md" radius="md">
        <Text fw={600} size="md" mb="sm">
          {t("settings.help.links.title", "Liên kết hữu ích")}
        </Text>
        <Stack gap="sm">
          <Anchor href="https://github.com/adamwang99/total-pdf/blob/rebrand/total-pdf/README.md" target="_blank" size="sm">
            README — Tài liệu đầy đủ ↗
          </Anchor>
          <Anchor href="https://github.com/adamwang99/total-pdf/issues" target="_blank" size="sm">
            Báo lỗi & Góp ý ↗
          </Anchor>
          <Anchor href="mailto:contact@totalpdf.info" target="_blank" size="sm">
            contact@totalpdf.info
          </Anchor>
        </Stack>
      </Paper>

    </Stack>
  );
};

export default HelpSection;
