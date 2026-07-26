use crate::state::connection_state::{AppConnectionState, ConnectionMode};
use crate::utils::{add_log, app_data_dir};
use std::ffi::OsString;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_shell::ShellExt;

// Store backend process handle and port globally
static BACKEND_PROCESS: Mutex<Option<tauri_plugin_shell::process::CommandChild>> = Mutex::new(None);
static BACKEND_STARTING: Mutex<bool> = Mutex::new(false);
static BACKEND_PORT: Mutex<Option<u16>> = Mutex::new(None);

// Helper function to reset starting flag
fn reset_starting_flag() {
    let mut starting_guard = BACKEND_STARTING.lock().unwrap();
    *starting_guard = false;
}

// Extract port number from "Total-PDF running on port: PORT" log line
fn extract_port_from_running_log(log_line: &str) -> Option<u16> {
    // Look for pattern: "running on port: PORT"
    if let Some(start) = log_line.find("running on port: ") {
        let after_prefix = &log_line[start + 17..]; // Skip "running on port: "
                                                    // Take digits until whitespace or end of line
        let port_str: String = after_prefix
            .chars()
            .take_while(|c| c.is_ascii_digit())
            .collect();
        return port_str.parse::<u16>().ok();
    }
    None
}

// Check if backend is already running or starting
fn check_backend_status() -> Result<(), String> {
    // Check if backend is already running
    {
        let process_guard = BACKEND_PROCESS.lock().unwrap();
        if process_guard.is_some() {
            add_log("⚠️ Backend process already running, skipping start".to_string());
            return Err("Backend already running".to_string());
        }
    }

    // Check and set starting flag to prevent multiple simultaneous starts
    {
        let mut starting_guard = BACKEND_STARTING.lock().unwrap();
        if *starting_guard {
            add_log("⚠️ Backend already starting, skipping duplicate start".to_string());
            return Err("Backend startup already in progress".to_string());
        }
        *starting_guard = true;
    }

    Ok(())
}

// Find the bundled JRE and return the java executable path
fn find_bundled_jre(resource_dir: &PathBuf) -> Result<PathBuf, String> {
    let jre_dir = resource_dir.join("runtime").join("jre");
    let java_executable = if cfg!(windows) {
        jre_dir.join("bin").join("java.exe")
    } else {
        jre_dir.join("bin").join("java")
    };

    if !java_executable.exists() {
        let error_msg = format!("❌ Bundled JRE not found at: {:?}", java_executable);
        add_log(error_msg.clone());
        return Err(error_msg);
    }

    add_log(format!("✅ Found bundled JRE: {:?}", java_executable));
    Ok(java_executable)
}

// Find the Total PDF JAR file
fn find_stirling_jar(resource_dir: &PathBuf) -> Result<PathBuf, String> {
    let libs_dir = resource_dir.join("libs");
    let mut jar_files: Vec<_> = std::fs::read_dir(&libs_dir)
        .map_err(|e| {
            let error_msg = format!(
                "Failed to read libs directory: {}. Make sure the JAR is copied to libs/",
                e
            );
            add_log(error_msg.clone());
            error_msg
        })?
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            let path = entry.path();
            // Match any .jar file containing "total-pdf" (case-insensitive)
            path.extension()
                .and_then(|s| s.to_str())
                .map(|ext| ext.eq_ignore_ascii_case("jar"))
                .unwrap_or(false)
                && path
                    .file_name()
                    .and_then(|f| f.to_str())
                    .map(|name| name.to_ascii_lowercase().contains("total-pdf"))
                    .unwrap_or(false)
        })
        .collect();

    if jar_files.is_empty() {
        let error_msg = "No Total-PDF JAR found in libs directory.".to_string();
        add_log(error_msg.clone());
        return Err(error_msg);
    }

    // Sort by filename to get the latest version (case-insensitive)
    jar_files.sort_by(|a, b| {
        let name_a = a.file_name().to_string_lossy().to_ascii_lowercase();
        let name_b = b.file_name().to_string_lossy().to_ascii_lowercase();
        name_b.cmp(&name_a) // Reverse order to get latest first
    });

    let jar_path = jar_files[0].path();
    add_log(format!(
        "📋 Selected JAR: {:?}",
        jar_path.file_name().unwrap()
    ));
    Ok(jar_path)
}

// Normalize path to remove Windows UNC prefix
fn normalize_path(path: &PathBuf) -> PathBuf {
    if cfg!(windows) {
        let path_str = path.to_string_lossy();
        if path_str.starts_with(r"\\?\") {
            PathBuf::from(&path_str[4..]) // Remove \\?\ prefix
        } else {
            path.clone()
        }
    } else {
        path.clone()
    }
}

fn platform_tool_dirs() -> Vec<PathBuf> {
    let mut directories = Vec::new();

    #[cfg(target_os = "macos")]
    {
        if let Some(home) = std::env::var_os("HOME") {
            let home = PathBuf::from(home);
            directories.push(home.join(".local").join("bin"));
            add_python_bin_dirs(&mut directories, home.join("Library").join("Python"), "bin");
        }

        directories.extend([
            PathBuf::from("/opt/homebrew/bin"),
            PathBuf::from("/usr/local/bin"),
            PathBuf::from("/Applications/LibreOffice.app/Contents/MacOS"),
        ]);
    }

    #[cfg(target_os = "linux")]
    {
        if let Some(home) = std::env::var_os("HOME") {
            directories.push(PathBuf::from(home).join(".local").join("bin"));
        }

        directories.extend([PathBuf::from("/usr/local/bin"), PathBuf::from("/usr/bin")]);
    }

    #[cfg(target_os = "windows")]
    {
        if let Some(user_profile) = std::env::var_os("USERPROFILE") {
            directories.push(PathBuf::from(user_profile).join(".local").join("bin"));
        }
        if let Some(app_data) = std::env::var_os("APPDATA") {
            add_python_bin_dirs(
                &mut directories,
                PathBuf::from(app_data).join("Python"),
                "Scripts",
            );
        }
        if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
            let local_app_data = PathBuf::from(local_app_data);
            add_python_bin_dirs(
                &mut directories,
                local_app_data.join("Programs").join("Python"),
                "Scripts",
            );
            directories.push(local_app_data.join("pipx").join("bin"));
            directories.push(
                local_app_data
                    .join("pipx")
                    .join("venvs")
                    .join("ocrmypdf")
                    .join("Scripts"),
            );
        }

        for variable in ["ProgramW6432", "ProgramFiles", "ProgramFiles(x86)"] {
            if let Some(base) = std::env::var_os(variable) {
                let base = PathBuf::from(base);
                directories.push(base.join("Tesseract-OCR"));
                directories.push(base.join("LibreOffice").join("program"));
            }
        }
        if let Some(chocolatey) = std::env::var_os("ChocolateyInstall") {
            directories.push(PathBuf::from(chocolatey).join("bin"));
        }
    }

    directories
}

fn add_python_bin_dirs(directories: &mut Vec<PathBuf>, parent: PathBuf, bin_dir: &str) {
    if let Ok(entries) = std::fs::read_dir(parent) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                directories.push(path.join(bin_dir));
            }
        }
    }
}

#[derive(Debug, Clone)]
struct BundledOcrRuntime {
    root: PathBuf,
    path_dirs: Vec<PathBuf>,
    ocrmypdf_path: Option<PathBuf>,
    tessdata_dir: Option<PathBuf>,
    python_path: Option<PathBuf>,
}

fn current_ocr_runtime_platform() -> &'static str {
    match (std::env::consts::OS, std::env::consts::ARCH) {
        ("macos", "x86_64") => "darwin-x64",
        ("macos", "aarch64") => "darwin-arm64",
        ("windows", "x86_64") => "windows-x64",
        ("linux", "x86_64") => "linux-x64",
        _ => "current",
    }
}

fn find_bundled_ocr_runtime_source(resource_dir: Option<&Path>) -> Option<PathBuf> {
    let ocr_base = resource_dir?.join("runtime").join("ocr");
    let platform_root = ocr_base.join(current_ocr_runtime_platform());

    if platform_root.is_dir() {
        Some(platform_root)
    } else if ocr_base.is_dir() && looks_like_ocr_runtime(&ocr_base) {
        Some(ocr_base)
    } else {
        None
    }
}

fn looks_like_ocr_runtime(root: &Path) -> bool {
    root.join("TOTAL_PDF_OCR_RUNTIME_VERSION").is_file()
        || root.join("bin").join("ocrmypdf").is_file()
        || root.join("Scripts").join("ocrmypdf.exe").is_file()
        || root.join("Scripts").join("ocrmypdf.cmd").is_file()
        || root.join("share").join("tessdata").is_dir()
        || root.join("Library").join("share").join("tessdata").is_dir()
}

fn inspect_ocr_runtime_root(root: PathBuf) -> BundledOcrRuntime {
    #[cfg(target_os = "windows")]
    let path_candidates = {
        let mut candidates = vec![
            root.join("bin"),
            root.join("Scripts"),
            root.join("Library").join("bin"),
            root.clone(),
        ];
        // Conda packages on Windows commonly place DLLs and command-line tools here.
        candidates.extend([
            root.join("Library").join("usr").join("bin"),
            root.join("Library").join("mingw-w64").join("bin"),
        ]);
        candidates
    };

    #[cfg(not(target_os = "windows"))]
    let path_candidates = vec![
        root.join("bin"),
        root.join("Scripts"),
        root.join("Library").join("bin"),
        root.clone(),
    ];

    let path_dirs = path_candidates
        .into_iter()
        .filter(|path| path.is_dir())
        .collect::<Vec<_>>();

    let ocrmypdf_candidates = if cfg!(target_os = "windows") {
        vec![
            root.join("Scripts").join("ocrmypdf.exe"),
            root.join("Scripts").join("ocrmypdf.cmd"),
            root.join("bin").join("ocrmypdf.exe"),
            root.join("ocrmypdf.exe"),
            root.join("ocrmypdf.cmd"),
        ]
    } else {
        vec![
            root.join("bin").join("ocrmypdf"),
            root.join("Scripts").join("ocrmypdf"),
            root.join("ocrmypdf"),
        ]
    };

    let ocrmypdf_path = ocrmypdf_candidates.into_iter().find(|path| path.is_file());

    let tessdata_candidates = vec![
        root.join("share").join("tessdata"),
        root.join("Library").join("share").join("tessdata"),
        root.join("share")
            .join("tesseract-ocr")
            .join("5")
            .join("tessdata"),
        root.join("tessdata"),
    ];

    let tessdata_dir = tessdata_candidates.into_iter().find(|path| path.is_dir());

    let python_candidates = if cfg!(target_os = "windows") {
        vec![
            root.join("python.exe"),
            root.join("Scripts").join("python.exe"),
            root.join("bin").join("python.exe"),
        ]
    } else {
        vec![
            root.join("bin").join("python"),
            root.join("bin").join("python3"),
            root.join("bin").join("python3.12"),
            root.join("python"),
        ]
    };

    let python_path = python_candidates.into_iter().find(|path| path.is_file());

    BundledOcrRuntime {
        root,
        path_dirs,
        ocrmypdf_path,
        tessdata_dir,
        python_path,
    }
}

fn find_bundled_cff_converter_script(resource_dir: Option<&Path>) -> Option<PathBuf> {
    let resource_dir = resource_dir?;
    [
        resource_dir
            .join("runtime")
            .join("scripts")
            .join("convert_cff_to_ttf.py"),
        resource_dir.join("scripts").join("convert_cff_to_ttf.py"),
        resource_dir.join("convert_cff_to_ttf.py"),
    ]
    .into_iter()
    .find(|path| path.is_file())
}

fn read_runtime_version(root: &Path) -> String {
    std::fs::read_to_string(root.join("TOTAL_PDF_OCR_RUNTIME_VERSION"))
        .map(|value| value.trim().to_string())
        .ok()
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| "unversioned".to_string())
}

fn prepare_bundled_ocr_runtime(
    resource_dir: Option<&Path>,
    app_data_dir: &Path,
) -> Option<BundledOcrRuntime> {
    let source_root = find_bundled_ocr_runtime_source(resource_dir)?;
    let source_version = read_runtime_version(&source_root);
    let target_root = app_data_dir
        .join("ocr-runtime")
        .join(current_ocr_runtime_platform());
    let target_version_file = target_root.join("TOTAL_PDF_OCR_RUNTIME_VERSION");
    let existing_version = std::fs::read_to_string(&target_version_file)
        .map(|value| value.trim().to_string())
        .unwrap_or_default();
    let ready_marker = target_root.join(".total-pdf-ocr-runtime-ready");

    if existing_version != source_version || !ready_marker.is_file() {
        add_log(format!(
            "📦 Installing bundled OCR runtime {} into {}",
            source_version,
            target_root.display()
        ));

        if target_root.exists() {
            if let Err(err) = std::fs::remove_dir_all(&target_root) {
                add_log(format!(
                    "⚠️ Failed to remove old OCR runtime at {}: {}",
                    target_root.display(),
                    err
                ));
                return Some(inspect_ocr_runtime_root(source_root));
            }
        }

        if let Err(err) = copy_dir_recursive(&source_root, &target_root) {
            add_log(format!(
                "⚠️ Failed to copy bundled OCR runtime from {} to {}: {}",
                source_root.display(),
                target_root.display(),
                err
            ));
            return Some(inspect_ocr_runtime_root(source_root));
        }

        if run_conda_unpack_if_present(&target_root) {
            if let Err(err) = std::fs::write(&ready_marker, source_version.as_bytes()) {
                add_log(format!(
                    "⚠️ Failed to write OCR runtime ready marker at {}: {}",
                    ready_marker.display(),
                    err
                ));
            }
        } else {
            add_log(
                "⚠️ OCR runtime relocation did not complete; runtime will be prepared again on next launch"
                    .to_string(),
            );
        }
    } else {
        add_log(format!(
            "✅ Bundled OCR runtime already installed: {}",
            target_root.display()
        ));
    }

    Some(inspect_ocr_runtime_root(target_root))
}

fn run_conda_unpack_if_present(runtime_root: &Path) -> bool {
    let candidates = if cfg!(target_os = "windows") {
        vec![
            runtime_root.join("Scripts").join("conda-unpack.exe"),
            runtime_root.join("Scripts").join("conda-unpack.cmd"),
            runtime_root.join("conda-unpack.exe"),
            runtime_root.join("conda-unpack.cmd"),
        ]
    } else {
        vec![
            runtime_root.join("bin").join("conda-unpack"),
            runtime_root.join("conda-unpack"),
        ]
    };

    let Some(conda_unpack) = candidates.into_iter().find(|path| path.is_file()) else {
        add_log("ℹ️ OCR runtime has no conda-unpack hook; skipping relocation step".to_string());
        return true;
    };

    add_log(format!(
        "🔧 Relocating OCR runtime with {}",
        conda_unpack.display()
    ));

    let runtime = inspect_ocr_runtime_root(runtime_root.to_path_buf());
    let runtime_path = build_backend_path(Some(&runtime));

    let mut command = if !cfg!(target_os = "windows") {
        if let Some(python_path) = &runtime.python_path {
            let mut command = std::process::Command::new(python_path);
            command.arg(&conda_unpack);
            command
        } else {
            std::process::Command::new(&conda_unpack)
        }
    } else {
        std::process::Command::new(&conda_unpack)
    };

    match command
        .current_dir(runtime_root)
        .env("PATH", runtime_path)
        .status()
    {
        Ok(status) if status.success() => {
            add_log("✅ OCR runtime relocation completed".to_string());
            true
        }
        Ok(status) => {
            add_log(format!(
                "⚠️ OCR runtime relocation exited with status: {}",
                status
            ));
            false
        }
        Err(err) => {
            add_log(format!("⚠️ Failed to run OCR runtime relocation: {}", err));
            false
        }
    }
}

fn build_backend_path(bundled_ocr: Option<&BundledOcrRuntime>) -> OsString {
    let inherited_path = std::env::var_os("PATH").unwrap_or_default();
    let mut directories: Vec<PathBuf> = Vec::new();

    if let Some(runtime) = bundled_ocr {
        for path in &runtime.path_dirs {
            if !directories.contains(path) {
                directories.push(path.clone());
            }
        }
    }

    for path in platform_tool_dirs() {
        if path.is_dir() && !directories.contains(&path) {
            directories.push(path);
        }
    }

    for path in std::env::split_paths(&inherited_path) {
        if !directories.contains(&path) {
            directories.push(path);
        }
    }

    std::env::join_paths(directories).unwrap_or(inherited_path)
}

fn find_tessdata_dir(resource_dir: Option<&Path>) -> Option<PathBuf> {
    if let Some(configured) = std::env::var_os("TESSDATA_PREFIX") {
        let configured = PathBuf::from(configured);
        if configured.is_dir() {
            return Some(configured);
        }
    }

    let mut candidates = Vec::new();
    if let Some(resource_dir) = resource_dir {
        candidates.push(
            resource_dir
                .join("runtime")
                .join("ocr")
                .join("share")
                .join("tessdata"),
        );
        candidates.push(
            resource_dir
                .join("runtime")
                .join("ocr")
                .join(current_ocr_runtime_platform())
                .join("share")
                .join("tessdata"),
        );
        candidates.push(
            resource_dir
                .join("runtime")
                .join("ocr")
                .join(current_ocr_runtime_platform())
                .join("Library")
                .join("share")
                .join("tessdata"),
        );
        candidates.push(resource_dir.join("tessdata"));
    }

    #[cfg(target_os = "macos")]
    {
        candidates.extend([
            PathBuf::from("/opt/homebrew/share/tessdata"),
            PathBuf::from("/usr/local/share/tessdata"),
        ]);
    }

    #[cfg(target_os = "linux")]
    {
        candidates.extend([
            PathBuf::from("/usr/share/tesseract-ocr/5/tessdata"),
            PathBuf::from("/usr/share/tessdata"),
            PathBuf::from("/usr/local/share/tessdata"),
        ]);
    }

    #[cfg(target_os = "windows")]
    {
        for variable in ["ProgramW6432", "ProgramFiles", "ProgramFiles(x86)"] {
            if let Some(base) = std::env::var_os(variable) {
                candidates.push(PathBuf::from(base).join("Tesseract-OCR").join("tessdata"));
            }
        }
    }

    candidates.into_iter().find(|path| path.is_dir())
}

fn migrate_legacy_workspace(legacy_dir: &PathBuf, target_root: &PathBuf) -> std::io::Result<()> {
    for entry in std::fs::read_dir(legacy_dir)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let src_path = entry.path();
        let dest_path = target_root.join(entry.file_name());

        if file_type.is_dir() {
            copy_dir_recursive(&src_path, &dest_path)?;
        } else if file_type.is_file() {
            if let Some(parent) = dest_path.parent() {
                std::fs::create_dir_all(parent)?;
            }
            std::fs::copy(&src_path, &dest_path)?;
        }
    }

    Ok(())
}

fn copy_dir_recursive(src: &Path, dest: &Path) -> std::io::Result<()> {
    std::fs::create_dir_all(dest)?;

    for entry in std::fs::read_dir(src)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let src_path = entry.path();
        let dest_path = dest.join(entry.file_name());

        if file_type.is_symlink() {
            copy_symlink_or_target(&src_path, &dest_path)?;
        } else if file_type.is_dir() {
            copy_dir_recursive(&src_path, &dest_path)?;
        } else if file_type.is_file() {
            std::fs::copy(&src_path, &dest_path)?;
        }
    }

    Ok(())
}

#[cfg(unix)]
fn copy_symlink_or_target(src: &Path, dest: &Path) -> std::io::Result<()> {
    let target = std::fs::read_link(src)?;
    std::os::unix::fs::symlink(target, dest)
}

#[cfg(windows)]
fn copy_symlink_or_target(src: &Path, dest: &Path) -> std::io::Result<()> {
    let target = std::fs::read_link(src)?;
    let target_metadata = std::fs::metadata(src)?;
    let result = if target_metadata.is_dir() {
        std::os::windows::fs::symlink_dir(&target, dest)
    } else {
        std::os::windows::fs::symlink_file(&target, dest)
    };

    if result.is_ok() {
        return result;
    }

    if target_metadata.is_dir() {
        copy_dir_recursive(src, dest)
    } else {
        std::fs::copy(src, dest).map(|_| ())
    }
}

// Create, configure and run the Java command to run Total PDF JAR
fn run_stirling_pdf_jar(
    app: &tauri::AppHandle,
    java_path: &PathBuf,
    jar_path: &PathBuf,
) -> Result<(), String> {
    // Get platform-specific application data directory for Tauri mode
    let app_data_dir = app_data_dir();

    // Create subdirectories for different purposes
    let config_dir = app_data_dir.join("configs");
    let log_dir = app_data_dir.join("logs");
    let work_dir = app_data_dir.clone();
    let legacy_work_dir = app_data_dir.join("workspace");

    // Create all necessary directories
    std::fs::create_dir_all(&app_data_dir).ok();
    std::fs::create_dir_all(&log_dir).ok();
    std::fs::create_dir_all(&work_dir).ok();
    std::fs::create_dir_all(&config_dir).ok();

    // Migrate legacy workspace content into the app data root before launch.
    if legacy_work_dir.exists() {
        add_log(format!(
            "📦 Migrating legacy workspace from {}",
            legacy_work_dir.display()
        ));
        if let Err(err) = migrate_legacy_workspace(&legacy_work_dir, &app_data_dir) {
            add_log(format!("⚠️ Failed to migrate legacy workspace: {}", err));
        } else {
            match std::fs::remove_dir_all(&legacy_work_dir) {
                Ok(_) => {
                    add_log("✅ Removed legacy workspace directory after migration".to_string())
                }
                Err(err) => add_log(format!("⚠️ Failed to remove legacy workspace: {}", err)),
            }
        }
    }

    add_log(format!("📁 App data directory: {}", app_data_dir.display()));
    add_log(format!("📁 Log directory: {}", log_dir.display()));
    add_log(format!("📁 Working directory: {}", work_dir.display()));
    add_log(format!("📁 Config directory: {}", config_dir.display()));

    // Define all Java options with Tauri-specific paths
    let log_path_option = format!("-Dlogging.file.path={}", log_dir.display());
    let resource_dir = app.path().resource_dir().ok();
    let bundled_ocr = prepare_bundled_ocr_runtime(resource_dir.as_deref(), &app_data_dir);

    if let Some(runtime) = &bundled_ocr {
        add_log(format!(
            "✅ Found bundled OCR runtime: {}",
            runtime.root.display()
        ));
        if let Some(ocrmypdf_path) = &runtime.ocrmypdf_path {
            add_log(format!(
                "✅ Found bundled OCRmyPDF: {}",
                ocrmypdf_path.display()
            ));
        } else {
            add_log("⚠️ Bundled OCR runtime found, but OCRmyPDF executable is missing".to_string());
        }
        if let Some(tessdata_dir) = &runtime.tessdata_dir {
            add_log(format!(
                "✅ Found bundled Tesseract language data: {}",
                tessdata_dir.display()
            ));
        } else {
            add_log(
                "⚠️ Bundled OCR runtime found, but Tesseract language data is missing".to_string(),
            );
        }
        if let Some(python_path) = &runtime.python_path {
            add_log(format!(
                "✅ Found bundled Python runtime: {}",
                python_path.display()
            ));
        } else {
            add_log("⚠️ Bundled OCR runtime found, but Python executable is missing".to_string());
        }
    }

    let tessdata_dir = bundled_ocr
        .as_ref()
        .and_then(|runtime| runtime.tessdata_dir.clone())
        .or_else(|| find_tessdata_dir(resource_dir.as_deref()));
    let cff_converter_script = find_bundled_cff_converter_script(resource_dir.as_deref());

    let mut java_options = vec![
        "-Xmx2g".to_string(),
        "-DBROWSER_OPEN=false".to_string(),
        "-DSTIRLING_PDF_TAURI_MODE=true".to_string(),
        log_path_option,
        "-Dlogging.file.name=total-pdf.log".to_string(),
        "-Dserver.port=0".to_string(), // Let OS assign an available port
        "-Dsecurity.enableLogin=false".to_string(), // Disable login for desktop mode
        "-Dsecurity.csrfDisabled=true".to_string(), // Disable CSRF for desktop mode
        "-jar".to_string(),
        jar_path.to_str().unwrap().to_string(),
    ];

    if let Some(ocrmypdf_path) = bundled_ocr
        .as_ref()
        .and_then(|runtime| runtime.ocrmypdf_path.as_ref())
    {
        java_options.push(format!(
            "--system.customPaths.operations.ocrmypdf={}",
            ocrmypdf_path.display()
        ));
    }

    if let Some(path) = &tessdata_dir {
        java_options.push(format!("--system.tessdataDir={}", path.display()));
    }

    match (
        bundled_ocr
            .as_ref()
            .and_then(|runtime| runtime.python_path.as_ref()),
        cff_converter_script.as_ref(),
    ) {
        (Some(python_path), Some(script_path)) => {
            add_log(format!(
                "✅ Using bundled Python CFF converter: {} {}",
                python_path.display(),
                script_path.display()
            ));
            java_options.push(format!(
                "--pdfEditor.cff-converter.python-command={}",
                python_path.display()
            ));
            java_options.push(format!(
                "--pdfEditor.cff-converter.python-script={}",
                script_path.display()
            ));
        }
        _ if cfg!(any(target_os = "macos", target_os = "windows", target_os = "linux")) => {
            add_log(
                "ℹ️ Bundled Python CFF converter unavailable; disabling desktop CFF converter"
                    .to_string(),
            );
            java_options.push("--pdfEditor.cff-converter.enabled=false".to_string());
        }
        _ => {}
    }

    // Log the equivalent command for external testing
    let java_command = format!(
        "TAURI_PARENT_PID={} \"{}\" {}",
        std::process::id(),
        java_path.display(),
        java_options.join(" ")
    );
    add_log(format!("🔧 Equivalent command: {}", java_command));
    add_log(format!("📁 Backend logs will be in: {}", log_dir.display()));

    // Additional macOS-specific checks
    if cfg!(target_os = "macos") {
        // Check if java executable has execute permissions
        if let Ok(metadata) = std::fs::metadata(java_path) {
            let permissions = metadata.permissions();
            add_log(format!("🔍 Java executable permissions: {:?}", permissions));

            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                let mode = permissions.mode();
                add_log(format!("🔍 Java executable mode: 0o{:o}", mode));
                if mode & 0o111 == 0 {
                    add_log("⚠️ Java executable may not have execute permissions".to_string());
                }
            }
        }

        // Check if we can read the JAR file
        if let Ok(metadata) = std::fs::metadata(jar_path) {
            add_log(format!("📦 JAR file size: {} bytes", metadata.len()));
        } else {
            add_log("⚠️ Cannot read JAR file metadata".to_string());
        }
    }

    // Build a platform-correct PATH so optional desktop tools can be detected.
    let backend_path = build_backend_path(bundled_ocr.as_ref());

    if let Some(path) = &tessdata_dir {
        add_log(format!(
            "✅ Found Tesseract language data: {}",
            path.display()
        ));
    } else {
        add_log("⚠️ Tesseract language data not found; OCR will remain disabled until Tesseract is installed".to_string());
    }

    let mut sidecar_command = app
        .shell()
        .command(java_path.to_str().unwrap())
        .args(java_options)
        .current_dir(&work_dir) // Set working directory to writable location
        .env("TAURI_PARENT_PID", std::process::id().to_string())
        .env("STIRLING_PDF_CONFIG_DIR", config_dir.to_str().unwrap())
        .env("STIRLING_PDF_LOG_DIR", log_dir.to_str().unwrap())
        .env("STIRLING_PDF_WORK_DIR", work_dir.to_str().unwrap())
        .env("PATH", &backend_path);

    if let Some(path) = tessdata_dir {
        sidecar_command = sidecar_command.env("TESSDATA_PREFIX", path);
    }

    add_log("⚙️ Starting backend with bundled JRE...".to_string());

    let (rx, child) = sidecar_command.spawn().map_err(|e| {
        let error_msg = format!("❌ Failed to spawn sidecar: {}", e);
        add_log(error_msg.clone());
        error_msg
    })?;

    // Store the process handle
    {
        let mut process_guard = BACKEND_PROCESS.lock().unwrap();
        *process_guard = Some(child);
    }

    add_log("✅ Backend started with bundled JRE, monitoring output...".to_string());

    // Start monitoring output
    monitor_backend_output(rx);

    Ok(())
}

// Monitor backend output in a separate task
fn monitor_backend_output(
    mut rx: tauri::async_runtime::Receiver<tauri_plugin_shell::process::CommandEvent>,
) {
    tokio::spawn(async move {
        let mut _startup_detected = false;
        let mut error_count = 0;

        while let Some(event) = rx.recv().await {
            match event {
                tauri_plugin_shell::process::CommandEvent::Stdout(output) => {
                    let output_str = String::from_utf8_lossy(&output);
                    // Strip exactly one trailing newline to avoid double newlines
                    let output_str = output_str.strip_suffix('\n').unwrap_or(&output_str);
                    add_log(format!("📤 Backend: {}", output_str));

                    // Look for actual runtime port from web server initialization
                    // Format: "Total-PDF running on port: PORT"
                    if output_str.contains("running on port:") {
                        _startup_detected = true;
                        if let Some(port) = extract_port_from_running_log(&output_str) {
                            let mut port_guard = BACKEND_PORT.lock().unwrap();
                            *port_guard = Some(port);
                            add_log(format!("🎉 Backend started on port: {}", port));
                            add_log(format!("🔌 Navigate to: http://localhost:{}/", port));
                        }
                    }

                    if output_str.contains("Started SPDFApplication") {
                        _startup_detected = true;
                        add_log(format!("🎉 Backend startup completed: {}", output_str));
                    }
                }
                tauri_plugin_shell::process::CommandEvent::Stderr(output) => {
                    let output_str = String::from_utf8_lossy(&output);
                    // Strip exactly one trailing newline to avoid double newlines
                    let output_str = output_str.strip_suffix('\n').unwrap_or(&output_str);
                    add_log(format!("📥 Backend Error: {}", output_str));

                    // Look for error indicators
                    if output_str.contains("ERROR")
                        || output_str.contains("Exception")
                        || output_str.contains("FATAL")
                    {
                        error_count += 1;
                        add_log(format!("⚠️ Backend error #{}: {}", error_count, output_str));
                    }

                    // Look for specific common issues
                    if output_str.contains("Address already in use") {
                        add_log(
                            "🚨 CRITICAL: Port 8080 is already in use by another process!"
                                .to_string(),
                        );
                    }
                    if output_str.contains("java.lang.ClassNotFoundException") {
                        add_log("🚨 CRITICAL: Missing Java dependencies!".to_string());
                    }
                    if output_str.contains("java.io.FileNotFoundException") {
                        add_log("🚨 CRITICAL: Required file not found!".to_string());
                    }
                }
                tauri_plugin_shell::process::CommandEvent::Error(error) => {
                    add_log(format!("❌ Backend process error: {}", error));
                }
                tauri_plugin_shell::process::CommandEvent::Terminated(payload) => {
                    add_log(format!(
                        "💀 Backend terminated with code: {:?}",
                        payload.code
                    ));
                    if let Some(code) = payload.code {
                        match code {
                            0 => println!("✅ Process terminated normally"),
                            1 => println!("❌ Process terminated with generic error"),
                            2 => println!("❌ Process terminated due to misuse"),
                            126 => println!("❌ Command invoked cannot execute"),
                            127 => println!("❌ Command not found"),
                            128 => println!("❌ Invalid exit argument"),
                            130 => println!("❌ Process terminated by Ctrl+C"),
                            _ => println!("❌ Process terminated with code: {}", code),
                        }
                    }
                    // Clear the stored process handle
                    let mut process_guard = BACKEND_PROCESS.lock().unwrap();
                    *process_guard = None;
                }
                _ => {
                    println!("🔍 Unknown command event: {:?}", event);
                }
            }
        }

        if error_count > 0 {
            println!(
                "⚠️ Backend process ended with {} errors detected",
                error_count
            );
        }
    });
}

// Command to start the backend with bundled JRE
#[tauri::command]
pub async fn start_backend(
    app: tauri::AppHandle,
    connection_state: tauri::State<'_, AppConnectionState>,
) -> Result<String, String> {
    add_log(
        "🚀 start_backend() called - Attempting to start backend with bundled JRE...".to_string(),
    );

    // Check connection mode
    let mode = {
        let state = connection_state.0.lock().map_err(|e| {
            let error_msg = format!("❌ Failed to access connection state: {}", e);
            add_log(error_msg.clone());
            error_msg
        })?;
        state.mode.clone()
    };

    match mode {
        ConnectionMode::SaaS => {
            add_log("☁️ Running in SaaS mode - starting local backend".to_string());
        }
        ConnectionMode::SelfHosted => {
            add_log("🌐 Running in Self-Hosted mode - starting local backend (for hybrid execution support)".to_string());
        }
        ConnectionMode::Local => {
            add_log("💻 Running in Local-only mode - starting local backend".to_string());
        }
    }

    // Check if backend is already running or starting
    if let Err(msg) = check_backend_status() {
        return Ok(msg);
    }

    // Use Tauri's resource API to find the bundled JRE and JAR
    let resource_dir = app.path().resource_dir().map_err(|e| {
        let error_msg = format!("❌ Failed to get resource directory: {}", e);
        add_log(error_msg.clone());
        reset_starting_flag();
        error_msg
    })?;

    add_log(format!("🔍 Resource directory: {:?}", resource_dir));

    // Find the bundled JRE
    let java_executable = find_bundled_jre(&resource_dir).map_err(|e| {
        reset_starting_flag();
        e
    })?;

    // Find the Total PDF JAR
    let jar_path = find_stirling_jar(&resource_dir).map_err(|e| {
        reset_starting_flag();
        e
    })?;

    // Normalize the paths to remove Windows UNC prefix
    let normalized_java_path = normalize_path(&java_executable);
    let normalized_jar_path = normalize_path(&jar_path);

    add_log(format!("📦 Found JAR file: {:?}", jar_path));
    add_log(format!("📦 Normalized JAR path: {:?}", normalized_jar_path));
    add_log(format!(
        "📦 Normalized Java path: {:?}",
        normalized_java_path
    ));

    // Create and start the Java command
    run_stirling_pdf_jar(&app, &normalized_java_path, &normalized_jar_path).map_err(|e| {
        reset_starting_flag();
        e
    })?;

    // Reset the starting flag since startup is complete
    reset_starting_flag();
    add_log("✅ Backend startup sequence completed, starting flag cleared".to_string());

    Ok("Backend startup initiated successfully with bundled JRE".to_string())
}

// Get the dynamically assigned backend port
#[tauri::command]
pub fn get_backend_port() -> Option<u16> {
    let port_guard = BACKEND_PORT.lock().unwrap();
    *port_guard
}

// Cleanup function to stop backend on app exit
pub fn cleanup_backend() {
    let mut process_guard = BACKEND_PROCESS.lock().unwrap();
    if let Some(child) = process_guard.take() {
        let pid = child.pid();
        add_log(format!(
            "🧹 App shutting down, cleaning up backend process (PID: {})",
            pid
        ));

        match child.kill() {
            Ok(_) => {
                add_log(format!(
                    "✅ Backend process (PID: {}) terminated during cleanup",
                    pid
                ));
            }
            Err(e) => {
                add_log(format!(
                    "❌ Failed to terminate backend process during cleanup: {}",
                    e
                ));
                println!(
                    "❌ Failed to terminate backend process during cleanup: {}",
                    e
                );
            }
        }
    }
}
