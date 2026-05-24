# Total PDF — Hướng dẫn build

## Project structure

```
/home/tiep/.openclaw/workspace/projects/total-pdf/
├── frontend/editor/          ← Tauri desktop app
│   ├── src-tauri/            ← Rust + Tauri backend
│   ├── src/                  ← React frontend source
│   └── public/               ← static assets (locales, logos)
├── app/                      ← Spring Boot backend
├── engine/                   ← AI/PDF processing engine
├── build.gradle              ← Gradle build (Java 25)
├── Taskfile.yml              ← Task runner commands
├── branding/                 ← Logo + icon source
└── total-pdf.md              ← THIS FILE
```

## Build targets

### Docker (easiest, cross-platform)
```
docker run -p 8080:8080 docker.stirlingpdf.com/stirlingtools/stirling-pdf
```

### Desktop native (Tauri → macOS .dmg / Windows .msi / Linux .AppImage)

**Prerequisites:**
- Java 25 JDK (via SDKMAN or distro)
- Node.js 22.x + npm
- Rust + Cargo (via rustup)
- Tauri CLI: `cargo install tauri-cli`

**Build:**
```bash
cd /home/tiep/.openclaw/workspace/projects/total-pdf
task desktop:build
```

**Platform-specific dev builds:**
```bash
task desktop:build:dev:mac         # macOS .app
task desktop:build:dev:windows     # Windows NSIS installer
task desktop:build:dev:linux       # Linux AppImage
```

### Dev mode
```bash
task dev                          # backend + frontend hot-reload
task desktop:dev                  # Tauri desktop dev (JLink JRE baked)
```

## Rebrand checklist (done)
- [x] Tauri conf: productName, identifier, title, publisher, deep-link scheme
- [x] Cargo.toml: name, description, authors
- [x] PWA manifest.json: short_name, name
- [x] Info.plist: accessibility text
- [x] Desktop entry .desktop template
- [x] Icons all sizes (16-512, Square*, mstile*, StoreLogo, android chrome)
- [x] Public logo directory (classic + modern)
- [x] Rust paths/logging/auth/default-app references
- [x] Windows WiX provisioning
