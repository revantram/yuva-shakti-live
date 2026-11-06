import React, { useRef, useEffect } from 'react';
import { X, Share2, Download, CheckCircle, ShieldCheck, Printer, ArrowDown } from 'lucide-react';
import { DigitalReceiptData } from '../types';

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: DigitalReceiptData | null;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen || !receipt) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 980;
    canvas.width = width;
    canvas.height = height;

    // Background & Outer Frame
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Decorative Borders
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, width - 56, height - 56);

    // Top Header Banner
    const grad = ctx.createLinearGradient(0, 30, width, 180);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(30, 30, width - 60, 160);

    // Header Logo & Text
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 36px "Noto Sans Devanagari", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚩 युवा शक्ति ग्रुप 🚩', width / 2, 85);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('भाटी परिवार • कुचेरा (नागौर, राजस्थान)', width / 2, 125);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '600 16px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('आधिकारिक डिजिटल अंशदान पावती / रसीद कार्ड', width / 2, 160);

    // Receipt Number & Date Box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(50, 215, width - 100, 50);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 215, width - 100, 50);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 16px "Noto Sans Devanagari", sans-serif';
    ctx.fillText(`रसीद संख्या: ${receipt.receiptNo}`, 70, 246);

    ctx.textAlign = 'right';
    ctx.fillText(`दिनांक: ${receipt.dateStr} | ${receipt.timeStr}`, width - 70, 246);

    // Receipt Table Box
    const tableTop = 290;
    const tableHeight = 360;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(50, tableTop, width - 100, tableHeight);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(50, tableTop, width - 100, tableHeight);

    const rows = [
      { label: 'सदस्य का नाम:', value: receipt.memberName },
      { label: 'मोबाइल नंबर:', value: receipt.mobile || 'उपलब्द नहीं' },
      { label: 'अंशदान का अवसर/माह:', value: receipt.month },
      { label: 'भुगतान माध्यम:', value: receipt.paymentMode },
      { label: 'जमा राशि (अंकों में):', value: `₹${receipt.amount.toLocaleString('en-IN')}/-` },
      { label: 'विवरण / उद्देश्य:', value: receipt.notes || 'परिवार कल्याण एवं गो-सेवा मासिक अंशदान' },
    ];

    let rowY = tableTop + 45;
    rows.forEach((r, idx) => {
      // Alternating row background
      if (idx % 2 === 1) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(51, rowY - 32, width - 102, 52);
      }

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 17px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, 75, rowY);

      ctx.fillStyle = idx === 4 ? '#047857' : '#0f172a';
      ctx.font = idx === 4 ? 'bold 24px "Noto Sans Devanagari", sans-serif' : 'bold 18px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(r.value, width - 75, rowY);

      // line
      ctx.strokeStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(50, rowY + 20);
      ctx.lineTo(width - 50, rowY + 20);
      ctx.stroke();

      rowY += 54;
    });

    // Verification Seal / Digital Stamp (Circular seal)
    const sealX = 180;
    const sealY = 740;
    ctx.save();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 48, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 11px "Noto Sans Devanagari", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ युवा शक्ति ग्रुप ★', sealX, sealY - 26);
    ctx.font = 'bold 14px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('सत्यापित व अधिकृत', sealX, sealY - 4);
    ctx.font = 'bold 10px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('कुचेरा (नागौर)', sealX, sealY + 16);
    ctx.fillText('डिजिटल मुहर', sealX, sealY + 32);
    ctx.restore();

    // Authority Signature Block
    const sigX = width - 200;
    const sigY = 740;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'italic bold 22px "Brush Script MT", cursive, sans-serif';
    ctx.fillText(receipt.issuerName, sigX, sigY - 10);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sigX - 90, sigY + 5);
    ctx.lineTo(sigX + 90, sigY + 5);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px "Noto Sans Devanagari", sans-serif';
    ctx.fillText(receipt.issuerName, sigX, sigY + 24);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 12px "Noto Sans Devanagari", sans-serif';
    ctx.fillText(receipt.issuerRole, sigX, sigY + 42);

    // Footer Motto
    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 14px "Noto Sans Devanagari", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('"संगठन में ही शक्ति है, सेवा में ही सुख है।"', width / 2, height - 70);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('यह रसीद युवा शक्ति ग्रुप प्रणाली द्वारा स्वतः डिजिटल रूप से प्रमाणित की गई है।', width / 2, height - 48);
  }, [isOpen, receipt]);

  if (!isOpen || !receipt) return null;

  const handleShareReceipt = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const shareCaption = `🚩 *युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा)* 🚩\n\nप्रिय ${receipt.memberName} जी,\nआपके द्वारा ₹${receipt.amount} की मासिक अंशदान राशि सफलतापूर्वक प्राप्त हो गई है।\n\n📄 *रसीद संख्या:* ${receipt.receiptNo}\n📅 *दिनांक:* ${receipt.dateStr}\n💳 *माध्यम:* ${receipt.paymentMode}\n\n🙏 परिवार एवं सेवा कार्यों में सहयोग हेतु हार्दिक धन्यवाद।\n- ${receipt.issuerName} (${receipt.issuerRole})`;

    if (navigator.share) {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `Receipt_${receipt.receiptNo}.jpg`, { type: 'image/jpeg' });
        try {
          await navigator.share({
            title: `डिजिटल रसीद - ${receipt.memberName}`,
            text: shareCaption,
            files: [file],
          });
        } catch {
          // Fallback to whatsapp url
          openWhatsAppText(shareCaption);
        }
      }, 'image/jpeg');
    } else {
      openWhatsAppText(shareCaption);
    }
  };

  const openWhatsAppText = (caption: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`;
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.href = image;
    link.download = `YSG_Receipt_${receipt.receiptNo}.jpg`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-slide-up">
        {/* Mobile Swipe / Dismiss Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0 cursor-pointer" onClick={onClose} />

        {/* Modal Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm">डिजिटल रसीद कार्ड (Digital Receipt)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Display */}
        <div className="p-3 bg-slate-900 overflow-y-auto flex justify-center">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[340px] aspect-[800/980] rounded-xl shadow-xl border border-white/20 bg-white"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="p-3 bg-white border-t border-slate-200 grid grid-cols-2 gap-2">
          <button
            onClick={handleShareReceipt}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>व्हाट्सएप पर रसीद भेजें</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>रसीद फोटो डाउनलोड</span>
          </button>
        </div>
      </div>
    </div>
  );
};
