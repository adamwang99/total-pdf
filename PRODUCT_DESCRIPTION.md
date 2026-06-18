# Total PDF — Bản mô tả sản phẩm

> Nền tảng xử lý PDF mã nguồn mở, chạy desktop / trình duyệt / self-host.
> Fork & rebrand từ Total-PDF (MIT core). App name: **Total PDF** — identifier `aiworld.totalpdf.app`.

---

## 1. Tổng quan

Total PDF là nền tảng chỉnh sửa & xử lý PDF chạy hoàn toàn cục bộ — tài liệu không gửi ra dịch vụ ngoài. Ba hình thái triển khai dùng chung một codebase:

| Hình thái | Mô tả | Tech |
|---|---|---|
| Desktop app | Ứng dụng cài đặt (macOS .dmg / Windows .msi / Linux .AppImage) | Tauri (Rust) + React |
| Browser UI | Giao diện web đầy đủ | React + Vite |
| Self-host server | Backend + REST API riêng tư | Spring Boot (Java 25), Gradle |

Engine xử lý PDF chạy nền (thư mục `engine/`), backend Spring Boot điều phối, frontend React/Tauri là lớp trình bày.

---

## 2. Bộ công cụ — 54 tool frontend thật

Phân nhóm theo chức năng (lấy từ `frontend/editor/src/core/tools` + components/tools):

### Chỉnh sửa nội dung
- **AddText** / **AddImage** / **AddStamp** / **AddWatermark** — chèn text, ảnh, dấu, watermark
- **AddPageNumbers** — đánh số trang
- **AddAttachments** — đính kèm file vào PDF
- **pdfTextEditor** — chỉnh sửa text trực tiếp
- **Annotate** / **RemoveAnnotations** — chú thích & gỡ chú thích
- **EditTableOfContents** — sửa mục lục
- **ReplaceColor** / **AdjustContrast** — xử lý màu

### Tổ chức trang
- **Merge** / **Split** / **ExtractPages** / **RemovePages** — gộp, tách, trích, xóa trang
- **ReorganizePages** / **PageLayout** / **BookletImposition** — sắp xếp, bố cục, dàn trang booklet
- **Rotate** / **Crop** / **AdjustPageScale** / **SingleLargePage** — xoay, cắt, co giãn, gộp 1 trang lớn
- **OverlayPdfs** — chồng lớp PDF
- **RemoveBlanks** — xóa trang trắng

### Bảo mật & chữ ký
- **Sign** / **CertSign** — ký thường & ký chứng thư số
- **ValidateSignature** / **RemoveCertificateSign** — xác thực & gỡ chữ ký
- **TimestampPdf** — đóng dấu thời gian
- **AddPassword** / **RemovePassword** — mã hóa & gỡ mật khẩu
- **ChangePermissions** — đổi quyền
- **Redact** — bôi đen/khử thông tin nhạy cảm
- **Sanitize** — làm sạch nội dung độc (JS nhúng…)
- **ShowJS** — xem JavaScript nhúng trong PDF
- **UnlockPdfForms** — mở khóa form
- **RemoveImage** — gỡ ảnh

### Chuyển đổi & nhận dạng
- **Convert** — chuyển đổi định dạng (PDF ↔ ảnh/office…)
- **OCR** — nhận dạng ký tự quang học
- **Compress** — nén dung lượng
- **ExtractImages** — trích ảnh
- **ScannerImageSplit** — tách ảnh scan
- **Flatten** — làm phẳng (form/layer)

### Tiện ích & metadata
- **ChangeMetadata** / **GetPdfInfo** — sửa/xem metadata
- **Compare** — so sánh 2 PDF
- **Repair** — sửa file lỗi
- **AutoRename** — tự đặt tên theo nội dung
- **formFill** — điền form
- **Automate** — pipeline tự động hóa không-code
- **SwaggerUI** — API explorer

---

## 3. Năng lực nền tảng (từ README upstream + backend)

- **50+ PDF tool** (54 tool frontend thực đếm được).
- **Automation & workflow** — pipeline no-code ngay trong UI + API xử lý hàng loạt.
- **REST API** — gần như mọi tool có endpoint API riêng (171 controller backend, gồm cả nhánh proprietary/saas).
- **Đa ngôn ngữ** — UI 40+ ngôn ngữ.
- **Enterprise** — SSO, audit, deploy on-prem (nằm ở nhánh proprietary — xem cảnh báo license bên dưới).

---

## 4. Trạng thái rebrand (Total PDF)

**Đã xong (cosmetic — tầng desktop):**
- Tauri: `productName`, `identifier=aiworld.totalpdf.app`, title, publisher, deep-link scheme
- Cargo.toml, PWA manifest, Info.plist, .desktop entry
- Toàn bộ icon (16→512, Square*, mstile, StoreLogo, android chrome)
- Logo (classic + modern) trong `branding/`
- Rust paths/logging/auth references, Windows WiX

**Còn dở:**
- ⚠️ `settings.gradle` vẫn `rootProject.name = 'Total PDF'` → backend chưa đổi tên
- README còn nguyên branding/logo/badge Stirling
- Còn chuỗi "Stirling" rải rác cần quét tổng

---

## 5. License — ⚠️ Quan trọng

Upstream **Stirling-PDF: MIT** cho phần core → fork + rebrand **hợp pháp** (giữ copyright notice gốc của Stirling PDF Inc.).

**NHƯNG** 3 thư mục có license riêng (KHÔNG phải MIT), và đều tồn tại trong bản này:
- `app/proprietary/`
- `app/saas/`
- `engine/`

→ **Không được redistribute công khai** các thư mục này dưới brand Total PDF nếu chưa có phép Stirling. Repo hiện đã tạo ở chế độ **private** nên an toàn ở bước này. Trước khi public phải loại 3 thư mục trên (hoặc thay bằng engine tự viết).

---

## 6. Repo & remote

- Origin mới: `github.com/adamwang99/total-pdf` (**private**)
- Branch: `rebrand/total-pdf` (đã push)
- Upstream gốc: `github.com/Stirling-Tools/Stirling-PDF` (giữ làm remote `upstream` để pull update)

---

## 7. Việc tiếp theo đề xuất

1. Hoàn tất rebrand: `rootProject.name`, README, quét chuỗi "Stirling" còn lại.
2. Quyết định engine: giữ `engine/` proprietary (private only) hay thay engine MIT/tự viết để có thể public.
3. Định hướng sản phẩm: chọn tập tool cốt lõi cho Total PDF thay vì bê nguyên 54 tool — tinh gọn theo mục tiêu (Core Law: siêu nhẹ).
