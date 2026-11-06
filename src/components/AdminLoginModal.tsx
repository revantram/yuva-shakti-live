import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, AlertCircle, Send, BellRing, Sparkles, User, Phone, Check } from 'lucide-react';
import { SANCHALAK_INFO } from '../data/initialData';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogin: (pin: string) => boolean;
  onLogout: () => void;
  onSendSuvicharBroadcast: () => void;
  onSendDuesBroadcast: () => void;
  onSendMeetingBroadcast?: () => void;
  onSendAncestorBroadcast?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLogin,
  onLogout,
  onSendSuvicharBroadcast,
  onSendDuesBroadcast,
  onSendMeetingBroadcast,
  onSendAncestorBroadcast,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(pin)) {
      setPin('');
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleSuvicharClick = () => {
    onSendSuvicharBroadcast();
    setTriggerStatus('सुविचार सूचना सभी टोकन्स पर सफलतापूर्वक भेज दी गई! 🚩');
    setTimeout(() => setTriggerStatus(null), 3000);
  };

  const handleDuesClick = () => {
    onSendDuesBroadcast();
    setTriggerStatus('बकायादार रिमाइंडर सूचना सफलतापूर्वक भेज दी गई! ⏰');
    setTimeout(() => setTriggerStatus(null), 3000);
  };

  const handleMeetingClick = () => {
    if (onSendMeetingBroadcast) onSendMeetingBroadcast();
    setTriggerStatus('अमावस्या बैठक सूचना (शाम 6:00 PM) सभी को भेज दी गई! 🌙');
    setTimeout(() => setTriggerStatus(null), 3000);
  };

  const handleAncestorClick = () => {
    if (onSendAncestorBroadcast) onSendAncestorBroadcast();
    setTriggerStatus('पूर्वज पुण्य-तिथि श्रद्धांजलि अलर्ट भेज दिया गया! 🙏');
    setTimeout(() => setTriggerStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Mobile Swipe / Dismiss Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden cursor-pointer" onClick={onClose} />

        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-amber-400 flex items-center justify-center text-xl shadow-md mb-3">
          <KeyRound className="w-7 h-7" />
        </div>

        <h3 className="text-base font-extrabold text-slate-900 text-center">
          {isAdmin ? 'संचालक नियंत्रण (Admin Settings)' : 'संचालक मोड अनलॉक करें (Admin Login)'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4 text-center">
          {isAdmin
            ? `संचालक ${SANCHALAK_INFO.name} (${SANCHALAK_INFO.phone}) के रूप में पूर्ण एडमिन शक्तियों के साथ सक्रिय हैं।`
            : `संचालक ${SANCHALAK_INFO.name} अपने 6-अंकीय गुप्त कोड (${SANCHALAK_INFO.pin}) से एडमिन शक्तियां सक्षम करें।`}
        </p>

        {isAdmin ? (
          <div className="space-y-3">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>संचालक अधिकार सक्रिय हैं ✅</span>
              </div>
              <p className="text-[11px] text-rose-600">
                संचालक: {SANCHALAK_INFO.name} • ईमेल: {SANCHALAK_INFO.email}
              </p>
            </div>

            {/* Manual Trigger Buttons (Item 2 in requirements) */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-blue-600" />
                <span>मैन्युअल सूचना ट्रिगर (Manual Push Broadcast)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                तत्काल सभी पंजीकृत सदस्यों को एफसीएम / व्हाट्सएप सूचना भेजें:
              </p>

              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleSuvicharClick}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>क) आज का सुविचार सभी को भेजें (Send Daily Suvichar)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDuesClick}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-700 hover:from-rose-700 hover:to-indigo-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ख) बकायादारों को रिमाइंडर भेजें (Send Due Reminders)</span>
                </button>

                <button
                  type="button"
                  onClick={handleMeetingClick}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-700 hover:from-blue-700 hover:to-sky-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition cursor-pointer"
                >
                  <BellRing className="w-4 h-4" />
                  <span>ग) कल अमावस्या बैठक सूचना भेजें (शाम 6:00 PM अलर्ट)</span>
                </button>

                <button
                  type="button"
                  onClick={handleAncestorClick}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-800 to-stone-900 hover:from-amber-900 hover:to-black text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-amber-300" />
                  <span>घ) पूर्वज पुण्य-तिथि श्रद्धांजलि अलर्ट भेजें (Tribute Alert)</span>
                </button>
              </div>

              {triggerStatus && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold text-center flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{triggerStatus}</span>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md active:scale-95 transition cursor-pointer"
              >
                संचालक मोड से बाहर निकलें (Exit Admin)
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="6-अंकीय गुप्त कोड (उदा. 869666)"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                className="w-full pl-9 pr-3 py-2 text-center text-sm font-black tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-rose-600 text-[11px] font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>गलत पिन! कृपया 869666 या 1234 दर्ज करें।</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md active:scale-95 transition cursor-pointer"
              >
                अनलॉक करें
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
