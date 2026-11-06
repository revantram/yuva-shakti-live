import React from 'react';
import { ShieldCheck, ShieldAlert, Download, Share2, Bell } from 'lucide-react';
import { SANCHALAK_INFO } from '../data/initialData';

interface HeaderProps {
  isAdmin: boolean;
  onAdminClick: () => void;
  onUpdateClick: () => void;
  onShareClick?: () => void;
  onNotificationClick?: () => void;
  hasUpdate?: boolean;
  isCompact?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onAdminClick,
  onUpdateClick,
  onShareClick,
  onNotificationClick,
  hasUpdate = false,
  isCompact = false,
}) => {
  return (
    <header
      className={`sticky top-1 z-50 mx-2.5 my-1.5 px-3 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/20 shadow-xl text-white flex items-center justify-between transition-all duration-200 ${
        isCompact ? 'py-1.5 backdrop-blur-2xl bg-opacity-95' : 'py-2.5 backdrop-blur-xl'
      }`}
    >
      {/* Brand Logo & Info matching Screenshot */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-700 to-indigo-900 border-2 border-amber-400/80 flex items-center justify-center shadow-md shadow-amber-500/20 text-lg font-bold shrink-0">
          🪔
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight truncate">
            युवा शक्ति ग्रुप
          </h1>
          <p className="text-[11px] font-extrabold text-amber-300 tracking-wide flex items-center gap-1 leading-tight truncate">
            <span>भाटी परिवार कुचेरा</span>
          </p>
          <p className="text-[10px] font-extrabold text-sky-400 leading-tight">
            ({SANCHALAK_INFO.name})
          </p>
        </div>
      </div>

      {/* Header Actions matching Screenshot: Share, Bell (9), Update, Admin */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Share Button */}
        <button
          onClick={onShareClick}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
          title="ऐप शेयर करें"
        >
          <Share2 className="w-4 h-4 text-slate-200" />
        </button>

        {/* Bell Notification Button with 9 badge */}
        <button
          onClick={onNotificationClick}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer relative"
          title="सूचनाएं एवं अलर्ट्स"
        >
          <Bell className="w-4 h-4 text-amber-300" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
            9
          </span>
        </button>

        {/* Version / Update button */}
        <button
          onClick={onUpdateClick}
          className={`px-2 py-1 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer active:scale-95 relative ${
            hasUpdate
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40 animate-pulse'
              : 'bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30'
          }`}
          title={hasUpdate ? '🎉 नया अपडेट उपलब्ध है!' : 'APK डाउनलोड व अपडेट'}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{hasUpdate ? 'अपडेट!' : 'v4.5.9'}</span>
        </button>

        {/* Admin Login / Logout */}
        <button
          onClick={onAdminClick}
          className={`px-2 py-1 rounded-xl text-xs font-extrabold border transition flex items-center gap-1 cursor-pointer active:scale-95 ${
            isAdmin
              ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
              : 'bg-white/15 hover:bg-white/25 text-white border-white/25'
          }`}
          title={isAdmin ? 'संचालक मोड सक्रिय है' : 'संचालक लॉगिन करें'}
        >
          {isAdmin ? (
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-slate-300" />
          )}
        </button>
      </div>
    </header>
  );
};
