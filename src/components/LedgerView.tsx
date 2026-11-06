import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  MinusCircle,
  Printer,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trash2,
  Edit2,
  FileText,
  CheckCircle2,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';
import { Transaction, VisarjanItem, Member } from '../types';
import { exportLedgerToPDF } from '../utils/pdfGenerator';
import jsPDF from 'jspdf';

interface LedgerViewProps {
  transactions: Transaction[];
  visarjanItems: VisarjanItem[];
  members: Member[];
  isAdmin: boolean;
  baseFund: number;
  onUpdateBaseFund: (newBase: number) => void;
  onOpenAddModal: (type: 'jama' | 'kharch') => void;
  onDeleteTransaction: (id: string) => void;
  onAddVisarjanItem: (item: VisarjanItem) => void;
  onDeleteVisarjanItem: (id: string) => void;
  onUpdateVisarjanMetrics?: (metrics: { chandaIncome: number; totalExpense: number; remainingBalance: number }) => void;
  visarjanMetrics: { chandaIncome: number; totalExpense: number; remainingBalance: number };
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  transactions,
  visarjanItems,
  members,
  isAdmin,
  baseFund,
  onUpdateBaseFund,
  onOpenAddModal,
  onDeleteTransaction,
  onAddVisarjanItem,
  onDeleteVisarjanItem,
  visarjanMetrics,
  onUpdateVisarjanMetrics,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'jama' | 'kharch'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisarjanExpanded, setIsVisarjanExpanded] = useState(true);
  const [isEditBaseFundOpen, setIsEditBaseFundOpen] = useState(false);
  const [newBaseInput, setNewBaseInput] = useState(baseFund.toString());

  // Edit Visarjan Stat modal states
  const [isEditVisarjanStatOpen, setIsEditVisarjanStatOpen] = useState(false);
  const [editStatType, setEditStatType] = useState<'income' | 'expense' | 'remaining'>('income');
  const [statInputVal, setStatInputVal] = useState('');

  // Add Visarjan item modal state
  const [isAddVisarjanModalOpen, setIsAddVisarjanModalOpen] = useState(false);
  const [visarjanItemName, setVisarjanItemName] = useState('');
  const [visarjanItemAmount, setVisarjanItemAmount] = useState('');

  // Count up animation effect state
  const [isFlashing, setIsFlashing] = useState(false);
  const [prevFund, setPrevFund] = useState(baseFund);

  // 1. CALCULATE MEMBER CONTRIBUTIONS (November + October paid dues)
  const memberPaidContributions = members.reduce((sum, m) => {
    let amt = 0;
    if (m.novemberPaid) amt += Number(m.novemberAmount) || 50;
    return sum + amt;
  }, 0);

  // 2. ADDITIONAL GENERAL TRANSACTIONS (New Jama)
  const additionalJama = transactions
    .filter((t) => t.type === 'jama')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // 3. GENERAL EXPENSES (Kharch)
  const totalKharch = transactions
    .filter((t) => t.type === 'kharch')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // 4. TOTAL AVAILABLE FUND = Base Fund (₹2,905) + Member Dues Paid + New Jama - Expenses
  const totalAvailableFund = baseFund + memberPaidContributions + additionalJama - totalKharch;

  // Trigger flash on balance change
  useEffect(() => {
    if (totalAvailableFund !== prevFund) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 900);
      setPrevFund(totalAvailableFund);
      return () => clearTimeout(timer);
    }
  }, [totalAvailableFund, prevFund]);

  // Ganesh Visarjan Computed Totals
  const totalVisarjanExpenses = visarjanItems.reduce((sum, it) => sum + Number(it.amount), 0);

  // Filtered General Transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.memberName && t.memberName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.date.includes(searchQuery) ||
      (t.paymentMode && t.paymentMode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleSaveBaseFund = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newBaseInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateBaseFund(val);
      setIsEditBaseFundOpen(false);
    }
  };

  const handleOpenEditStat = (type: 'income' | 'expense' | 'remaining') => {
    setEditStatType(type);
    if (type === 'income') setStatInputVal(visarjanMetrics.chandaIncome.toString());
    if (type === 'expense') setStatInputVal(visarjanMetrics.totalExpense.toString());
    if (type === 'remaining') setStatInputVal(visarjanMetrics.remainingBalance.toString());
    setIsEditVisarjanStatOpen(true);
  };

  const handleSaveStat = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(statInputVal);
    if (!isNaN(val) && onUpdateVisarjanMetrics) {
      if (editStatType === 'income') {
        onUpdateVisarjanMetrics({ ...visarjanMetrics, chandaIncome: val });
      } else if (editStatType === 'expense') {
        onUpdateVisarjanMetrics({ ...visarjanMetrics, totalExpense: val });
      } else {
        onUpdateVisarjanMetrics({ ...visarjanMetrics, remainingBalance: val });
      }
      setIsEditVisarjanStatOpen(false);
    }
  };

  const handleAddVisarjanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(visarjanItemAmount);
    if (isNaN(amt) || amt <= 0 || !visarjanItemName.trim()) return;

    const newItem: VisarjanItem = {
      id: `v-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      item: visarjanItemName.trim(),
      amount: amt,
      spentBy: 'रेवंतराम भाटी',
      paymentMode: 'PhonePe',
      receiptNumber: `VIS-${Date.now().toString().slice(-4)}`,
    };

    onAddVisarjanItem(newItem);
    setIsAddVisarjanModalOpen(false);
    setVisarjanItemName('');
    setVisarjanItemAmount('');
  };

  const exportVisarjanPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // Header Banner
    doc.setFillColor(234, 88, 12);
    doc.roundedRect(margin, 35, pageWidth - margin * 2, 60, 8, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('YUVA SHAKTI GROUP - GANESH VISARJAN EXPENSES', pageWidth / 2, 62, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(254, 240, 138);
    doc.text('Bhati Parivar Kuchera • Vyay Vivaran', pageWidth / 2, 80, { align: 'center' });

    // 3 Stat Boxes
    let y = 115;
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(margin, y, 160, 45, 6, 6, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(6, 95, 70);
    doc.text('1. CHANDA & AARTI AAY', margin + 10, y + 16);
    doc.setFontSize(13);
    doc.setTextColor(5, 150, 105);
    doc.text(`Rs. ${visarjanMetrics.chandaIncome.toLocaleString('en-IN')}`, margin + 10, y + 36);

    doc.setFillColor(254, 242, 242);
    doc.roundedRect(margin + 175, y, 160, 45, 6, 6, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(159, 18, 57);
    doc.text('2. KUL VISARJAN KHARCH', margin + 185, y + 16);
    doc.setFontSize(13);
    doc.setTextColor(225, 29, 72);
    doc.text(`Rs. ${visarjanMetrics.totalExpense.toLocaleString('en-IN')}`, margin + 185, y + 36);

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin + 350, y, 165, 45, 6, 6, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(21, 128, 61);
    doc.text('3. BAAKI BACHE PAISE', margin + 360, y + 16);
    doc.setFontSize(13);
    doc.setTextColor(22, 163, 74);
    doc.text(`Rs. ${visarjanMetrics.remainingBalance.toLocaleString('en-IN')}`, margin + 360, y + 36);

    // Items Table
    y = 185;
    doc.setFillColor(254, 243, 199);
    doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');
    doc.setFontSize(9);
    doc.setTextColor(120, 53, 15);
    doc.text('#', margin + 10, y + 15);
    doc.text('ITEM DESCRIPTION', margin + 40, y + 15);
    doc.text('AMOUNT (INR)', pageWidth - margin - 15, y + 15, { align: 'right' });

    y += 24;
    visarjanItems.forEach((it, idx) => {
      if (y > 780) {
        doc.addPage();
        y = 40;
      }
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(String(idx + 1), margin + 10, y);
      doc.setTextColor(15, 23, 42);
      doc.text(it.item, margin + 40, y);
      doc.setTextColor(180, 83, 9);
      doc.text(`Rs. ${it.amount.toLocaleString('en-IN')}`, pageWidth - margin - 15, y, { align: 'right' });
      y += 18;
    });

    doc.save(`Ganesh_Visarjan_Kharch_Kuchera_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Amount (INR)', 'Description', 'Member', 'Payment Mode', 'Notes', 'Receipt'];
    const rows = transactions.map((t) => [
      t.date,
      t.type === 'jama' ? 'जमा (Credit)' : 'खर्च (Debit)',
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${(t.memberName || '').replace(/"/g, '""')}"`,
      t.paymentMode,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.receiptNumber || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Yuva_Shakti_Bahi_Khata_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="px-3 pb-8 space-y-3">
      {/* 🚩 TOP TWO CARDS (उपलब्ध कुल कोष & कुल खर्च) Exactly Matching User's Screenshot */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card 1: उपलब्ध कुल कोष ✏️ */}
        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-3 text-center shadow-xs interactive-tap relative overflow-hidden">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-[#065f46]">
            <span>उपलब्ध कुल कोष</span>
            <button
              onClick={() => {
                setNewBaseInput(baseFund.toString());
                setIsEditBaseFundOpen(true);
              }}
              className="p-1 rounded-full text-[#059669] hover:bg-[#d1fae5] transition cursor-pointer"
              title="आधार कोष बदलें (संचालक)"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Big Amount with Animated Counting Flash */}
          <div
            className={`my-1 text-2xl sm:text-3xl font-black text-[#047857] tracking-tight flex items-baseline justify-center transition-transform ${
              isFlashing ? 'count-flash' : ''
            }`}
          >
            <span className="text-sm font-bold opacity-75 mr-0.5">₹</span>
            <span>{totalAvailableFund.toLocaleString('en-IN')}</span>
          </div>

          <div className="text-[11px] font-bold text-[#059669]">
            सुरक्षित कोष शेष
          </div>
          {(memberPaidContributions > 0 || additionalJama > 0) && (
            <div className="text-[9.5px] font-semibold text-emerald-700/80 mt-0.5 animate-fade-in truncate">
              (₹{baseFund.toLocaleString('en-IN')} आधार + ₹{(memberPaidContributions + additionalJama).toLocaleString('en-IN')} जमा)
            </div>
          )}
        </div>

        {/* Card 2: कुल खर्च ↘️ */}
        <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-2xl p-3 text-center shadow-xs interactive-tap relative">
          <div className="flex items-center justify-center gap-1 text-xs font-extrabold text-[#9f1239]">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            <span>कुल खर्च</span>
          </div>

          <div className="my-1 text-2xl sm:text-3xl font-black text-[#e11d48] tracking-tight flex items-baseline justify-center">
            <span className="text-sm font-bold opacity-75 mr-0.5">₹</span>
            <span>{totalKharch.toLocaleString('en-IN')}</span>
          </div>

          <div className="text-[11px] font-bold text-[#be123c]">
            सामग्री व व्यवस्था व्यय
          </div>
        </div>
      </div>

      {/* 🚩 गणेश विसर्जन का खर्च (विशेष आयोजन) Collapsible Box Exactly as in Screenshot */}
      <div className="rounded-2xl border-1.5 border-amber-300/80 bg-gradient-to-br from-amber-100/60 via-amber-50/40 to-amber-100/50 shadow-xs overflow-hidden transition-all">
        {/* Clickable Header Bar */}
        <div
          onClick={() => setIsVisarjanExpanded(!isVisarjanExpanded)}
          className="p-3 flex items-center justify-between cursor-pointer select-none interactive-tap"
        >
          <div className="flex items-center gap-2.5">
            {/* ॐ Icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center text-lg font-black shadow-sm shrink-0">
              ॐ
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-amber-950">
                  गणेश विसर्जन का खर्च
                </span>
                <span className="text-[9.5px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  विशेष आयोजन
                </span>
              </div>
              <p className="text-[10px] text-amber-800 font-medium mt-0.5">
                क्लिक करके विसर्जन व्यवस्था व्यय विवरण देखें
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-black bg-amber-200/80 text-amber-900 px-2.5 py-1 rounded-xl border border-amber-300">
              ₹{visarjanMetrics.totalExpense.toLocaleString('en-IN')}
            </span>
            {isVisarjanExpanded ? (
              <ChevronUp className="w-4 h-4 text-amber-800" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-800" />
            )}
          </div>
        </div>

        {/* Collapsible Content */}
        {isVisarjanExpanded && (
          <div className="p-3 border-t border-amber-200/80 bg-white/85 space-y-3 animate-fade-in">
            {/* 3 Metric Boxes: 1. चंदा व आरती आय, 2. कुल विसर्जन खर्च, 3. बाकी बचे पैसे */}
            <div className="grid grid-cols-3 gap-2">
              {/* Box 1 */}
              <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-2 text-center relative interactive-tap">
                <div className="text-[10px] font-extrabold text-[#065f46]">
                  1. चंदा व आरती आय
                </div>
                <div className="text-xs sm:text-sm font-black text-[#059669] mt-0.5">
                  ₹{visarjanMetrics.chandaIncome.toLocaleString('en-IN')}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenEditStat('income')}
                    className="absolute top-1 right-1 p-0.5 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    title="बदलें"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Box 2 */}
              <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-xl p-2 text-center relative interactive-tap">
                <div className="text-[10px] font-extrabold text-[#9f1239]">
                  2. कुल विसर्जन खर्च
                </div>
                <div className="text-xs sm:text-sm font-black text-[#e11d48] mt-0.5">
                  ₹{visarjanMetrics.totalExpense.toLocaleString('en-IN')}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenEditStat('expense')}
                    className="absolute top-1 right-1 p-0.5 text-rose-700 hover:text-rose-900 cursor-pointer"
                    title="बदलें"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Box 3 */}
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-2 text-center relative interactive-tap">
                <div className="text-[10px] font-extrabold text-[#15803d]">
                  3. बाकी बचे पैसे
                </div>
                <div className="text-xs sm:text-sm font-black text-[#16a34a] mt-0.5">
                  ₹{visarjanMetrics.remainingBalance.toLocaleString('en-IN')}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenEditStat('remaining')}
                    className="absolute top-1 right-1 p-0.5 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    title="बदलें"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List Header & Action Buttons */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
              <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span>📋 विसर्जन खर्च सूची</span>
                <span className="text-[11px] font-extrabold text-amber-800">
                  ({visarjanItems.length} मद)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={exportVisarjanPDF}
                  className="py-1 px-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs interactive-tap cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  <span>PDF डाउनलोड</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddVisarjanModalOpen(true)}
                  className="py-1 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs interactive-tap cursor-pointer"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>+ विसर्जन खर्च जोड़ें</span>
                </button>
              </div>
            </div>

            {/* Exact Visarjan Items Table (Matching Screenshot) */}
            <div className="rounded-xl border border-amber-200 overflow-hidden shadow-xs">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-100/90 text-amber-950 border-b border-amber-200 text-[11px]">
                    <th className="py-2 px-2 text-center w-8">#</th>
                    <th className="py-2 px-2.5 text-left font-black">सामग्री विवरण</th>
                    <th className="py-2 px-2.5 text-right font-black">खर्च (₹)</th>
                    <th className="py-2 px-2 text-center w-12 font-black">एक्शन</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 bg-white">
                  {visarjanItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-amber-50/50 transition">
                      <td className="py-1.5 px-2 text-center text-amber-900 font-bold text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-900 font-bold text-xs">
                        {item.item}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-black text-amber-900 text-xs">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`क्या आप '${item.item}' खर्च हटाना चाहते हैं?`)) {
                              onDeleteVisarjanItem(item.id);
                            }
                          }}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-50 text-amber-950 font-black border-t-2 border-amber-200 text-xs">
                    <td colSpan={2} className="py-2 px-2.5 text-right">
                      गणेश विसर्जन कुल योग:
                    </td>
                    <td className="py-2 px-2.5 text-right text-amber-900 font-black text-sm">
                      ₹{totalVisarjanExpenses.toLocaleString('en-IN')}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 🚩 GENERAL LEDGER (बही-खाता) Section */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>दैनिक बही-खाता (आय-व्यय प्रविष्टियाँ)</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-500">
            {filteredTransactions.length} रिकॉर्ड
          </span>
        </div>

        {/* 4 Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onOpenAddModal('jama')}
            className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm interactive-tap cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ जमा प्रविष्टि</span>
          </button>

          <button
            onClick={() => onOpenAddModal('kharch')}
            className="py-2 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm interactive-tap cursor-pointer"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>- खर्च प्रविष्टि</span>
          </button>

          <button
            onClick={() => exportLedgerToPDF(transactions, additionalJama + memberPaidContributions, totalKharch, totalAvailableFund)}
            className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs interactive-tap cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>PDF बही-खाता</span>
          </button>

          <button
            onClick={exportCSV}
            className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs interactive-tap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>एक्सेल / CSV</span>
          </button>
        </div>

        {/* Search & Segmented Filter Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="विवरण, सदस्य, माध्यम खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl">
            {[
              { id: 'all', label: 'सभी' },
              { id: 'jama', label: 'जमा (+)' },
              { id: 'kharch', label: 'खर्च (-)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer interactive-tap ${
                  filterType === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 pt-1">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200/80 p-4">
              <p className="text-slate-500 text-xs font-semibold">कोई प्रविष्टि नहीं मिली।</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  सभी रिकॉर्ड देखें
                </button>
              )}
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-200 transition-all flex items-center justify-between gap-3 interactive-tap"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 mt-0.5 ${
                      tx.type === 'jama'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {tx.type === 'jama' ? '+' : '-'}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-xs truncate">
                      {tx.description}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10.5px] text-slate-500">
                      {tx.memberName && (
                        <span className="font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                          {tx.memberName}
                        </span>
                      )}
                      <span>• {tx.date}</span>
                      <span>• {tx.paymentMode}</span>
                      {tx.receiptNumber && (
                        <span className="text-[9.5px] text-slate-400">#{tx.receiptNumber}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <div
                      className={`font-black text-sm ${
                        tx.type === 'jama' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {tx.type === 'jama' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        tx.type === 'jama'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {tx.type === 'jama' ? 'जमा' : 'खर्च'}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm(`क्या आप यह प्रविष्टि हटाना चाहते हैं?`)) {
                          onDeleteTransaction(tx.id);
                        }
                      }}
                      className="p-1 rounded text-slate-300 hover:text-rose-600 transition cursor-pointer"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✏️ MODAL: Edit Base Fund (उपलब्ध कुल कोष) */}
      {isEditBaseFundOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-1">
              उपलब्ध कुल आधार कोष बदलें
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              यह आधार सुरक्षित कोष है (डिफ़ॉल्ट ₹2,905)। इसमें सभी सदस्यों का जमा पैसा स्वतः जुड़ता रहेगा।
            </p>

            <form onSubmit={handleSaveBaseFund} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  नया आधार कोष (₹)
                </label>
                <input
                  type="number"
                  value={newBaseInput}
                  onChange={(e) => setNewBaseInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditBaseFundOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 cursor-pointer shadow-sm"
                >
                  सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ MODAL: Edit Visarjan Stat (आय, खर्च, बाकी) */}
      {isEditVisarjanStatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-1">
              विसर्जन विवरण राशि बदलें
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editStatType === 'income' && '1. चंदा व आरती आय राशि दर्ज करें:'}
              {editStatType === 'expense' && '2. कुल विसर्जन खर्च राशि दर्ज करें:'}
              {editStatType === 'remaining' && '3. बाकी बचे पैसे की राशि दर्ज करें:'}
            </p>

            <form onSubmit={handleSaveStat} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  राशि (₹)
                </label>
                <input
                  type="number"
                  value={statInputVal}
                  onChange={(e) => setStatInputVal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditVisarjanStatOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-extrabold text-xs hover:bg-amber-700 cursor-pointer shadow-sm"
                >
                  अपडेट करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ➕ MODAL: Add Visarjan Item */}
      {isAddVisarjanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-1">
              नया विसर्जन खर्च जोड़ें
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              सामग्री का नाम और खर्च राशि दर्ज करें:
            </p>

            <form onSubmit={handleAddVisarjanSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  सामग्री विवरण
                </label>
                <input
                  type="text"
                  placeholder="उदा. फेरिया, केला, फूलमाला..."
                  value={visarjanItemName}
                  onChange={(e) => setVisarjanItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  खर्च राशि (₹)
                </label>
                <input
                  type="number"
                  placeholder="उदा. 250"
                  value={visarjanItemAmount}
                  onChange={(e) => setVisarjanItemAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddVisarjanModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-extrabold text-xs hover:bg-amber-700 cursor-pointer shadow-sm"
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
