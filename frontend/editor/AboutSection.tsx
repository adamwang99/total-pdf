import React from "react";
import { Paper, Stack, Text, Group, Badge, Anchor, ThemeIcon, List, Title, Code, Box, Flex, Image } from "@mantine/core";
import { useTranslation } from "react-i18next";
import LocalIcon from "@app/components/shared/LocalIcon";

const AboutSection: React.FC = () => {
  const { t } = useTranslation();

  const tools = [
    { group: "onboarding.about.groups.edit", label: "Soạn thảo & Chú thích", tools: ["AddText", "AddImage", "AddStamp", "AddWatermark", "AddPageNumbers", "Annotate", "pdfTextEditor"] },
    { group: "onboarding.about.groups.organize", label: "Sắp xếp & Tổ chức", tools: ["Merge", "Split", "ExtractPages", "RemovePages", "ReorganizePages", "Rotate", "Crop", "PageLayout", "BookletImposition"] },
    { group: "onboarding.about.groups.security", label: "Bảo mật & Ký số", tools: ["Sign", "CertSign", "Redact", "AddPassword", "RemovePassword", "Sanitize", "ValidateSignature"] },
    { group: "onboarding.about.groups.convert", label: "Chuyển đổi & OCR", tools: ["Convert", "OCR", "Compress", "ExtractImages", "Flatten"] },
    { group: "onboarding.about.groups.utility", label: "Tiện ích", tools: ["Compare", "Repair", "ChangeMetadata", "GetPdfInfo", "formFill", "Automate"] },
  ];

  return (
    <Stack gap="lg">

      {/* Hero branding */}
      <Paper withBorder p="xl" radius="md" style={{ textAlign: "center" }}>
        <Image
          src="/images/total-pdf-logo.png"
          alt="Total PDF"
          h={80}
          w="auto"
          fit="contain"
          mx="auto"
          mb="md"
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
        />
        <Group gap="xs" justify="center" wrap="wrap" mb="md">
          <Badge variant="filled" color="blue" size="lg">v2.11.0</Badge>
          <Badge variant="filled" color="green" size="lg">100% Local</Badge>
          <Badge variant="filled" color="violet" size="lg">54 Tools</Badge>
          <Badge variant="filled" color="orange" size="lg">40+ Ngôn ngữ</Badge>
          <Badge variant="filled" color="teal" size="lg">Mã nguồn mở</Badge>
        </Group>
      </Paper>

      {/* Câu chuyện phía sau */}
      <Paper withBorder p="xl" radius="md" style={{ borderLeft: "4px solid var(--mantine-color-blue-6)" }}>
        <Title order={3} mb="sm">Câu chuyện phía sau Total PDF</Title>
        <Text size="sm" style={{ lineHeight: 1.8 }} mb="md">
          Total PDF là sản phẩm được <strong>Adam Wang</strong> cùng đội ngũ tác nhân AI,
          trong đó <strong>Tiệp QSO</strong> — một tác nhân Agent vận hành thuộc
          hạ tầng AI World — trực tiếp đồng hành phát triển sản phẩm, tổ chức logic vận hành,
          phản biện kiến trúc, xử lý lỗi runtime, và từng bước hoàn thiện
          Total PDF theo yêu cầu và định hướng khởi tạo.
        </Text>
        <Text size="sm" style={{ lineHeight: 1.8 }}>
          Ứng dụng ra đời từ nhu cầu xây dựng một hệ thống xử lý PDF hoàn toàn ngoại tuyến,
          không phụ thuộc vào dịch vụ đám mây, không giới hạn số lần dùng, và miễn phí mãi mãi.
          Triết lý của Total PDF không dừng ở việc "một tool PDF khác", mà hướng tới một
          nền tảng xử lý tài liệu: từ file thô → ghép/chia/ký/OCR/chuyển đổi → kết quả
          hoàn chỉnh — tất cả trên máy bạn, không gửi dữ liệu đi đâu.
        </Text>
      </Paper>

      {/* Miễn phí trọn đời */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: "4px solid var(--mantine-color-green-6)" }}>
        <Title order={4} mb="sm">Miễn phí. Mãi mãi. Cho tất cả mọi người.</Title>
        <Text size="sm" c="dimmed" style={{ lineHeight: 1.8 }}>
          Total PDF là mã nguồn mở. Bạn có toàn bộ <strong>54 tools — tất cả đều miễn phí</strong>.
          Không giới hạn file, không watermark, không giới hạn số lần, không cần đăng ký tài khoản.
          Tải về, chạy lên, dùng luôn.
        </Text>
        <Text size="sm" c="dimmed" mt="sm" style={{ lineHeight: 1.8 }}>
          Bạn có thể chạy trên máy tính cá nhân (macOS, Windows, Linux), dùng trình duyệt ở
          localhost, hoặc tự host server cho team. Tất cả đều miễn phí, mãi mãi.
        </Text>
      </Paper>

      {/* 54 Tools */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: "4px solid var(--mantine-color-violet-6)" }}>
        <Title order={4} mb="sm">54 Công cụ — một nền tảng</Title>
        <Text size="sm" c="dimmed" mb="md">
          Từ ghép file PDF, ký số điện tử, OCR tiếng Việt, chuyển đổi định dạng,
          nén dung lượng, sửa metadata, so sánh tài liệu, điền form, tự động hoá pipeline —
          tất cả đều có sẵn, không cần cài thêm plugin nào.
        </Text>
        {tools.map((group) => (
          <React.Fragment key={group.group}>
            <Text fw={500} size="sm" mt="sm" mb="xs" c="blue">
              {group.label}
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

      {/* Quyền riêng tư */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: "4px solid var(--mantine-color-red-6)" }}>
        <Title order={4} mb="sm">Quyền riêng tư — không phải tính năng, là nguyên tắc</Title>
        <List spacing="sm" size="sm">
          <List.Item>
            <Text size="sm">
              <strong>Không gửi dữ liệu đi đâu.</strong> Mọi thứ chạy trên máy của bạn.
              Total PDF <strong>không bao giờ</strong> upload tài liệu ra ngoài.
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>Không telemetry.</strong> Ứng dụng không gọi về nhà.
              Không analytics, không crash reporter, không tracking.
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>Air-gap ready.</strong> Chạy trên máy không có internet.
              Vẫn đủ 54 tools, vẫn OCR, vẫn ký số, vẫn đầy đủ.
            </Text>
          </List.Item>
          <List.Item>
            <Text size="sm">
              <strong>Mã nguồn mở.</strong> Toàn bộ code công khai.
              Bạn tự build, tự audit, tự fork.
            </Text>
          </List.Item>
        </List>
      </Paper>

      {/* Ba cách dùng */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: "4px solid var(--mantine-color-gray-6)" }}>
        <Title order={4} mb="sm">Chạy kiểu nào cũng được</Title>
        <Stack gap="md">
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <ThemeIcon size="md" radius="md" variant="light" color="blue">
              <LocalIcon icon="desktop-windows-rounded" width="1rem" height="1rem" />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500}>Desktop App</Text>
              <Text size="xs" c="dimmed">
                .dmg (macOS), .msi (Windows), .AppImage (Linux).
                Đã kèm Java — mở lên dùng ngay.
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <ThemeIcon size="md" radius="md" variant="light" color="violet">
              <LocalIcon icon="language-rounded" width="1rem" height="1rem" />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500}>Trình duyệt</Text>
              <Text size="xs" c="dimmed">
                localhost:8080. Đầy đủ tools, pipeline builder, REST API.
              </Text>
            </div>
          </Group>
          <Group wrap="nowrap" align="flex-start" gap="sm">
            <ThemeIcon size="md" radius="md" variant="light" color="green">
              <LocalIcon icon="dns-rounded" width="1rem" height="1rem" />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500}>Self-Host</Text>
              <Text size="xs" c="dimmed">
                Docker, Compose, K8s, hoặc raw JAR. REST API riêng cho team.
              </Text>
            </div>
          </Group>
        </Stack>
      </Paper>

      {/* Công nghệ */}
      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="sm">Công nghệ</Title>
        <Text size="sm" c="dimmed" style={{ lineHeight: 1.8 }}>
          Spring Boot 3 + React + Vite + TypeScript + Tauri.
          PDF engine: Apache PDFBox. OCR: Tesseract.
          Chữ ký số: PKCS#11 / HSM. Desktop: Tauri (Rust).
        </Text>
        <Box mt="md" p="sm" style={{ backgroundColor: "var(--mantine-color-gray-0)", borderRadius: "var(--mantine-radius-sm)" }}>
          <Code style={{ display: "block", whiteSpace: "pre-wrap" }}>
{`docker run -p 8080:8080 aiworld/total-pdf:latest`}
          </Code>
        </Box>
        <Flex wrap="wrap" gap="md" mt="md">
          <Anchor href="https://github.com/adamwang99/total-pdf" target="_blank" size="sm">GitHub ↗</Anchor>
          <Anchor href="https://github.com/adamwang99/total-pdf/issues" target="_blank" size="sm">Góp ý / Báo lỗi ↗</Anchor>
          <Anchor href="mailto:contact@totalpdf.info" target="_blank" size="sm">contact@totalpdf.info</Anchor>
        </Flex>
      </Paper>

      {/* Ghi nhận tác giả gốc */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: "4px solid var(--mantine-color-yellow-6)" }}>
        <Text size="xs" c="dimmed" style={{ lineStyle: "italic", lineHeight: 1.6 }}>
          Total PDF là phiên bản phát triển và tái định hướng từ <strong>Stirling PDF</strong>,
          dự án mã nguồn mở thuần Việt đầu tiên trên thế giới về xử lý PDF, do
          <strong> Stirling Software Inc.</strong> tạo ra và phát hành theo giấy phép
          <strong> GPL v3</strong>. Xin cảm ơn Stirling Software Inc., cùng toàn thể cộng đồng
          mã nguồn mở đã đặt nền móng cho sản phẩm này.
        </Text>
        <Text size="xs" c="dimmed" mt="xs" style={{ fontStyle: "italic", lineHeight: 1.6 }}>
          Total PDF is a fork of Stirling PDF, originally created and distributed by
          Stirling Software Inc. under the GPL v3 license. We thank the original authors
          and the open-source community for their foundational work.
        </Text>
      </Paper>

    </Stack>
  );
};

export default AboutSection;
