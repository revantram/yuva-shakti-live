import React from 'react';
import { Sparkles, ArrowRight, X, Download } from 'lucide-react';
import { UpdateCheckResult } from '../utils/updateManager';

interface UpdateBannerProps {
  updateInfo: UpdateCheckResult | null;
  onOpenUpdateModal: () => void;
  onDismiss: () => void;
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({
  updateInfo,
  onOpenUpdateModal,
  onDismiss,
}) => {
  if (!updateInfo || !updateInfo.hasUpdate) return null;

  return (
    <div className="mx-2.5 mb-2.5 animate-slide-down">
      <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-lg shadow-emerald-700/20 border border-emerald-400/40 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 cursor-pointer" onClick={onOpenUpdateModal}>
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full">
                नया अपडेट!
              </span>
              <span className="text-xs font-black text-white truncate">
                वर्जन v{updateInfo.latestVersion} उपलब्ध है
              </span>
            </div>
            <p className="text-[10px] text-emerald-100 truncate">
              {updateInfo.releaseNotes?.split('\n')[0] || 'नवीनतम सुधार एवं बही-खाता अपडेट'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onOpenUpdateModal}
            className="px-2.5 py-1 rounded-xl bg-white text-emerald-900 font-extrabold text-[11px] shadow-sm hover:bg-emerald-50 active:scale-95 transition flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3 h-3 text-emerald-700" />
            <span>अपडेट करें</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="छुपाएं"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
