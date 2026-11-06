#!/usr/bin/env python3
"""
Yuva Shakti Group - Automated APK Bundler & Signer
Packages the compiled Vite/React dist into the Android APK assets,
generates valid APK v1 manifest and signature using the project keystore,
and updates public/YuvaShaktiGroup_v4.5.9.apk, public/YuvaShaktiGroup.apk and apk_base64.txt.
"""

import os
import sys
import zipfile
import hashlib
import base64
import subprocess
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')
BASE_APK = os.path.join(PUBLIC_DIR, 'YuvaShaktiGroup_v4.5.9.apk')
OUTPUT_APK_VERSION = os.path.join(PUBLIC_DIR, 'YuvaShaktiGroup_v4.5.9.apk')
OUTPUT_APK_LATEST = os.path.join(PUBLIC_DIR, 'YuvaShaktiGroup.apk')
BASE64_FILE = os.path.join(PUBLIC_DIR, 'apk_base64.txt')

def b64_sha256(data: bytes) -> str:
    return base64.b64encode(hashlib.sha256(data).digest()).decode('ascii')

def main():
    print("--- 🚩 Starting Yuva Shakti Group APK Packaging & Signing ---")

    if not os.path.isdir(DIST_DIR) or not os.path.isfile(os.path.join(DIST_DIR, 'index.html')):
        print("dist/ not found, building Vite app first...")
        subprocess.run(['npm', 'run', 'build'], cwd=ROOT_DIR, check=True)

    # 1. Read dist files
    dist_files = {}
    for root, _, files in os.walk(DIST_DIR):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, DIST_DIR)
            with open(full_path, 'rb') as fp:
                dist_files[rel_path] = fp.read()

    print(f"Loaded {len(dist_files)} files from dist/.")

    # 2. Extract keystore if needed
    keystore_base64_path = os.path.join(ROOT_DIR, 'debug.keystore.base64')
    keystore_path = '/tmp/app_debug.keystore'
    if os.path.isfile(keystore_base64_path):
        with open(keystore_base64_path, 'r') as f:
            b64_content = f.read().strip()
        with open(keystore_path, 'wb') as f:
            f.write(base64.b64decode(b64_content))
    else:
        print("Error: debug.keystore.base64 not found!")
        sys.exit(1)

    # 3. Extract key and cert via openssl
    key_pem = '/tmp/apk_key.pem'
    cert_pem = '/tmp/apk_cert.pem'
    subprocess.run([
        'openssl', 'pkcs12', '-in', keystore_path,
        '-nodes', '-passin', 'pass:android',
        '-nocerts', '-out', key_pem
    ], check=True, capture_output=True)

    subprocess.run([
        'openssl', 'pkcs12', '-in', keystore_path,
        '-nodes', '-passin', 'pass:android',
        '-nokeys', '-out', cert_pem
    ], check=True, capture_output=True)

    # 4. Read base APK entries (excluding META-INF and old assets)
    apk_entries = {}
    with zipfile.ZipFile(BASE_APK, 'r') as z:
        for info in z.infolist():
            if info.filename.startswith('META-INF/'):
                continue
            if 'aistudio' in info.filename:
                continue
            if info.filename.startswith('assets/assets/'):
                continue
            apk_entries[info.filename] = z.read(info.filename)

    # 5. Inject dist files into APK assets/
    # Main HTML entry
    if 'index.html' in dist_files:
        apk_entries['assets/index.html'] = dist_files['index.html']

    # Sub-assets (e.g. assets/assets/index-xxx.js and css)
    for path, content in dist_files.items():
        if path.startswith('assets/'):
            # Skip heavy archival screenshots and zips from being packaged into APK
            if 'aistudio' in path:
                continue
            apk_entries[f'assets/{path}'] = content

    print(f"Total entries in packaged APK: {len(apk_entries)}")

    # 6. Generate META-INF/MANIFEST.MF
    manifest_lines = [
        "Manifest-Version: 1.0",
        "Created-By: 1.0 (Android Yuva Shakti)",
        ""
    ]
    entry_hashes = {}
    for name in sorted(apk_entries.keys()):
        h = b64_sha256(apk_entries[name])
        entry_hashes[name] = h
        manifest_lines.append(f"Name: {name}")
        manifest_lines.append(f"SHA-256-Digest: {h}")
        manifest_lines.append("")

    manifest_bytes = ("\r\n".join(manifest_lines) + "\r\n").encode('utf-8')

    # 7. Generate META-INF/YUVASHAK.SF
    sf_lines = [
        "Signature-Version: 1.0",
        "Created-By: 1.0 (Android Yuva Shakti)",
        f"SHA-256-Digest-Manifest: {b64_sha256(manifest_bytes)}",
        "X-Android-APK-Signed: 2, 3",
        ""
    ]
    for name in sorted(apk_entries.keys()):
        # Individual section in manifest
        section = f"Name: {name}\r\nSHA-256-Digest: {entry_hashes[name]}\r\n\r\n".encode('utf-8')
        sf_lines.append(f"Name: {name}")
        sf_lines.append(f"SHA-256-Digest: {b64_sha256(section)}")
        sf_lines.append("")

    sf_bytes = ("\r\n".join(sf_lines) + "\r\n").encode('utf-8')

    # 8. Sign YUVASHAK.SF with openssl cms
    sf_tmp = '/tmp/YUVASHAK.SF'
    rsa_tmp = '/tmp/YUVASHAK.RSA'
    with open(sf_tmp, 'wb') as f:
        f.write(sf_bytes)

    subprocess.run([
        'openssl', 'cms', '-sign',
        '-in', sf_tmp,
        '-inkey', key_pem,
        '-signer', cert_pem,
        '-outform', 'DER',
        '-binary', '-noattr', '-nosmimecap',
        '-out', rsa_tmp
    ], check=True)

    with open(rsa_tmp, 'rb') as f:
        rsa_bytes = f.read()

    # 9. Build final APK zip
    tmp_out_apk = '/tmp/YuvaShaktiGroup_signed.apk'
    with zipfile.ZipFile(tmp_out_apk, 'w', compression=zipfile.ZIP_DEFLATED) as out_z:
        # Write META-INF first or last as standard
        out_z.writestr('META-INF/MANIFEST.MF', manifest_bytes)
        out_z.writestr('META-INF/YUVASHAK.SF', sf_bytes)
        out_z.writestr('META-INF/YUVASHAK.RSA', rsa_bytes)

        # Write remaining entries
        for name, data in apk_entries.items():
            # Keep PNGs and resources uncompressed for best Android performance
            compress = zipfile.ZIP_STORED if (name.endswith('.png') or name.endswith('.arsc')) else zipfile.ZIP_DEFLATED
            out_z.writestr(name, data, compress_type=compress)

    # 10. Copy to destinations
    shutil.copyfile(tmp_out_apk, OUTPUT_APK_VERSION)
    shutil.copyfile(tmp_out_apk, OUTPUT_APK_LATEST)
    final_size = os.path.getsize(OUTPUT_APK_VERSION)
    print(f"✅ Signed APK generated successfully! Size: {final_size} bytes ({final_size // 1024} KB)")

    # 11. Update base64 text file
    with open(OUTPUT_APK_VERSION, 'rb') as f:
        apk_data = f.read()
    b64_str = base64.b64encode(apk_data).decode('ascii')
    with open(BASE64_FILE, 'w') as f:
        f.write(b64_str)
    print(f"✅ Updated {BASE64_FILE} ({len(b64_str)} bytes)")

    print("--- 🚀 Yuva Shakti Group APK Packaging Completed Successfully ---")

if __name__ == '__main__':
    main()
