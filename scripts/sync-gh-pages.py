#!/usr/bin/env python3
"""
Yuva Shakti Group - GitHub Pages Root Synchronizer
Syncs dist/ assets, index.html, and worker scripts to the root directory
so that the app can be hosted directly on GitHub Pages (/root) without 404 or blank screen errors.
"""

import os
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')
ROOT_ASSETS_DIR = os.path.join(ROOT_DIR, 'assets')
DIST_ASSETS_DIR = os.path.join(DIST_DIR, 'assets')

def sync_gh_pages():
    print("--- 🌐 Synchronizing for GitHub Pages Root Hosting ---")

    # 1. Copy dist/assets to ./assets in root
    if os.path.isdir(DIST_ASSETS_DIR):
        if os.path.exists(ROOT_ASSETS_DIR):
            shutil.rmtree(ROOT_ASSETS_DIR)
        shutil.copytree(DIST_ASSETS_DIR, ROOT_ASSETS_DIR)
        asset_count = len(os.listdir(ROOT_ASSETS_DIR))
        print(f"✅ Copied {asset_count} asset files to root /assets/")

    # 2. Copy dist/index.html to root /index.html
    dist_index = os.path.join(DIST_DIR, 'index.html')
    root_index = os.path.join(ROOT_DIR, 'index.html')
    if os.path.isfile(dist_index):
        shutil.copyfile(dist_index, root_index)
        print("✅ Updated root /index.html with production bundle and OneSignal SDK")

    # 3. Ensure OneSignalSDKWorker.js is in root
    onesignal_worker_content = 'importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");\n'
    root_worker = os.path.join(ROOT_DIR, 'OneSignalSDKWorker.js')
    with open(root_worker, 'w', encoding='utf-8') as f:
        f.write(onesignal_worker_content)
    print("✅ Verified /OneSignalSDKWorker.js in root")

    # 4. Copy manifest and version to root
    for fname in ['manifest.json', 'version.json', 'firebase-messaging-sw.js']:
        src = os.path.join(ROOT_DIR, 'public', fname)
        dst = os.path.join(ROOT_DIR, fname)
        if os.path.isfile(src) and not os.path.isfile(dst):
            shutil.copyfile(src, dst)

    # 5. Copy apk to root
    src_apk = os.path.join(ROOT_DIR, 'public', 'YuvaShaktiGroup.apk')
    dst_apk = os.path.join(ROOT_DIR, 'YuvaShaktiGroup.apk')
    if os.path.isfile(src_apk):
        shutil.copyfile(src_apk, dst_apk)
        print(f"✅ Copied YuvaShaktiGroup.apk to root ({os.path.getsize(dst_apk) // 1024} KB)")

    print("--- 🚀 GitHub Pages Root Synchronization Completed Successfully ---")

if __name__ == '__main__':
    sync_gh_pages()
