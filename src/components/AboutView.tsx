import React, { useState } from 'react';
import { MessageCircle, Download, Share2, MapPin, Phone, Users, Shield, Award, Check, Database, Smartphone, Mail } from 'lucide-react';
import { SANCHALAK_INFO } from '../data/initialData';
import { downloadApkDirectly, shareApkViaShareSheet, GITHUB_WORKING_APK_URL, LOCAL_APK_URL } from '../utils/apkDownloader';

export const AboutView: React.FC = () => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const whatsappGroupLink = 'https://chat.whatsapp.com/JOVKSohSoBHEokrCXOSkTh';
  const serverApkLink = LOCAL_APK_URL;
  const githubApkLink = GITHUB_WORKING_APK_URL;

  const shareText = `🚩 *युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा)* 🚩\n\nआधिकारिक परिवार प्रबंधन एवं बही-खाता एप्लिकेशन (नवीनतम APK v4.5.9)।\n\n📲 *सीधा APK डाउनलोड लिंक:*\n${githubApkLink}\n\n💬 *व्हाट्सएप ग्रुप लिंक:*\n${whatsappGroupLink}\n\nपरिवार की एकता, पारदर्शिता एवं सेवा कार्यों में सहभागी बनें।`;

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'युवा शक्ति ग्रुप ऐप APK (कुचेरा)',
        text: shareText,
        url: githubApkLink,
      }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleShareApkFile = async () => {
    await shareApkViaShareSheet((status, msg) => {
      if (msg) {
        setDownloadMsg(msg);
        setTimeout(() => setDownloadMsg(null), 4000);
      }
    });
  };

  const handleDirectApkDownload = async () => {
    await downloadApkDirectly((status, msg) => {
      if (msg) {
        setDownloadMsg(msg);
        setTimeout(() => setDownloadMsg(null), 4000);
      }
    });
  };

  return (
    <div className="px-3 pb-8 space-y-3">
      {/* Hero Group Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-white/10 text-center relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-3xl shadow-lg border-2 border-white/30 mb-3">
          🚩
        </div>
        <h2 className="text-xl font-black text-amber-300">युवा शक्ति ग्रुप</h2>
        <p className="text-xs font-bold text-slate-300 mt-0.5">
          भाटी परिवार • कुचेरा (नागौर, राजस्थान)
        </p>
        <p className="text-[11px] text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          "संगठन में ही शक्ति है, सेवा में ही सुख है।" परिवार के सर्वांगीण विकास, पारदर्शिता और पारस्परिक सहयोग को समर्पित आधिकारिक मंच।
        </p>

        {downloadMsg && (
          <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 text-xs font-bold animate-pulse">
            {downloadMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={handleShareApkFile}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>व्हाट्सएप पर APK फाइल भेजें</span>
          </button>

          <a
            href={githubApkLink}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
          >
            <Download className="w-4 h-4" />
            <span>APK v4.5.9 डाउनलोड (GitHub)</span>
          </a>
        </div>
      </div>

      {/* Developer Options & APK Version Card (As from user's brief) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <h4 className="font-extrabold text-slate-900">डेवलपर ऑप्शन एवं अपडेट</h4>
          </div>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
            APK {SANCHALAK_INFO.appVersion}
          </span>
        </div>

        <div className="space-y-2 text-slate-700">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">मुख्य डेवलपर व संचालक:</p>
              <p className="text-[11px] text-slate-500">{SANCHALAK_INFO.name}</p>
            </div>
            <a
              href={`tel:${SANCHALAK_INFO.phone}`}
              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>कॉल करें</span>
            </a>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">डेवलपर ईमेल (Gmail):</p>
              <p className="text-[11px] text-slate-500">{SANCHALAK_INFO.email}</p>
            </div>
            <a
              href={`mailto:${SANCHALAK_INFO.email}`}
              className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              <span>ईमेल</span>
            </a>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">डेवलपर मोबाइल नंबर:</p>
              <p className="text-[11px] text-slate-500">+91 {SANCHALAK_INFO.phone}</p>
            </div>
            <a
              href={`https://wa.me/91${SANCHALAK_INFO.phone}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span>व्हाट्सएप</span>
            </a>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-blue-900">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-bold">स्वचालित इन-ऐप अपडेट इंजन:</p>
                <p className="text-[11px] text-blue-700">🟢 GitHub Release Sync सक्रिय (Auto-Update Enabled)</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
              सक्रिय
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="font-bold">क्लाउड डेटाबेस स्थिति:</p>
                <p className="text-[11px] text-emerald-700">🟢 Firebase Firestore कनेक्टेड</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
              सक्रिय
            </span>
          </div>
        </div>
      </div>

      {/* Share with Family Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
        <div>
          <h4 className="font-extrabold text-slate-900 text-xs">
            ऐप शेयर करें (APK Send)
          </h4>
          <p className="text-[11px] text-slate-500">
            व्हाट्सएप पर सीधी ऐप (APK फाइल) व लिंक भेजें।
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleShareApp}
            className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>APK शेयर</span>
          </button>
          <button
            onClick={handleCopyShare}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="लिंक कॉपी करें"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Award className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Core Objectives */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>स्वागत संदेश, पारिवारिक एकता व सहयोग नियम</span>
        </h3>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <h5 className="font-bold text-slate-800">1. पारिवारिक एकता एवं जुड़ाव</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              भाटी परिवार कुचेरा के सभी बंधुओं और युवा पीढ़ी को एक मजबूत सूत्र में पिरोना ताकि दूर रहकर भी आपस में जुड़ाव बना रहे।
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <h5 className="font-bold text-slate-800">2. मासिक अंशदान व पारदर्शी हिसाब</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              हर अमावस्या पर स्वेच्छा से जमा होने वाले अंशदान का 100% पारदर्शी डिजिटल रिकॉर्ड, जिसमें कोई भी सदस्य कभी भी अपनी व पूरे ग्रुप की पासबुक देख सकता है।
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <h5 className="font-bold text-slate-800">3. संकट में पारस्परिक संबल</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              परिवार के किसी भी सदस्य को आकस्मिक आवश्यकता, स्वास्थ्य या सामाजिक कार्य में ग्रुप के सामूहिक कोष से त्वरित सहयोग प्रदान करना।
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <h5 className="font-bold text-slate-800">4. उत्सव, पर्व व वैदिक पंचांग</h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              परिवार के सदस्यों के जन्मदिन, वैवाहिक वर्षगांठ और हिंदू वैदिक त्योहारों पर खुशियां बांटना और परस्पर बधाई देना।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
