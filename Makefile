.PHONY: dev build release install clean check

# Development server
dev:
	npm run tauri dev

# Debug build
build:
	npm run tauri build -- --debug

# Release build
release:
	npm run tauri build

# Install npm dependencies
install:
	npm install

# Type-check frontend
check:
	npm run check

# Clean build artifacts
clean:
	rm -rf build src-tauri/target node_modules/.cache

# Full rebuild
rebuild: clean install release

# Linux: install system dependencies (Debian/Ubuntu)
deps-linux:
	sudo apt-get update && sudo apt-get install -y \
		libwebkit2gtk-4.1-dev \
		libssl-dev \
		libgtk-3-dev \
		libayatana-appindicator3-dev \
		librsvg2-dev \
		patchelf

# Windows: install Rust toolchain
deps-windows:
	winget install Rustlang.Rustup
	rustup target add x86_64-pc-windows-msvc
