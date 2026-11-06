#!/usr/bin/env python3
"""
Yuva Shakti Group - Official Android APK Packager & Signer
Uses official Android SDK tools (zipalign + apksigner) with v1, v2 & v3 signature schemes.
Guarantees compatibility with all modern Android versions (Android 7.0 through Android 15).
"""

import os
import sys
import zipfile
import base64
import subprocess
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')
OUTPUT_APK_VERSION = os.path.join(PUBLIC_DIR, 'YuvaShaktiGroup_v4.5.9.apk')
OUTPUT_APK_LATEST = os.path.join(PUBLIC_DIR, 'YuvaShaktiGroup.apk')
ROOT_APK = os.path.join(ROOT_DIR, 'YuvaShaktiGroup.apk')
BASE64_FILE = os.path.join(PUBLIC_DIR, 'apk_base64.txt')
KEYSTORE_BASE64_PATH = os.path.join(ROOT_DIR, 'debug.keystore.base64')
KEYSTORE_PATH = '/tmp/app_debug.keystore'

def main():
    print("--- 🚩 Starting Official Android APK Packaging & Signing ---")

    # 1. Ensure dist is built
    if not os.path.isdir(DIST_DIR) or not os.path.isfile(os.path.join(DIST_DIR, 'index.html')):
        print("Building Vite app first...")
        subprocess.run(['npm', 'run', 'build'], cwd=ROOT_DIR, check=True)

    # 2. Extract keystore
    if not os.path.isfile(KEYSTORE_PATH) or os.path.getsize(KEYSTORE_PATH) == 0:
        if os.path.isfile(KEYSTORE_BASE64_PATH):
            with open(KEYSTORE_BASE64_PATH, 'r') as f:
                b64_content = f.read().strip()
            with open(KEYSTORE_PATH, 'wb') as f:
                f.write(base64.b64decode(b64_content))
            print("✅ Keystore extracted from debug.keystore.base64")
        else:
            print("❌ Error: debug.keystore.base64 not found!")
            sys.exit(1)

    # 3. Read dist files
    dist_files = {}
    for root, _, files in os.walk(DIST_DIR):
        for f in files:
            if f.endswith('.apk') or f.endswith('.txt') or 'aistudio' in f:
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, DIST_DIR)
            with open(full_path, 'rb') as fp:
                dist_files[rel_path] = fp.read()
    print(f"Loaded {len(dist_files)} web assets from dist/.")

    # 4. Read base APK entries (classes.dex, resources.arsc, AndroidManifest.xml, res/)
    base_apk = OUTPUT_APK_LATEST if os.path.isfile(OUTPUT_APK_LATEST) else os.path.join(PUBLIC_DIR, 'YuvaShaktiGroup_v4.5.9.apk')
    apk_entries = {}
    with zipfile.ZipFile(base_apk, 'r') as z:
        for info in z.infolist():
            # Strip all META-INF signature files completely
            if info.filename.startswith('META-INF/'):
                continue
            # Strip old assets to prevent stale code
            if info.filename.startswith('assets/'):
                continue
            apk_entries[info.filename] = z.read(info.filename)

    # 5. Inject latest web assets into assets/
    if 'index.html' in dist_files:
        html_str = dist_files['index.html'].decode('utf-8')
        # Ensure script is classic defer (not type="module" which is blocked by Android WebView CORS on file:///)
        html_str = html_str.replace('type="module" crossorigin src="./assets/index.js"', 'defer src="./assets/index.js"')
        html_str = html_str.replace('type="module" src="./assets/index.js"', 'defer src="./assets/index.js"')
        html_bytes = html_str.encode('utf-8')
        apk_entries['assets/index.html'] = html_bytes

    for path, content in dist_files.items():
        if 'aistudio' in path:
            continue
        if path.startswith('assets/'):
            # Provide both assets/assets/xxx and assets/xxx to ensure 100% path match in Android WebView
            apk_entries[f'assets/{path}'] = content
            sub_name = path[len('assets/'):]
            apk_entries[f'assets/{sub_name}'] = content
        elif path != 'index.html':
            apk_entries[f'assets/{path}'] = content

    # Keep app icon in assets if present
    apk_entries['assets/ic_launcher.png'] = apk_entries.get('res/mipmap-xxhdpi-v4/ic_launcher.png', b'')

    print(f"Total entries in unaligned APK: {len(apk_entries)}")

    # 6. Write unaligned APK (PNGs and ARSC stored uncompressed for optimal Android performance)
    unaligned_apk = '/tmp/unaligned_app.apk'
    with zipfile.ZipFile(unaligned_apk, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
        for name, data in sorted(apk_entries.items()):
            compress = zipfile.ZIP_STORED if (name.endswith('.png') or name.endswith('.arsc')) else zipfile.ZIP_DEFLATED
            zout.writestr(name, data, compress_type=compress)

    # 7. Zipalign (4-byte alignment required by Android)
    aligned_apk = '/tmp/aligned_app.apk'
    if os.path.exists(aligned_apk):
        os.remove(aligned_apk)
    subprocess.run(['zipalign', '-p', '-f', '4', unaligned_apk, aligned_apk], check=True)
    print("✅ Successfully aligned APK using zipalign (4-byte page aligned)")

    # 8. Sign with official apksigner (v1 + v2 + v3 schemes)
    signed_apk = '/tmp/signed_app.apk'
    if os.path.exists(signed_apk):
        os.remove(signed_apk)

    subprocess.run([
        'apksigner', 'sign',
        '--ks', KEYSTORE_PATH,
        '--ks-pass', 'pass:android',
        '--ks-key-alias', 'androiddebugkey',
        '--key-pass', 'pass:android',
        '--min-sdk-version', '21',
        '--v1-signing-enabled', 'true',
        '--v2-signing-enabled', 'true',
        '--v3-signing-enabled', 'true',
        '--out', signed_apk,
        aligned_apk
    ], check=True)
    print("✅ Successfully signed APK using apksigner (v1 + v2 + v3 schemes)")

    # 9. Verify signature
    res = subprocess.run(['apksigner', 'verify', '--verbose', '--min-sdk-version', '21', signed_apk], capture_output=True, text=True, check=True)
    print("✅ apksigner verification output:\n" + res.stdout.strip())

    # 10. Copy signed APK to all target destinations
    shutil.copyfile(signed_apk, OUTPUT_APK_VERSION)
    shutil.copyfile(signed_apk, OUTPUT_APK_LATEST)
    shutil.copyfile(signed_apk, ROOT_APK)
    final_size = os.path.getsize(OUTPUT_APK_LATEST)
    print(f"✅ Final APK Size: {final_size} bytes ({final_size // 1024} KB)")

    # 11. Update base64 file
    with open(OUTPUT_APK_LATEST, 'rb') as f:
        apk_data = f.read()
    b64_str = base64.b64encode(apk_data).decode('ascii')
    with open(BASE64_FILE, 'w') as f:
        f.write(b64_str)
    print(f"✅ Updated {BASE64_FILE} ({len(b64_str)} bytes)")

    print("--- 🚀 Yuva Shakti Group APK Packaging Completed Successfully ---")

if __name__ == '__main__':
    main()
