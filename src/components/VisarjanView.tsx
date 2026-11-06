import React, { useState } from 'react';
import { PlusCircle, Printer, Share2, Sparkles, Trash2, IndianRupee, Download } from 'lucide-react';
import { VisarjanItem } from '../types';
import jsPDF from 'jspdf';

interface VisarjanViewProps {
  items: VisarjanItem[];
  isAdmin: boolean;
  onAddItem: (item: VisarjanItem) => void;
  onDeleteItem: (id: string) => void;
}

export const VisarjanView: React.FC<VisarjanViewProps> = ({
  items,
  isAdmin,
  onAddItem,
  onDeleteItem,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [spentBy, setSpentBy] = useState('रेवंतराम भाटी');
  const [paymentMode, setPaymentMode] = useState('PhonePe');

  // Hardcoded known metrics from user's record
  const totalChandaIncome = 15830;
  const totalExpense = items.reduce((sum, it) => sum + it.amount, 0);
  const remainingBalance = totalChandaIncome - totalExpense;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(itemAmount);
    if (isNaN(amt) || amt <= 0 || !itemName.trim()) return;

    const newItem: VisarjanItem = {
      id: `v-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      item: itemName.trim(),
      amount: amt,
      spentBy: spentBy.trim() || 'संचालक',
      paymentMode,
      receiptNumber: `VIS-${Date.now().toString().slice(-4)}`,
    };

    onAddItem(newItem);
    setIsModalOpen(false);
    setItemName('');
    setItemAmount('');
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // Header Banner
    doc.setFillColor(234, 88, 12); // Orange #ea580c
    doc.roundedRect(margin, 35, pageWidth - margin * 2, 65, 8, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('GANESH VISARJAN EVENT - BHATI PARIVAR KUCHERA', pageWidth / 2, 65, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(254, 240, 138);
    doc.text('Special Event Accounts / Visarjan Vyay Vivaran', pageWidth / 2, 85, { align: 'center' });

    // Summary Boxes
    let y = 120;
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(margin, y, 160, 45, 6, 6, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('CHANDA & AARTI INCOME', margin + 10, y + 16);
    doc.setFontSize(14);
    doc.setTextColor(4, 120, 87);
    doc.text(`Rs. ${totalChandaIncome.toLocaleString('en-IN')}`, margin + 10, y + 36);

    doc.setFillColor(254, 242, 242);
    doc.roundedRect(margin + 175, y, 160, 45, 6, 6, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL VISARJAN EXPENSE', margin + 185, y + 16);
    doc.setFontSize(14);
    doc.setTextColor(185, 28, 28);
    doc.text(`Rs. ${totalExpense.toLocaleString('en-IN')}`, margin + 185, y + 36);

    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin + 350, y, 165, 45, 6, 6, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('REMAINING BALANCE (SHESH)', margin + 360, y + 16);
    doc.setFontSize(14);
    doc.setTextColor(29, 78, 216);
    doc.text(`Rs. ${remainingBalance.toLocaleString('en-IN')}`, margin + 360, y + 36);

    // Items Table
    y = 190;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text('#', margin + 8, y + 14);
    doc.text('ITEM DESCRIPTION', margin + 30, y + 14);
    doc.text('SPENT BY', margin + 270, y + 14);
    doc.text('MODE', margin + 370, y + 14);
    doc.text('AMOUNT', pageWidth - margin - 10, y + 14, { align: 'right' });

    y += 26;
    items.forEach((it, idx) => {
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(String(idx + 1), margin + 8, y);
      doc.setTextColor(15, 23, 42);
      doc.text(it.item, margin + 30, y);
      doc.setTextColor(100, 116, 139);
      doc.text(it.spentBy, margin + 270, y);
      doc.text(it.paymentMode, margin + 370, y);
      doc.setTextColor(185, 28, 28);
      doc.text(`Rs. ${it.amount.toLocaleString('en-IN')}`, pageWidth - margin - 10, y, { align: 'right' });
      y += 20;
    });

    doc.save(`Ganesh_Visarjan_Accounts_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const shareWhatsApp = () => {
    const text = `🚩 *गणेश विसर्जन खर्च एवं आय विवरण* 🚩\n*युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा)*\n\n1. चंदा व आरती कुल आय: ₹${totalChandaIncome.toLocaleString('en-IN')}\n2. कुल विसर्जन खर्च: ₹${totalExpense.toLocaleString('en-IN')}\n3. शेष बचत राशि: ₹${remainingBalance.toLocaleString('en-IN')}\n\n*मुख्य खर्च मदें:*\n${items.map((it, i) => `${i + 1}. ${it.item} - ₹${it.amount} (${it.spentBy})`).join('\n')}\n\n🙏 सभी सहयोगकर्ताओं का हार्दिक आभार।`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="px-3 pb-8 space-y-3">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white rounded-3xl p-4 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <h3 className="font-black text-base">गणेश विसर्जन का खर्च • विशेष आयोजन</h3>
          </div>
          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
            कुचेरा महोत्सव
          </span>
        </div>
        <p className="text-xs text-amber-100">
          सामूहिक गणेश विसर्जन की चंदा आय, आरती संग्रह एवं व्यवस्था व्यय का संपूर्ण डिजिटल हिसाब।
        </p>
      </div>

      {/* 3 Metric Summary Boxes */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-center shadow-xs">
          <p className="text-[10px] font-bold text-emerald-800">1. चंदा व आरती आय</p>
          <p className="text-base font-black text-emerald-700 mt-0.5">₹{totalChandaIncome.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-2.5 text-center shadow-xs">
          <p className="text-[10px] font-bold text-rose-800">2. कुल विसर्जन खर्च</p>
          <p className="text-base font-black text-rose-700 mt-0.5">₹{totalExpense.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-2.5 text-center shadow-xs">
          <p className="text-[10px] font-bold text-blue-800">3. बाकी बचे पैसे</p>
          <p className="text-base font-black text-blue-700 mt-0.5">₹{remainingBalance.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-1 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ विसर्जन खर्च जोड़ें</span>
        </button>

        <button
          onClick={exportPDF}
          className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-blue-600" />
          <span>PDF रिपोर्ट</span>
        </button>

        <button
          onClick={shareWhatsApp}
          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>व्हाट्सएप</span>
        </button>
      </div>

      {/* Itemized Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>विसर्जन खर्च सूची ({items.length} मदें)</span>
          <span className="text-rose-600 font-extrabold">कुल योग: ₹{totalExpense.toLocaleString('en-IN')}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((it, idx) => (
            <div key={it.id} className="p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900">{it.item}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    खर्चकर्ता: <span className="font-semibold text-slate-700">{it.spentBy}</span> • {it.paymentMode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-black text-rose-600 text-sm">₹{it.amount.toLocaleString('en-IN')}</span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm(`क्या आप '${it.item}' को हटाना चाहते हैं?`)) {
                        onDeleteItem(it.id);
                      }
                    }}
                    className="p-1 text-slate-300 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 border border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 mb-3">
              नया विसर्जन खर्च जोड़ें
            </h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  सामग्री / विवरण *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. आरती सामग्री, प्रसाद, डीजे..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  खर्च राशि (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="500"
                  value={itemAmount}
                  onChange={(e) => setItemAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  खर्चकर्ता (किसने भुगतान किया)
                </label>
                <input
                  type="text"
                  value={spentBy}
                  onChange={(e) => setSpentBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  भुगतान माध्यम
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                >
                  <option value="PhonePe">PhonePe</option>
                  <option value="Google Pay">Google Pay</option>
                  <option value="UPI">अन्य UPI</option>
                  <option value="नकद (Cash)">नकद (Cash)</option>
                  <option value="उधार / बिल बकाया">उधार / बिल बकाया</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  खर्च जोड़ें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
