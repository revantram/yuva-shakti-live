import React, { useState } from 'react';
import { Megaphone, Edit2, X, BellRing, Sparkles, Check } from 'lucide-react';

interface NoticeBoardProps {
  isAdmin: boolean;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ isAdmin }) => {
  const defaultNotice =
    'विशेष सूचना: कल सायं 7:00 बजे भाटी परिवार बैठक रखी गई है, सभी सदस्य सादर आमंत्रित हैं।';

  const [notice, setNotice] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ysg_parivar_notice');
      return saved !== null ? saved : defaultNotice;
    } catch {
      return defaultNotice;
    }
  });

  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>(notice);

  const presets = [
    'विशेष सूचना: कल सायं 7:00 बजे भाटी परिवार बैठक रखी गई है, सभी सदस्य सादर आमंत्रित हैं।',
    'अमावस्या स्मरण: कल पावन अमावस्या है। सभी सदस्य समय पर अपनी मासिक पूंजी (₹50) PhonePe/UPI (7850983600@ibl) से जमा कराएं।',
    'जय श्री राम: आज शाम श्री रामदेव जी महाराज सत्संग एवं आरती का आयोजन रखा गया है।',
    'खुशखबरी: युवा शक्ति ग्रुप कोष में इस माह सभी सदस्यों का अंशदान 100% पूर्ण हो चुका है।',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(inputVal.trim());
    try {
      localStorage.setItem('ysg_parivar_notice', inputVal.trim());
    } catch {}
    setIsEditModalOpen(false);
    setIsDismissed(false);
  };

  if (!notice || isDismissed) {
    if (isAdmin && isDismissed) {
      return (
        <div className="mx-2.5 mb-1.5 flex justify-end">
          <button
            onClick={() => setIsDismissed(false)}
            className="text-[10px] font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Megaphone className="w-3 h-3 text-amber-600" />
            <span>सूचना पट्टी दिखाएं</span>
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      <div className="mx-2.5 mb-2 animate-slide-down select-none">
        <div className="relative rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-2.5 shadow-md shadow-amber-600/20 border border-amber-300/40 flex items-center justify-between gap-2 overflow-hidden">
          {/* Left Icon with subtle pulsing glow */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 text-white shadow-xs">
              <Megaphone className="w-3.5 h-3.5 animate-bounce-short" />
            </div>

            <div className="min-w-0 overflow-hidden flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-black uppercase tracking-wider bg-white text-amber-950 px-1.5 py-0.2 rounded-md shrink-0 shadow-xs">
                  सूचना
                </span>
                <p className="text-xs font-bold text-amber-50 truncate leading-snug">
                  {notice}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setInputVal(notice);
                  setIsEditModalOpen(true);
                }}
                className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                title="सूचना बदलें (संचालक)"
              >
                <Edit2 className="w-3 h-3 text-amber-100" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-amber-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="छुपाएं"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sanchalak Notice Edit Bottom Sheet Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Sheet Handle for Mobile Drag */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <h3 className="font-black text-sm text-slate-900">
                  परिवार मुख्य सूचना पट्टी अपडेट करें
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  सूचना संदेश (यह हेडर के ठीक नीचे सभी को दिखेगा):
                </label>
                <textarea
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <p className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wider">
                  तैयार सूचनाएं (टैप करके चुनें):
                </p>
                {presets.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInputVal(p)}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-[11px] font-semibold text-slate-700 border border-slate-100 transition cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition cursor-pointer"
                >
                  सूचना प्रकाशित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
