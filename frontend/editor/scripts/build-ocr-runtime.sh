#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

detect_target_platform() {
  case "$(uname -s)-$(uname -m)" in
    Darwin-x86_64) echo "darwin-x64" ;;
    Darwin-arm64) echo "darwin-arm64" ;;
    Linux-x86_64) echo "linux-x64" ;;
    MINGW64*-x86_64|MSYS*-x86_64|CYGWIN*-x86_64) echo "windows-x64" ;;
    *) echo "unsupported" ;;
  esac
}

target_platform="${1:-$(detect_target_platform)}"
output_dir="${2:-$REPO_ROOT/frontend/editor/src-tauri/runtime/ocr/$target_platform}"
runtime_version="${OCR_RUNTIME_VERSION:-total-pdf-2.11.0-ocr-runtime-v1-$target_platform}"
strict="${OCR_RUNTIME_STRICT:-1}"

case "$target_platform" in
  darwin-x64)   mamba_platform="osx-64" ;;
  darwin-arm64) mamba_platform="osx-arm64" ;;
  windows-x64)  mamba_platform="win-64" ;;
  linux-x64)    mamba_platform="linux-64" ;;
  *)
    echo "Unsupported OCR runtime target platform: $target_platform" >&2
    exit 2
    ;;
esac

case "$output_dir" in
  ""|"/"|"$REPO_ROOT"|"$REPO_ROOT/"|"$HOME"|"$HOME/")
    echo "Refusing unsafe OCR runtime output directory: $output_dir" >&2
    exit 2
    ;;
esac

host_mamba_platform() {
  case "$(uname -s)-$(uname -m)" in
    Darwin-x86_64) echo "osx-64" ;;
    Darwin-arm64) echo "osx-arm64" ;;
    Linux-x86_64) echo "linux-64" ;;
    MINGW64*-x86_64|MSYS*-x86_64|CYGWIN*-x86_64) echo "win-64" ;;
    *) echo "" ;;
  esac
}

work_dir="${OCR_RUNTIME_WORKDIR:-$(mktemp -d)}"
cleanup_work_dir() {
  if [[ -z "${OCR_RUNTIME_WORKDIR:-}" ]]; then
    rm -rf "$work_dir"
  fi
}
trap cleanup_work_dir EXIT

find_or_download_micromamba() {
  if [[ -n "${MICROMAMBA_BIN:-}" && -x "$MICROMAMBA_BIN" ]]; then
    echo "$MICROMAMBA_BIN"
    return
  fi
  if command -v micromamba >/dev/null 2>&1; then
    command -v micromamba
    return
  fi

  local host_platform
  host_platform="$(host_mamba_platform)"
  if [[ -z "$host_platform" ]]; then
    echo "Cannot determine host platform for micromamba download" >&2
    exit 2
  fi

  local archive="$work_dir/micromamba.tar.bz2"
  local extract_dir="$work_dir/micromamba"
  local candidate
  mkdir -p "$extract_dir"
  curl -fsSL "https://micro.mamba.pm/api/micromamba/$host_platform/latest" -o "$archive"
  tar -xjf "$archive" -C "$extract_dir"

  for candidate in \
    "$extract_dir/bin/micromamba" \
    "$extract_dir/Library/bin/micromamba.exe" \
    "$extract_dir/micromamba" \
    "$extract_dir/micromamba.exe"; do
    if [[ -x "$candidate" ]]; then
      echo "$candidate"
      return
    fi
  done

  candidate="$(find "$extract_dir" -type f \( -name micromamba -o -name micromamba.exe \) -print -quit)"
  if [[ -n "$candidate" ]]; then
    chmod +x "$candidate" 2>/dev/null || true
    echo "$candidate"
    return
  fi

  echo "Downloaded micromamba archive, but no micromamba executable was found" >&2
  exit 1
}

micromamba_bin="$(find_or_download_micromamba)"
env_prefix="$work_dir/env"
pack_file="$work_dir/ocr-runtime.tar"

base_packages=(
  "python=3.12"
  "conda-pack"
  "ocrmypdf=17.8.*"
  "tesseract=5.5.*"
  "ghostscript=10.07.*"
  "qpdf=12.3.*"
)

# pngquant is an optimization helper. Some platforms no longer have a current
# conda-forge CLI package, so keep it best-effort instead of making OCR unusable.
best_effort_packages=()
case "$target_platform" in
  linux-x64)
    best_effort_packages+=("unpaper" "pngquant")
    ;;
esac

echo "Building OCR runtime: target=$target_platform conda_subdir=$mamba_platform"
echo "Output: $output_dir"

"$micromamba_bin" create -y -p "$env_prefix" --platform "$mamba_platform" -c conda-forge "${base_packages[@]}"

if (( ${#best_effort_packages[@]} > 0 )); then
  for package_name in "${best_effort_packages[@]}"; do
    if ! "$micromamba_bin" install -y -p "$env_prefix" --platform "$mamba_platform" -c conda-forge "$package_name"; then
      echo "Warning: optional OCR helper package was not installed: $package_name" >&2
    fi
  done
fi

conda_pack="$env_prefix/bin/conda-pack"
if [[ "$target_platform" == "windows-x64" ]]; then
  conda_pack="$env_prefix/Scripts/conda-pack.exe"
fi

if [[ ! -x "$conda_pack" ]]; then
  echo "conda-pack executable not found in OCR build env: $conda_pack" >&2
  exit 1
fi

"$conda_pack" -p "$env_prefix" -o "$pack_file" --ignore-missing-files

rm -rf "$output_dir"
mkdir -p "$output_dir"
tar -xf "$pack_file" -C "$output_dir"

write_posix_wrappers() {
  local bin_dir="$output_dir/bin"
  mkdir -p "$bin_dir"

  if [[ -f "$bin_dir/ocrmypdf" && ! -f "$bin_dir/ocrmypdf-conda-entrypoint" ]]; then
    mv "$bin_dir/ocrmypdf" "$bin_dir/ocrmypdf-conda-entrypoint"
  fi

  cat > "$bin_dir/ocrmypdf" <<'WRAPPER'
#!/usr/bin/env sh
set -eu
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
prefix=$(CDPATH= cd -- "$script_dir/.." && pwd)
export CONDA_PREFIX="$prefix"
export PATH="$prefix/bin:$PATH"
if [ -d "$prefix/share/tessdata" ]; then
  export TESSDATA_PREFIX="$prefix/share/tessdata"
fi
exec "$prefix/bin/python" -m ocrmypdf "$@"
WRAPPER
  chmod +x "$bin_dir/ocrmypdf"
}

write_windows_wrappers() {
  local scripts_dir="$output_dir/Scripts"
  mkdir -p "$scripts_dir"

  cat > "$scripts_dir/ocrmypdf.cmd" <<'WRAPPER'
@echo off
set "PREFIX=%~dp0.."
set "CONDA_PREFIX=%PREFIX%"
set "PATH=%PREFIX%;%PREFIX%\Scripts;%PREFIX%\Library\bin;%PATH%"
if exist "%PREFIX%\Library\share\tessdata" set "TESSDATA_PREFIX=%PREFIX%\Library\share\tessdata"
"%PREFIX%\python.exe" -m ocrmypdf %*
WRAPPER

  if [[ -f "$output_dir/Library/bin/gswin64c.exe" && ! -f "$scripts_dir/gs.cmd" ]]; then
    cat > "$scripts_dir/gs.cmd" <<'WRAPPER'
@echo off
set "PREFIX=%~dp0.."
"%PREFIX%\Library\bin\gswin64c.exe" %*
WRAPPER
  fi
}

if [[ "$target_platform" == "windows-x64" ]]; then
  write_windows_wrappers
else
  write_posix_wrappers
fi

install_msys2_package_if_needed() {
  local executable="$1"
  local package="$2"

  if command -v "$executable" >/dev/null 2>&1; then
    return
  fi
  if ! command -v pacman >/dev/null 2>&1; then
    return
  fi

  echo "Installing MSYS2 package for OCR helper: $package"
  pacman --noconfirm -S --needed "$package"
}

windows_find_tool() {
  local executable="$1"
  local candidate

  for candidate in "$executable" "$executable.exe"; do
    if command -v "$candidate" >/dev/null 2>&1; then
      command -v "$candidate"
      return
    fi
  done

  if [[ -n "${MSYS2_LOCATION:-}" ]]; then
    for candidate in \
      "$MSYS2_LOCATION/mingw64/bin/$executable.exe" \
      "$MSYS2_LOCATION/ucrt64/bin/$executable.exe" \
      "$MSYS2_LOCATION/clang64/bin/$executable.exe"; do
      if [[ -f "$candidate" ]]; then
        echo "$candidate"
        return
      fi
    done
  fi

  for candidate in \
    /mingw64/bin/"$executable.exe" \
    /ucrt64/bin/"$executable.exe" \
    /clang64/bin/"$executable.exe" \
    /c/msys64/mingw64/bin/"$executable.exe" \
    /c/msys64/ucrt64/bin/"$executable.exe"; do
    if [[ -f "$candidate" ]]; then
      echo "$candidate"
      return
    fi
  done

  return 1
}

windows_dll_deps() {
  local binary="$1"

  if ! command -v ldd >/dev/null 2>&1; then
    echo "Warning: ldd is unavailable; cannot bundle DLL closure for $binary" >&2
    return 1
  fi

  ldd "$binary" \
    | awk '
        /=>/ { print $(NF - 1); next }
        /^[[:space:]]*\/(mingw64|ucrt64|clang64)\// { print $1 }
      ' \
    | grep -Ei '^/(mingw64|ucrt64|clang64)/bin/.*\.dll$' \
    || true
}

copy_windows_dll_closure() {
  local source_file="$1"
  local dep dep_dest
  mkdir -p "$output_dir/Library/bin"

  while IFS= read -r dep; do
    [[ -z "$dep" || ! -f "$dep" ]] && continue
    dep_dest="$output_dir/Library/bin/$(basename "$dep")"

    if [[ ! -f "$dep_dest" ]]; then
      cp -L "$dep" "$dep_dest"
      chmod u+w "$dep_dest" 2>/dev/null || true
      copy_windows_dll_closure "$dep"
    fi
  done < <(windows_dll_deps "$source_file")
}

vendor_windows_tool() {
  local executable="$1"
  local package="$2"
  local source_path dest_path

  install_msys2_package_if_needed "$executable.exe" "$package"

  if ! source_path="$(windows_find_tool "$executable")"; then
    echo "Warning: MSYS2 OCR helper is unavailable and will not be bundled: $executable.exe" >&2
    return 1
  fi

  dest_path="$output_dir/Library/bin/$executable.exe"
  mkdir -p "$output_dir/Library/bin"
  cp -L "$source_path" "$dest_path"
  chmod u+w,+x "$dest_path" 2>/dev/null || true
  copy_windows_dll_closure "$dest_path"
  echo "Bundled Windows OCR helper: $executable.exe"
}

install_homebrew_formula_if_needed() {
  local executable="$1"
  local formula="$2"

  if command -v "$executable" >/dev/null 2>&1; then
    return
  fi
  if ! command -v brew >/dev/null 2>&1; then
    return
  fi

  echo "Installing Homebrew formula for OCR helper: $formula"
  brew install "$formula"
}

macos_dylib_deps() {
  local binary="$1"
  otool -L "$binary" \
    | awk 'NR > 1 { print $1 }' \
    | grep -E '^(/usr/local|/opt/homebrew)/' \
    || true
}

rewrite_macos_deps() {
  local target_file="$1"
  local loader_prefix="$2"
  local dep dep_name

  while IFS= read -r dep; do
    [[ -z "$dep" ]] && continue
    dep_name="$(basename "$dep")"
    install_name_tool -change "$dep" "$loader_prefix/$dep_name" "$target_file" 2>/dev/null || true
  done < <(macos_dylib_deps "$target_file")
}

copy_macos_dylib_closure() {
  local source_file="$1"
  local dep dep_name dep_dest
  mkdir -p "$output_dir/lib"

  while IFS= read -r dep; do
    [[ -z "$dep" ]] && continue
    dep_name="$(basename "$dep")"
    dep_dest="$output_dir/lib/$dep_name"

    if [[ ! -f "$dep_dest" ]]; then
      cp -L "$dep" "$dep_dest"
      chmod u+w "$dep_dest"
      copy_macos_dylib_closure "$dep_dest"
      install_name_tool -id "@rpath/$dep_name" "$dep_dest" 2>/dev/null || true
      rewrite_macos_deps "$dep_dest" "@loader_path"
    fi
  done < <(macos_dylib_deps "$source_file")
}

vendor_macos_tool() {
  local executable="$1"
  local formula="$2"
  local source_path dest_path expected_arch file_info

  install_homebrew_formula_if_needed "$executable" "$formula"

  if ! command -v "$executable" >/dev/null 2>&1; then
    echo "Warning: Homebrew OCR helper is unavailable and will not be bundled: $executable" >&2
    return 1
  fi

  source_path="$(command -v "$executable")"
  expected_arch="arm64"
  if [[ "$target_platform" == "darwin-x64" ]]; then
    expected_arch="x86_64"
  fi
  file_info="$(file "$source_path")"
  if [[ "$file_info" != *"$expected_arch"* ]]; then
    echo "Warning: $executable has wrong architecture for $target_platform: $file_info" >&2
    return 1
  fi

  dest_path="$output_dir/bin/$executable"
  mkdir -p "$output_dir/bin"
  cp -L "$source_path" "$dest_path"
  chmod u+w,+x "$dest_path"
  copy_macos_dylib_closure "$dest_path"
  rewrite_macos_deps "$dest_path" "@loader_path/../lib"
  echo "Bundled macOS OCR helper: $executable"
}

if [[ "$target_platform" == darwin-* && "${OCR_RUNTIME_VENDOR_HOMEBREW:-1}" == "1" ]]; then
  vendor_macos_tool "unpaper" "unpaper" || true
  vendor_macos_tool "pngquant" "pngquant" || true
  vendor_macos_tool "jbig2" "jbig2enc" || true
fi

if [[ "$target_platform" == "windows-x64" && "${OCR_RUNTIME_VENDOR_MSYS2:-1}" == "1" ]]; then
  windows_package_prefix="${MINGW_PACKAGE_PREFIX:-mingw-w64-ucrt-x86_64}"
  vendor_windows_tool "unpaper" "$windows_package_prefix-unpaper" || true
  vendor_windows_tool "pngquant" "$windows_package_prefix-pngquant" || true
fi

cat > "$output_dir/TOTAL_PDF_OCR_RUNTIME_VERSION" <<VERSION
$runtime_version
VERSION

cat > "$output_dir/TOTAL_PDF_OCR_RUNTIME_PACKAGES.txt" <<PACKAGES
target_platform=$target_platform
conda_subdir=$mamba_platform
packages=${base_packages[*]} ${best_effort_packages[*]-}
PACKAGES

tool_exists() {
  local tool="$1"
  case "$target_platform:$tool" in
    windows-x64:ocrmypdf) [[ -f "$output_dir/Scripts/ocrmypdf.exe" || -f "$output_dir/Scripts/ocrmypdf.cmd" ]] ;;
    windows-x64:tesseract) [[ -f "$output_dir/Library/bin/tesseract.exe" || -f "$output_dir/tesseract.exe" ]] ;;
    windows-x64:qpdf) [[ -f "$output_dir/Library/bin/qpdf.exe" || -f "$output_dir/qpdf.exe" ]] ;;
    windows-x64:gs) [[ -f "$output_dir/Library/bin/gswin64c.exe" || -f "$output_dir/Scripts/gs.cmd" ]] ;;
    windows-x64:unpaper) [[ -f "$output_dir/Library/bin/unpaper.exe" || -f "$output_dir/Scripts/unpaper.exe" ]] ;;
    windows-x64:pngquant) [[ -f "$output_dir/Library/bin/pngquant.exe" || -f "$output_dir/Scripts/pngquant.exe" ]] ;;
    *:ocrmypdf) [[ -x "$output_dir/bin/ocrmypdf" ]] ;;
    *:tesseract) [[ -x "$output_dir/bin/tesseract" ]] ;;
    *:qpdf) [[ -x "$output_dir/bin/qpdf" ]] ;;
    *:gs) [[ -x "$output_dir/bin/gs" ]] ;;
    *:unpaper) [[ -x "$output_dir/bin/unpaper" ]] ;;
    *:pngquant) [[ -x "$output_dir/bin/pngquant" ]] ;;
    *:jbig2) [[ -x "$output_dir/bin/jbig2" ]] ;;
    *) return 1 ;;
  esac
}

required_tools=(ocrmypdf tesseract qpdf gs)
case "$target_platform" in
  darwin-*)
    required_tools+=(unpaper pngquant jbig2)
    ;;
  linux-x64|windows-x64)
    required_tools+=(unpaper pngquant)
    ;;
esac

missing=()
for tool in "${required_tools[@]}"; do
  if ! tool_exists "$tool"; then
    missing+=("$tool")
  fi
done

if (( ${#missing[@]} > 0 )); then
  echo "Missing required OCR runtime tools: ${missing[*]}" >&2
  if [[ "$strict" == "1" ]]; then
    exit 1
  fi
fi

echo "OCR runtime built at $output_dir"
