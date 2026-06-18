# Total PDF

![Total PDF banner](./images/home-light.png)

**Total PDF** is a full-featured PDF platform that runs completely locally — no documents ever leave your machine. Use it as a desktop app, a browser UI, or a self-hosted server with a private REST API. Edit, sign, redact, OCR, convert, merge, split, compress, and automate PDF workflows without sending data to third-party services.

Current version: `v2.11.0` — identifier `aiworld.totalpdf.app`.

---

## Why it matters

PDF workflows today force a false choice:

- **Online tools** are fast but upload your documents to unknown servers — a hard no for legal, finance, medical, or confidential content.
- **Desktop PDF editors** (Acrobat Pro, Foxit, Nitro) are proprietary, expensive, and lock you into yearly subscriptions.
- **CLI tools** (Ghostscript, qpdf, poppler) are powerful but require scripting and have no UI.

Total PDF fills the gap: a visual, interactive platform with **50+ tools**, full **REST API**, and **no-data-leave-your-network** guarantees. Desktop, browser, or self-host — same codebase, same trust boundary.

---

## Core capabilities

### 1. 54 native PDF tools — one platform

Every tool is a real React component backed by a Java endpoint. No wrappers around third-party APIs, no round-trips to external services.

#### Content editing
| Tool | What it does |
|---|---|
| **AddText** | Insert text at any position, with font/size/color/rotation controls |
| **AddImage** | Place images onto PDF pages |
| **AddStamp** | Apply rubber-stamp graphics (approved, received, confidential…) |
| **AddWatermark** | Text or image watermarks over every page |
| **AddPageNumbers** | Auto-number pages with position, start, and format options |
| **AddAttachments** | Embed files into the PDF container |
| **pdfTextEditor** | Direct in-browser text editing on rendered PDF pages |
| **Annotate** | Highlight, underline, strikeout, note, freehand draw |
| **RemoveAnnotations** | Bulk strip annotations |
| **EditTableOfContents** | Modify PDF outline/bookmarks |
| **ReplaceColor** | Swap one color for another across pages |
| **AdjustContrast** | Improve readability of scanned or dark documents |

#### Page organization
| Tool | What it does |
|---|---|
| **Merge** | Combine multiple PDFs into one document (preserves order, bookmarks, metadata) |
| **Split** | Split by page range, file size, or top-level bookmarks |
| **ExtractPages** | Pull specific pages into a new PDF |
| **RemovePages** | Delete selected pages |
| **ReorganizePages** | Drag-and-drop reordering with thumbnail preview |
| **PageLayout** | Multi-up layout (2×1, 2×2, 4×4…) for printing or presentation |
| **BookletImposition** | Create printer-ready booklet signatures with correct page ordering |
| **Rotate** | Rotate individual pages or entire document (90°/180°/270°) |
| **Crop** | Trim margins or regions per page |
| **AdjustPageScale** | Scale page content to fit a new page size |
| **SingleLargePage** | Composite multiple pages into one large canvas page |
| **OverlayPdfs** | Overlay one PDF's content onto another (e.g., form + instructions) |
| **RemoveBlanks** | Detect and delete blank or near-blank pages |

#### Security & signatures
| Tool | What it does |
|---|---|
| **Sign** | Draw, type, or upload your signature and apply it to PDF pages |
| **CertSign** | Digitally sign with X.509 certificates (validates chain, timestamp) |
| **ValidateSignature** | Verify existing digital signatures and certificate trust |
| **RemoveCertificateSign** | Strip digital signatures from PDFs (does not modify original signed content) |
| **TimestampPdf** | Apply RFC 3161 timestamp token |
| **AddPassword** | Encrypt PDF with user/owner passwords, choose encryption level (128/256-bit AES) |
| **RemovePassword** | Decrypt password-protected PDFs |
| **ChangePermissions** | Modify allowed operations (printing, copying, modifying) on encrypted PDFs |
| **Redact** | Permanently black out sensitive text/regions — actually removes content, not just covers it |
| **Sanitize** | Strip embedded JavaScript, actions, metadata, hidden layers, attachments |
| **ShowJS** | Inspect JavaScript code embedded in the PDF |
| **UnlockPdfForms** | Remove read-only restrictions on AcroForm fields |
| **RemoveImage** | Extract and delete selected images from PDF pages |

#### Conversion & recognition
| Tool | What it does |
|---|---|
| **Convert** | PDF ↔ images (PNG/JPEG/TIFF), PDF ↔ Office, PDF ↔ HTML, PDF ↔ XML, PDF ↔ CSV, PDF ↔ PDF/A |
| **OCR** | Optical character recognition on scanned/image-based PDFs (Tesseract-based, multi-language) |
| **Compress** | Reduce file size (image downsampling, remove redundant data, optimize objects) |
| **ExtractImages** | Export all embedded images in original format |
| **ScannerImageSplit** | Split multi-page scanned images into individual page PDFs |
| **Flatten** | Merge form fields, annotations, and layers into base page content |

#### Utilities & metadata
| Tool | What it does |
|---|---|
| **ChangeMetadata** | Edit title, author, subject, keywords, producer, creator |
| **GetPdfInfo** | Display page count, file size, PDF version, metadata, fonts, images |
| **Compare** | Side-by-side text diff between two PDFs |
| **Repair** | Attempt to recover corrupt or malformed PDFs |
| **AutoRename** | Generate filenames from PDF content (first N characters, regex patterns) |
| **formFill** | Fill AcroForm fields (text boxes, checkboxes, dropdowns, radio buttons) in-browser |
| **Automate** | No-code pipeline builder — chain multiple PDF tools into a reusable workflow |
| **SwaggerUI** | Interactive REST API explorer built into the app |

### 2. Three deployment modes — same codebase

```
┌──────────────────────────────────────────────────┐
│              Total PDF codebase                   │
│  frontend/ (React + Vite + TypeScript)            │
│  backend/  (Spring Boot, Java 25, Gradle)         │
│  engine/   (PDF processing runtime)               │
│  desktop/  (Tauri shell: Rust)                    │
└──────────────────────────────────────────────────┘
         │                │                │
         ▼                ▼                ▼
   ┌──────────┐    ┌────────────┐    ┌──────────────┐
   │ Desktop   │    │ Browser    │    │ Self-host    │
   │   app     │    │    UI      │    │   server     │
   │ (native)  │    │ (web app)  │    │ (REST API)   │
   └──────────┘    └────────────┘    └──────────────┘
```

- **Desktop** — macOS `.dmg` / Windows `.msi` / Linux `.AppImage`. Bundled JRE via jlink. Tauri shell, native window, system tray. No server setup.
- **Browser** — Full SPA at `http://localhost:8080`. All 54 tools, pipeline builder, API explorer. Backend runs as Spring Boot.
- **Self-host** — Docker/Kubernetes/raw JAR. Private REST API for every tool. On-prem, air-gapped, cloud VPC — your choice.

### 3. Automation & no-code pipelines

The **Automate** tool lets you chain PDF operations into reusable workflows without writing code:

```
Input PDF → OCR → Compress → AddPageNumbers → AddWatermark → Sign → Output PDF
```

Each step picks a tool and its parameters. Pipelines can be saved, shared, exported, and triggered via API. The API also accepts batch operations — process thousands of PDFs with a single POST.

### 4. REST API for every tool

Nearly all 54 tools expose a REST API endpoint. Full Swagger/OpenAPI documentation is served at `/swagger-ui/index.html` when the app is running. This makes Total PDF a viable PDF processing engine for CI/CD pipelines, backend services, and enterprise integration.

**API examples:**

```bash
# Merge two PDFs
curl -X POST http://localhost:8080/api/v1/merge-pdfs \
  -F "fileInput=@doc1.pdf" \
  -F "fileInput=@doc2.pdf" \
  -o merged.pdf

# Add page numbers
curl -X POST http://localhost:8080/api/v1/add-page-numbers \
  -F "fileInput=@report.pdf" \
  -F "startNumber=1" \
  -F "position=bottomCenter" \
  -o numbered.pdf

# OCR a scanned PDF
curl -X POST http://localhost:8080/api/v1/ocr-pdf \
  -F "fileInput=@scan.pdf" \
  -F "languages=eng+vie" \
  -o ocr.pdf
```

### 5. Multi-language UI

The interface is fully translated into 40+ languages (Ar, Az, Bg, Ca, Cs, Da, De, El, En, Es, Eu, Fa, Fr, Ga, Hi, Hr, Hu, Id, It, Ja, Ko, Ml, Nl, No, Pl, Pt-BR, Pt-PT, Ro, Ru, Sk, Sl, Sr, Sv, Th, Tr, Uk, Vi, Zh-CN, Zh-TW, Bo). Each locale has its own translation file — adding a new language only requires translating one `.toml` file.

---

## Operating model

```text
Open Total PDF (desktop / browser / server)
→ Upload a PDF from local or URL
→ Pick a tool from the sidebar
→ Configure parameters (pages, position, format, encryption…)
→ Run — processing happens locally
→ Download the result or chain to the next tool
→ Or: build a pipeline in Automate
→ Or: call the API from your own application
```

---

## Privacy & security guarantees

- **Zero egress** — all processing runs on your machine or your server. Total PDF does not upload documents to any external service.
- **No telemetry** — the app does not phone home. No analytics, no crash reporters, no usage tracking.
- **Encryption at rest** — password-protected PDFs use AES-128/256, matching PDF 2.0 spec.
- **Sanitize tool** — removes embedded JS, hidden annotations, metadata, and invisible content before sharing.
- **Air-gap ready** — self-host mode runs on networks with no internet access. Nothing leaves the deployment boundary.

---

## Comparison with other PDF editors

| Feature | Total PDF | Adobe Acrobat Pro | Foxit PDF Editor | Online tools |
|---|---|---|---|---|
| **Local processing** | ✅ All | ❌ Some (cloud AI features) | ❌ Some | ❌ Processing on server |
| **Privacy** | ✅ Zero egress | ❌ Cloud-dependent | ❌ Cloud-dependent | ❌ Your file on their server |
| **Price** | Free (MIT core) | $22.99/mo yearly | $13.99/mo yearly | Free with limits |
| **REST API** | ✅ 54+ endpoints | ❌ Limited, extra cost | ❌ Extra SKU | ❌ Rarely available |
| **No-code automation** | ✅ Built-in | ✅ (Action Wizard) | ❌ Not built-in | ❌ |
| **OCR** | ✅ Tesseract-based | ✅ | ✅ | ✅ (size limits) |
| **Self-host/air-gap** | ✅ | ❌ | ❌ | ❌ |
| **Multi-platform** | macOS, Windows, Linux, Web, Docker | macOS, Windows | macOS, Windows | Browser only |
| **Offline** | ✅ (Desktop) | ❌ (Requires account) | ❌ (Requires account) | ❌ |

---

## Current implementation status

Implemented in:

- **`app/core/`** — Spring Boot backend, 171+ controller endpoints. Core module compiles with Java 25, Gradle 9.3.1, Spring Boot 4.0.6.
- **`frontend/editor/`** — React SPA with Vite. All 54 tool components in `src/core/tools/` and `src/core/components/tools/`. Tauri shell in `src-tauri/` (Rust, Cargo).
- **`frontend/editor/src-tauri/`** — macOS `.dmg`, Windows `.msi`, Linux `.deb/.rpm/.AppImage`. Bundled JRE via jlink. Product name "Total PDF", identifier `aiworld.totalpdf.app`.

**Desktop build artifacts (macOS):**

- App: `/Applications/Total PDF.app`
- Architecture: `aarch64` (Apple Silicon)
- DMG size: ~271 MB (includes bundled JRE + all tools)
- Java bundled: Temurin-25.0.4+5, jlink-minimized (20 modules)

**Branch structure:**

```text
main                — 5178 commits (upstream sync point)
rebrand/total-pdf   — current dev branch (6 commits ahead of merge-base f009728)
```

---

## Limitations

- **Java 25 required** — Spring Boot 4 + Gradle 9.3.1 need a JDK ≥ 25 to compile. Desktop builds bundle a JRE, so end users do not need Java installed.
- **Docker image not yet published** — `docker pull` URLs in the current README are placeholders. Use the JAR directly or build from source.
- **Self-host setup** requires Gradle build steps — not a single-binary experience (yet). The desktop app is the main distribution target for now.
- **Some tools depend on proprietary modules** — `app/proprietary/` and `app/saas/` contain license-restricted features (enterprise SSO, SaaS billing). These are excluded in the `core` flavor (default for desktop builds).
- **Mobile** — not available as a native iOS/Android app. The browser UI works on mobile viewports but is optimized for desktop.
- **Online collaboration** — not built in. Total PDF is a single-user tool. Multi-user collaboration requires a shared filesystem or a document management system on top.

---

## Quick start

### Desktop (macOS)

1. Download the latest `.dmg` from the [Releases](https://github.com/adamwang99/total-pdf/releases) page.
2. Open the DMG and drag `Total PDF.app` into Applications.
3. Launch — the app starts immediately with all tools available.

### Docker (self-host)

```bash
docker run -p 8080:8080 ghcr.io/adamwang99/total-pdf:latest
# Open http://localhost:8080
```

### From source

```bash
git clone git@github.com:adamwang99/total-pdf.git
cd total-pdf

# Backend
export JAVA_HOME=/path/to/jdk-25
./gradlew bootJar -x test -x checkLicense -DTOTALPDF_FLAVOR=core
java -jar app/core/build/libs/total-pdf-*.jar
# UI opens at http://localhost:8080

# Desktop
cd frontend/editor
npm install
npx tauri build  # produces .dmg/.msi/.AppImage
```

### Build prerequisites

| Component | Requirement | Notes |
|---|---|---|
| JDK | ≥ 25 (Temurin recommended) | `app/core/` uses Spring Boot 4 |
| Gradle | 9.3.1 (wrapper included) | Use `./gradlew` |
| Node.js | ≥ 22 | For frontend build |
| Rust | ≥ 1.78 (for Tauri target) | `rustup` recommended |
| macOS | ≥ 13 (Ventura) for DMG build | ARM64 or x86_64 |

---

## Repository structure

```text
total-pdf/
├── app/
│   ├── core/              # Spring Boot backend (main module)
│   ├── common/            # Shared libraries, JPDFium native bindings
│   ├── proprietary/       # License-restricted enterprise features
│   └── saas/              # SaaS billing & multi-tenant support
├── frontend/
│   ├── editor/            # React SPA (Vite)
│   │   ├── src/core/tools/          # 54 tool components
│   │   ├── src/core/components/     # Shared UI components
│   │   └── src-tauri/               # Tauri desktop shell
│   └── shared/            # Shared frontend utilities
├── engine/                # PDF processing runtime (proprietary)
├── branding/              # Logos, wordmark, brand assets
├── images/                # Screenshots for README
├── .taskfiles/            # Taskfile definitions (desktop, backend, frontend, docker)
├── build.gradle           # Root Gradle build
├── settings.gradle        # Gradle project config
├── Taskfile.yml           # Unified command runner
└── README.md              # This file
```

---

## Version history

See `CHANGELOG.md` and the [GitHub releases page](https://github.com/adamwang99/total-pdf/releases).

Current release: **v2.11.0** — 54 tools, 171 API endpoints, 40+ languages, Tauri desktop, Spring Boot 4, Java 25.

---

## Contributing

We welcome contributions. Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines, coding standards (Spotless Java formatting, ESLint for TypeScript), and the pull request workflow.

This project uses [Task](https://taskfile.dev/) as the command runner. Run `task install` to get started.

---

## License

Total PDF is open-core.

- **Core** (`app/core/`, `frontend/`, desktop): MIT License (Copyright © 2025 Stirling PDF Inc., modified by AI World).
- **Proprietary** (`app/proprietary/`): See `app/proprietary/LICENSE`.
- **SaaS** (`app/saas/`): See `app/saas/LICENSE`.
- **Engine** (`engine/`): See `engine/LICENSE`.

The MIT-core code can be freely used, forked, and redistributed. The proprietary modules are included for convenience in the private repository and require separate licensing for public redistribution.
