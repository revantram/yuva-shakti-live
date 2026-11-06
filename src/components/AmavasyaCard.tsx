import React, { useEffect, useState } from 'react';
import { Moon, Calendar, Zap, ArrowRight, HeartHandshake, ShieldCheck, Wallet } from 'lucide-react';
import { getNextAmavasyaCountdown } from '../utils/amavasya';
import { AmavasyaCountdown } from '../types';
import { SANCHALAK_INFO } from '../data/initialData';

interface AmavasyaCardProps {
  onQuickPay: () => void;
  onOpenLedgerEntry: () => void;
}

export const AmavasyaCard: React.FC<AmavasyaCardProps> = ({ onQuickPay, onOpenLedgerEntry }) => {
  const [countdown, setCountdown] = useState<AmavasyaCountdown>(getNextAmavasyaCountdown());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getNextAmavasyaCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-2.5 mb-3 space-y-2.5">
      {/* 1. Safe Fund Status Pill */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 border border-emerald-400/30 rounded-2xl p-3 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">
              उपलब्ध कुल कोष • सुरक्षित कोष शेष
            </p>
            <p className="text-lg font-black text-white leading-tight">
              ₹1,963 <span className="text-xs font-semibold text-emerald-300">बचत कोष</span>
            </p>
          </div>
        </div>

        <button
          onClick={onQuickPay}
          className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-md active:scale-95 transition cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span>PhonePe अंशदान</span>
        </button>
      </div>

      {/* 2. Amavasya Live Countdown Card */}
      <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/98 to-indigo-950/95 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-900/20 text-white overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            <h2 className="text-sm font-extrabold tracking-tight text-slate-100">
              आगामी अमावस्या • सत्संग व अंशदान दिवस
            </h2>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/35 text-[10px] font-bold text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>{countdown.isToday ? 'आज अमावस्या है!' : countdown.dateStr}</span>
          </div>
        </div>

        {/* Countdown Grid (4 Boxes) */}
        <div className="grid grid-cols-4 gap-2 my-2">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl py-2 px-1 text-center shadow-inner">
            <div className="text-xl font-extrabold text-amber-300 font-mono leading-none">
              {String(countdown.days).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-1">
              दिन
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl py-2 px-1 text-center shadow-inner">
            <div className="text-xl font-extrabold text-amber-300 font-mono leading-none">
              {String(countdown.hours).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-1">
              घंटे
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl py-2 px-1 text-center shadow-inner">
            <div className="text-xl font-extrabold text-amber-300 font-mono leading-none">
              {String(countdown.minutes).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-1">
              मिनट
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl py-2 px-1 text-center shadow-inner">
            <div className="text-xl font-extrabold text-amber-300 font-mono leading-none">
              {String(countdown.seconds).padStart(2, '0')}
            </div>
            <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-1">
              सेकंड
            </div>
          </div>
        </div>

        {/* Footer Prompt */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[11px] text-slate-300 flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-300" />
            <span>सीधे UPI द्वारा सुरक्षित भुगतान: {SANCHALAK_INFO.upiId}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onQuickPay}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-white/20 hover:from-purple-500 hover:to-indigo-500 transition shadow-md flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>PhonePe / GPay</span>
            </button>

            <button
              onClick={onOpenLedgerEntry}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:bg-amber-400 transition shadow-md flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span>अंशदान दर्ज करें</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
