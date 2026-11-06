import React, { useState } from 'react';
import { QrCode, Zap, Copy, Check, ShieldCheck, Heart, IndianRupee, ArrowRight, ExternalLink, MessageCircle } from 'lucide-react';
import { SANCHALAK_INFO } from '../data/initialData';

interface ContributionsViewProps {
  onOpenLedgerEntry: () => void;
}

export const ContributionsView: React.FC<ContributionsViewProps> = ({ onOpenLedgerEntry }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [note, setNote] = useState<string>('अमावस्या अंशदान');
  const [copiedUPI, setCopiedUPI] = useState(false);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || selectedAmount : selectedAmount;

  const upiId = SANCHALAK_INFO.upiId; // 7850983600@ibl
  const payeeName = SANCHALAK_INFO.upiName; // Yuva Shakti Bhati Parivar
  const upiNote = `${note} - कुचेरा`;

  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
  const phonepeLink = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
  
  // Real dynamic QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}&margin=10`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handlePhonePeClick = () => {
    window.location.href = phonepeLink;
    setTimeout(() => {
      window.location.href = upiLink;
    }, 500);
  };

  const handleSendPaymentConfirmationToSanchalak = () => {
    const text = `🚩 *युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा)* 🚩\n\nआदरणीय संचालक रेवंतराम जी,\nमैंने PhonePe / UPI द्वारा ₹${effectiveAmount} की सहयोग राशि भेज दी है।\n\n📝 *विवरण:* ${note}\n💳 *UPI ID:* ${upiId}\n📅 *दिनांक:* ${new Date().toLocaleDateString('hi-IN')}\n\nकृपया इसे ग्रुप बही-खाता में दर्ज करके रसीद जारी करने की कृपा करें।`;
    window.open(`https://wa.me/91${SANCHALAK_INFO.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="px-3 pb-8 space-y-3">
      {/* Hero Banner */}
      <div className="relative rounded-3xl p-4 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-lg border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-extrabold text-base">PhonePe / UPI अंशदान</h3>
          </div>
          <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
            {SANCHALAK_INFO.upiName}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा) के मासिक अमावस्या अंशदान, गो-सेवा एवं आपातकालीन कोष में सुरक्षित डिजिटल भुगतान।
        </p>
      </div>

      {/* Preset Amount Chips */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs space-y-2">
        <label className="block text-xs font-bold text-slate-800">
          अंशदान राशि चुनें (Select Amount):
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[50, 100, 200, 500, 1100, 2100].map((amt) => (
            <button
              key={amt}
              onClick={() => {
                setSelectedAmount(amt);
                setCustomAmount('');
              }}
              className={`py-2 px-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-0.5 ${
                selectedAmount === amt && !customAmount
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-500'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>₹{amt}</span>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mt-2 mb-1">
            विवरण / टिप्पणी (Note):
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Direct App Launch Buttons */}
      <div className="space-y-2">
        {/* PhonePe Launch Button */}
        <button
          onClick={handlePhonePeClick}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>📱 सीधे PhonePe में ₹{effectiveAmount} भुगतान करें</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Any UPI App Button */}
        <a
          href={upiLink}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition"
        >
          <span>अन्य UPI ऐप्स (GPay / Paytm / BHIM) से भुगतान</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      {/* Dynamic QR Code Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs text-center space-y-2">
        <p className="text-xs font-bold text-slate-700">
          किसी भी UPI ऐप से स्कैन करके ₹{effectiveAmount} का भुगतान करें
        </p>

        <div className="inline-block p-3 bg-white rounded-2xl border-2 border-slate-900/10 shadow-inner">
          <img
            src={qrCodeUrl}
            alt="UPI QR Code"
            className="w-44 h-44 object-contain mx-auto"
          />
        </div>

        {/* UPI ID copy */}
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs max-w-xs mx-auto">
          <div>
            <p className="text-[10px] text-slate-400 text-left">ग्रुप की UPI ID:</p>
            <span className="font-mono text-slate-800 font-bold">{upiId}</span>
          </div>
          <button
            onClick={copyUpiId}
            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1 active:scale-95 transition cursor-pointer"
          >
            {copiedUPI ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedUPI ? 'कॉपी हुआ' : 'कॉपी करें'}</span>
          </button>
        </div>
      </div>

      {/* Post Payment Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={handleSendPaymentConfirmationToSanchalak}
          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>भुगतान के बाद व्हाट्सएप पर सूचना भेजें</span>
        </button>

        <button
          onClick={onOpenLedgerEntry}
          className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
        >
          <span>बही-खाते में अंशदान दर्ज करें</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Sanchalak Details */}
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-slate-600 text-xs">
        <p className="font-bold text-slate-800">संचालक विवरण:</p>
        <p className="text-[11px] mt-0.5">
          {SANCHALAK_INFO.name} ({SANCHALAK_INFO.role}) • संपर्क: {SANCHALAK_INFO.phone}
        </p>
        <p className="text-[11px]">खाता: {SANCHALAK_INFO.upiName} ({SANCHALAK_INFO.upiId})</p>
      </div>
    </div>
  );
};
