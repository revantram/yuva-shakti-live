/**
 * Yuva Shakti Group - Complete In-App Auto-Update & GitHub Release Manager
 * 
 * Supports:
 * 1. Automatic GitHub Releases API checking (https://api.github.com/repos/{owner}/{repo}/releases/latest)
 * 2. Raw GitHub version.json fallback (bypasses GitHub API rate-limits)
 * 3. Local /version.json fallback
 * 4. Native Android in-app download and installation trigger via window.AndroidApp.downloadAndInstall
 * 5. Automatic periodic background checks and manual refresh
 * 6. Configurable GitHub repository (default: revantram/yuva-shakti-app)
 */

export const CURRENT_APP_VERSION = '4.5.9';
export const CURRENT_VERSION_CODE = 459;
export const DEFAULT_GITHUB_REPO = 'revantram/yuva-shakti-app';
export const LOCAL_APK_FILENAME = `YuvaShaktiGroup_v${CURRENT_APP_VERSION}.apk`;
export const GITHUB_LATEST_RELEASE_URL = `https://github.com/${DEFAULT_GITHUB_REPO}/releases/latest/download/YuvaShaktiGroup.apk`;

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
  releaseNotes: string;
  releaseDate?: string;
  releaseTitle?: string;
  isMandatory?: boolean;
  source: 'github_release' | 'github_raw' | 'local_fallback';
  error?: string;
}

// Window AndroidApp Bridge Declaration
declare global {
  interface Window {
    AndroidApp?: {
      downloadAndInstall?: (url: string, filename?: string) => void;
      shareAppApk?: () => void;
      shareImage?: (base64Data: string, filename: string) => void;
      printLedgerPdf?: () => void;
      saveLedgerPdf?: (base64Data: string, filename: string) => void;
      openWhatsApp?: (url: string) => void;
      shareText?: (text: string, title?: string) => void;
      postNotification?: (title: string, message: string) => void;
      requestNotificationPermission?: () => void;
      hasNotificationPermission?: () => boolean;
    };
  }
}

/**
 * Check if running inside the native Android WebView container
 */
export function isRunningInAndroidApp(): boolean {
  return typeof window !== 'undefined' && Boolean(window.AndroidApp);
}

/**
 * Get configured GitHub repository slug (e.g. revantram/yuva-shakti-app)
 */
export function getSavedGitHubRepo(): string {
  try {
    return localStorage.getItem('ysg_github_repo') || DEFAULT_GITHUB_REPO;
  } catch {
    return DEFAULT_GITHUB_REPO;
  }
}

/**
 * Set custom GitHub repository slug
 */
export function saveGitHubRepo(repo: string): void {
  try {
    localStorage.setItem('ysg_github_repo', repo.trim());
  } catch {}
}

/**
 * Clean version string (e.g. "v4.6.0" -> "4.6.0")
 */
export function cleanVersion(v: string): string {
  return (v || '').trim().replace(/^[vV]/, '');
}

/**
 * Compare two semver strings: returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareSemver(v1: string, v2: string): number {
  const c1 = cleanVersion(v1).split('.').map((n) => parseInt(n, 10) || 0);
  const c2 = cleanVersion(v2).split('.').map((n) => parseInt(n, 10) || 0);
  const maxLen = Math.max(c1.length, c2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = c1[i] || 0;
    const num2 = c2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Check whether a remote version is newer than current installed version
 */
export function isNewerVersion(remoteVersion: string): boolean {
  return compareSemver(remoteVersion, CURRENT_APP_VERSION) > 0;
}

/**
 * Query GitHub Releases API or raw fallback to check if a new version is available
 */
export async function checkForUpdates(customRepo?: string): Promise<UpdateCheckResult> {
  const repo = (customRepo || getSavedGitHubRepo()).replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');

  // Default fallback result
  const fallbackResult: UpdateCheckResult = {
    hasUpdate: false,
    currentVersion: CURRENT_APP_VERSION,
    latestVersion: CURRENT_APP_VERSION,
    downloadUrl: GITHUB_LATEST_RELEASE_URL,
    releaseNotes: 'आप नवीनतम वर्जन v' + CURRENT_APP_VERSION + ' का उपयोग कर रहे हैं।',
    source: 'local_fallback',
  };

  // 1. First try GitHub Releases API (latest release)
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const tagName = cleanVersion(data.tag_name || data.name || '');
      
      // Find APK asset in the release if attached
      let downloadUrl = '';
      if (Array.isArray(data.assets) && data.assets.length > 0) {
        const apkAsset = data.assets.find(
          (a: any) => (a.name || '').endsWith('.apk') || a.content_type === 'application/vnd.android.package-archive'
        );
        if (apkAsset && apkAsset.browser_download_url) {
          downloadUrl = apkAsset.browser_download_url;
        }
      }

      // If no asset matched, construct standard release download URL
      if (!downloadUrl) {
        downloadUrl = `https://github.com/${repo}/releases/download/v${tagName}/YuvaShaktiGroup.apk`;
      }

      const hasUpdate = isNewerVersion(tagName);
      return {
        hasUpdate,
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: tagName,
        downloadUrl,
        releaseNotes: data.body || '• नवीनतम बही-खाता एवं अमावस्या सुधार\n• स्वचालित अपडेट',
        releaseDate: data.published_at ? new Date(data.published_at).toLocaleDateString('hi-IN') : undefined,
        releaseTitle: data.name || `युवा शक्ति ग्रुप v${tagName}`,
        source: 'github_release',
      };
    }
  } catch (err) {
    console.warn('GitHub Releases API check failed, trying raw version.json:', err);
  }

  // 2. Second try raw GitHub version.json (fast, no API rate limits)
  try {
    const rawUrl = `https://raw.githubusercontent.com/${repo}/main/public/version.json?t=${Date.now()}`;
    const rawRes = await fetch(rawUrl, { cache: 'no-store' });
    if (rawRes.ok) {
      const data = await rawRes.json();
      const remoteVer = cleanVersion(data.version || '');
      const hasUpdate = isNewerVersion(remoteVer);

      return {
        hasUpdate,
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: remoteVer,
        downloadUrl: data.apkUrl || data.latestReleaseUrl || `https://github.com/${repo}/releases/download/v${remoteVer}/YuvaShaktiGroup.apk`,
        releaseNotes: data.releaseNotes || 'नया अपडेट उपलब्ध है।',
        releaseDate: data.releaseDate,
        isMandatory: Boolean(data.mandatory),
        source: 'github_raw',
      };
    }
  } catch (err) {
    console.warn('Raw GitHub version.json check failed, falling back to local:', err);
  }

  // 3. Third try local /version.json
  try {
    const localRes = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (localRes.ok) {
      const data = await localRes.json();
      const localVer = cleanVersion(data.version || '');
      return {
        hasUpdate: isNewerVersion(localVer),
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: localVer,
        downloadUrl: data.apkUrl || `/YuvaShaktiGroup_v${localVer}.apk`,
        releaseNotes: data.releaseNotes || 'नया अपडेट उपलब्ध है।',
        releaseDate: data.releaseDate,
        source: 'local_fallback',
      };
    }
  } catch (err) {
    console.warn('Local version check error:', err);
  }

  return fallbackResult;
}

/**
 * Execute in-app automatic update and installation
 * - Inside Android APK: Triggers window.AndroidApp.downloadAndInstall so system package installer launches
 * - On Web / Chrome: Triggers direct download and fallback share options
 */
export async function executeAutoUpdate(
  apkUrl: string,
  targetVersion: string,
  onStatus?: (status: 'loading' | 'success' | 'error', message: string) => void
): Promise<boolean> {
  const filename = `YuvaShaktiGroup_v${cleanVersion(targetVersion)}.apk`;

  // Case 1: Running inside Android APK shell (Native Bridge)
  if (typeof window !== 'undefined' && window.AndroidApp && typeof window.AndroidApp.downloadAndInstall === 'function') {
    onStatus?.('loading', '📲 एंड्रॉयड सिस्टम में डाउनलोड व इंस्टॉलेशन शुरू हो रहा है...');
    try {
      window.AndroidApp.downloadAndInstall(apkUrl, filename);
      onStatus?.('success', 'डाउनलोड शुरू हो गया! नोटिफिकेशन बार देखें, डाउनलोड पूरा होते ही इंस्टॉल स्क्रीन खुल जाएगी। ✅');
      return true;
    } catch (err: any) {
      console.error('Native install error:', err);
      onStatus?.('error', 'एंड्रॉयड इंस्टॉलर शुरू नहीं हो सका, डायरेक्ट लिंक से डाउनलोड करें।');
    }
  }

  // Case 2: In browser / Web
  onStatus?.('loading', 'नवीनतम APK फाइल डाउनलोड की जा रही है...');
  try {
    const a = document.createElement('a');
    a.href = apkUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
      } catch {}
    }, 1000);
    onStatus?.('success', 'APK डाउनलोड शुरू हो गया! मोबाइल के Downloads फोल्डर में देखें। ✅');
    return true;
  } catch (err) {
    window.open(apkUrl, '_blank');
    onStatus?.('success', 'ब्राउज़र में डाउनलोड लिंक खुल गया! ✅');
    return true;
  }
}
