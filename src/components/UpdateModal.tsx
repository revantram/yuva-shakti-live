import React, { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle,
  ExternalLink,
  Smartphone,
  Database,
  Loader2,
  AlertCircle,
  Share2,
  FolderDown,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  GitBranch,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import {
  checkForUpdates,
  executeAutoUpdate,
  CURRENT_APP_VERSION,
  getSavedGitHubRepo,
  saveGitHubRepo,
  isRunningInAndroidApp,
  UpdateCheckResult,
} from '../utils/updateManager';
import {
  shareApkViaShareSheet,
  fetchApkBlob,
  isInsideIframe,
  LOCAL_APK_URL,
  APK_FILENAME,
} from '../utils/apkDownloader';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, isAdmin = false }) => {
  const [checking, setChecking] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showDevGuide, setShowDevGuide] = useState<boolean>(false);
  const [repoInput, setRepoInput] = useState<string>(getSavedGitHubRepo());
  const [repoSavedSuccess, setRepoSavedSuccess] = useState<boolean>(false);

  const inIframe = isInsideIframe();
  const inNativeApp = isRunningInAndroidApp();

  // Run update check when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    (async () => {
      setChecking(true);
      try {
        const info = await checkForUpdates();
        if (active) {
          setUpdateInfo(info);
        }
      } catch (err) {
        console.warn('Update check error:', err);
      } finally {
        if (active) setChecking(false);
      }

      // Pre-load local blob
      try {
        const blob = await fetchApkBlob();
        if (blob && active) {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
        }
      } catch {}
    })();

    return () => {
      active = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualCheck = async () => {
    setChecking(true);
    setDownloadStatus('idle');
    try {
      const info = await checkForUpdates(repoInput);
      setUpdateInfo(info);
      if (info.hasUpdate) {
        setStatusMessage(`नया अपडेट v${info.latestVersion} मिल गया! नीचे दिए गए बटन से इंस्टॉल करें।`);
        setDownloadStatus('success');
      } else {
        setStatusMessage(`आप पहले से नवीनतम वर्जन (v${CURRENT_APP_VERSION}) पर हैं! ✅`);
        setDownloadStatus('success');
      }
    } catch {
      setStatusMessage('अपडेट जांचने में समस्या आई, कृपया इंटरनेट कनेक्शन जांचें।');
      setDownloadStatus('error');
    } finally {
      setChecking(false);
    }
  };

  const handleTriggerAutoInstall = async () => {
    const targetUrl = updateInfo?.downloadUrl || `https://github.com/${getSavedGitHubRepo()}/releases/latest/download/YuvaShaktiGroup.apk`;
    const targetVer = updateInfo?.latestVersion || CURRENT_APP_VERSION;

    await executeAutoUpdate(targetUrl, targetVer, (status, msg) => {
      setDownloadStatus(status);
      setStatusMessage(msg);
    });
  };

  const handleShareApk = async () => {
    await shareApkViaShareSheet((status, msg) => {
      setDownloadStatus(status);
      if (msg) setStatusMessage(msg);
    });
  };

  const handleSaveRepo = () => {
    if (repoInput.trim()) {
      saveGitHubRepo(repoInput.trim());
      setRepoSavedSuccess(true);
      setTimeout(() => setRepoSavedSuccess(false), 2500);
      handleManualCheck();
    }
  };

  const handleDownloadBackup = () => {
    const members = localStorage.getItem('ysg_members_v2') || '[]';
    const tx = localStorage.getItem('ysg_transactions') || '[]';
    const visarjan = localStorage.getItem('ysg_visarjan_items') || '[]';
    const data = {
      app: 'युवा शक्ति ग्रुप - कुचेरा',
      version: `v${CURRENT_APP_VERSION}`,
      exportedAt: new Date().toISOString(),
      members: JSON.parse(members),
      transactions: JSON.parse(tx),
      visarjan: JSON.parse(visarjan),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Yuva_Shakti_Backup_v${CURRENT_APP_VERSION}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const directApkUrl = updateInfo?.downloadUrl || `https://github.com/${getSavedGitHubRepo()}/releases/latest/download/YuvaShaktiGroup.apk`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center p-5 max-h-[94vh] overflow-y-auto animate-slide-up">
        {/* Mobile Swipe / Dismiss Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden cursor-pointer" onClick={onClose} />

        {/* App Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 mb-2 relative">
          <Smartphone className="w-7 h-7" />
          {updateInfo?.hasUpdate && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
          )}
        </div>

        {/* Current & Latest Version Badges */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200">
            स्थापित: v{CURRENT_APP_VERSION}
          </span>
          {updateInfo?.hasUpdate ? (
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 animate-pulse">
              🎉 नया उपलब्ध: v{updateInfo.latestVersion}
            </span>
          ) : (
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
              नवीनतम वर्जन चालू
            </span>
          )}
        </div>

        <h3 className="text-base font-black text-slate-900 mt-2">
          {updateInfo?.hasUpdate ? 'नया ऐप अपडेट तैयार है!' : 'युवा शक्ति ग्रुप APK व अपडेट'}
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5 mb-3 leading-snug">
          {inNativeApp
            ? '📲 आप एंड्रॉयड मोबाइल ऐप के अंदर हैं। 1-क्लिक में सीधा नया अपडेट इंस्टॉल करें।'
            : 'कुचेरा भाटी परिवार का आधिकारिक Android ऐप व नवीनतम अपडेट:'}
        </p>

        {/* Status indicator */}
        {downloadStatus === 'loading' && (
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl mb-3 flex items-center justify-center gap-2 text-blue-700 text-xs font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {downloadStatus === 'success' && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl mb-3 flex items-center justify-center gap-1.5 text-emerald-800 text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-left">{statusMessage}</span>
          </div>
        )}

        {downloadStatus === 'error' && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl mb-3 flex items-center justify-center gap-1.5 text-rose-800 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-left">{statusMessage}</span>
          </div>
        )}

        {/* Release Notes Box (if available) */}
        {updateInfo?.releaseNotes && (
          <div className="mb-3 text-left p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-950">
            <p className="font-extrabold text-amber-900 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>इस अपडेट में क्या नया है:</span>
            </p>
            <div className="whitespace-pre-line text-slate-700 leading-relaxed text-[11px]">
              {updateInfo.releaseNotes}
            </div>
          </div>
        )}

        {/* Action Download & Update Buttons */}
        <div className="space-y-2 mb-3">
          {/* PRIMARY BUTTON 1: Seamless In-App Direct Update / Install */}
          <button
            type="button"
            onClick={handleTriggerAutoInstall}
            className={`w-full py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition cursor-pointer ${
              updateInfo?.hasUpdate
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white animate-bounce-short'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
            }`}
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>
              {updateInfo?.hasUpdate
                ? `⚡ तुरंत नया अपडेट इंस्टॉल करें (v${updateInfo.latestVersion})`
                : inNativeApp
                ? '🔄 ऐप को पुनः रिफ्रेश व अपडेट करें'
                : '📲 सीधा APK फोन में डाउनलोड करें (1-क्लिक)'}
            </span>
          </button>

          {/* BUTTON 2: Manual Check for Updates */}
          <button
            type="button"
            onClick={handleManualCheck}
            disabled={checking}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'GitHub पर जांच हो रही है...' : '🔍 नया अपडेट चेक करें (GitHub Live)'}</span>
          </button>

          {/* BUTTON 3: WhatsApp 1-Tap Share Sheet */}
          <button
            type="button"
            onClick={handleShareApk}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>🟢 व्हाट्सएप पर APK फाइल भेजें (1-टैप शेयर)</span>
          </button>

          {/* BUTTON 4: GitHub Direct Download */}
          <a
            href={directApkUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
            <span>🌐 GitHub Release से सीधा APK डाउनलोड</span>
          </a>

          {/* Copy Direct Link */}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(directApkUrl);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2500);
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
            <span>{copiedLink ? 'लिंक कॉपी हो गया! ✅' : '📋 डाउनलोड लिंक कॉपी करें (Direct URL)'}</span>
          </button>

          {/* If inside iframe: Open in full tab button */}
          {inIframe && (
            <button
              type="button"
              onClick={() => window.open(window.location.href, '_blank')}
              className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>🚀 पूरे ब्राउज़र (Chrome) टैब में खोलें</span>
            </button>
          )}

          {/* Backup JSON */}
          <button
            onClick={handleDownloadBackup}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>परिवार डेटा बैकअप (.json) सुरक्षित करें</span>
          </button>
        </div>

        {/* Sanchalak Developer Section: GitHub Push & Auto-Update Guide */}
        <div className="pt-2 border-t border-slate-100 text-left">
          <button
            type="button"
            onClick={() => setShowDevGuide(!showDevGuide)}
            className="w-full py-1 text-slate-600 hover:text-slate-900 text-[11px] font-bold flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1 text-blue-700">
              <GitBranch className="w-3.5 h-3.5" />
              <span>संचालक निर्देश: GitHub पर नया अपडेट कैसे डालें?</span>
            </span>
            <span className="text-xs">{showDevGuide ? '▲' : '▼'}</span>
          </button>

          {showDevGuide && (
            <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-2xl text-[11px] space-y-2.5 animate-fade-in font-mono">
              <div className="flex items-center justify-between font-sans pb-1.5 border-b border-slate-800">
                <span className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                  <Shield className="w-3.5 h-3.5" />
                  GitHub Repository:
                </span>
                {repoSavedSuccess && <span className="text-emerald-400 font-bold text-[10px]">सेव हो गया! ✅</span>}
              </div>

              {/* Repo Config Input */}
              <div className="flex gap-1.5 font-sans">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="owner/repo (उदा: revantram/yuva-shakti-app)"
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleSaveRepo}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] shrink-0 cursor-pointer"
                >
                  सेव
                </button>
              </div>

              <p className="text-[10px] text-slate-400 font-sans leading-normal">
                💡 <b>जब भी आप GitHub पर नया कोड पुश करेंगे:</b> GitHub Actions अपने आप नया APK बना देगा और सभी सदस्यों को बिना किसी परेशानी के सीधा ऐप में "नया अपडेट" दिखाई देने लगेगा!
              </p>

              {/* Step-by-step Git commands */}
              <div className="space-y-1.5 text-[10px] bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <p className="text-amber-400 font-bold font-sans">कमांड प्रॉम्प्ट / Git में ये 3 कमांड चलाएं:</p>
                <div className="text-emerald-300">
                  <code>git add .</code>
                </div>
                <div className="text-emerald-300">
                  <code>git commit -m "नया अपडेट v4.6.0"</code>
                </div>
                <div className="text-emerald-300">
                  <code>git push origin main</code>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-sans">
                ✅ पुश होते ही ऐप का <b>In-App Auto-Update Engine</b> एक्टिव होकर सभी सदस्यों के फोन में 1-क्लिक अपडेट शुरू कर देगा।
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
        >
          बंद करें
        </button>
      </div>
    </div>
  );
};
