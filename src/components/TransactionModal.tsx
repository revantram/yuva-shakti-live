import React, { useState } from 'react';
import { X, PlusCircle, MinusCircle, IndianRupee, Tag, User, Calendar, CreditCard } from 'lucide-react';
import { Transaction, Member } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  members: Member[];
  defaultType?: 'jama' | 'kharch';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  defaultType = 'jama',
}) => {
  const [type, setType] = useState<'jama' | 'kharch'>(defaultType);
  const [amount, setAmount] = useState<string>('500');
  const [description, setDescription] = useState<string>('अमावस्या अंशदान');
  const [memberName, setMemberName] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<Transaction['paymentMode']>('PhonePe');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const presetAmounts = [100, 200, 500, 1100, 2100, 5100];
  const presetDescJama = [
    'अमावस्या अंशदान',
    'मासिक परिवार अंशदान',
    'पुण्यतिथि सहयोग',
    'मंदिर सेवा भेंट',
    'विशेष परिवार कल्याण दान',
  ];
  const presetDescKharch = [
    'मासिक बैठक अल्पाहार व व्यवस्था',
    'गौशाला सेवा व चारा (कुचेरा)',
    'धार्मिक पूजा व सामग्री',
    'प्रिंटिंग, बही-खाता व स्टेशनरी',
    'पारिवारिक सहायता',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date,
      type,
      amount: numAmount,
      description: description.trim() || (type === 'jama' ? 'अंशदान' : 'खर्च'),
      memberName: memberName.trim() || undefined,
      paymentMode,
      notes: notes.trim() || undefined,
      receiptNumber: `YSG-${Date.now().toString().slice(-6)}`,
    };

    onSave(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col animate-slide-up">
        {/* Mobile Swipe / Dismiss Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0 cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'jama' ? (
              <PlusCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <MinusCircle className="w-5 h-5 text-rose-400" />
            )}
            <h3 className="text-base font-bold">
              {type === 'jama' ? 'नई जमा (क्रेडिट) प्रविष्टि' : 'नई खर्च (डेबिट) प्रविष्टि'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
          {/* Type Selector (Jama vs Kharch) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('jama')}
              className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                type === 'jama'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>जमा (+ Credit)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('kharch')}
              className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                type === 'kharch'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>खर्च (- Debit)</span>
            </button>
          </div>

          {/* Amount input & presets */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              राशि (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-base font-extrabold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetAmounts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p.toString())}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] cursor-pointer"
                >
                  ₹{p}
                </button>
              ))}
            </div>
          </div>

          {/* Description & fast chips */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              विवरण / प्रयोजन *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. अमावस्या अंशदान"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {/* Description Chips */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {(type === 'jama' ? presetDescJama : presetDescKharch).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDescription(d)}
                  className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-600 text-[10px] font-medium cursor-pointer"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Member Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                संबंधित सदस्य (वैकल्पिक)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  list="members-list"
                  placeholder="सदस्य का नाम चुनें या लिखें"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <datalist id="members-list">
                  {members.map((m) => (
                    <option key={m.id} value={m.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                भुगतान माध्यम
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="PhonePe">PhonePe</option>
                  <option value="Google Pay">Google Pay</option>
                  <option value="UPI">अन्य UPI</option>
                  <option value="नकद (Cash)">नकद (Cash)</option>
                  <option value="बैंक ट्रांसफर">बैंक ट्रांसफर / IMPS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                तारीख
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                विशेष टिप्पणी / नोट
              </label>
              <input
                type="text"
                placeholder="उदा. बिल संख्या या पावती"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white font-bold shadow-md active:scale-95 transition cursor-pointer ${
                type === 'jama' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              प्रविष्टि जोड़ें
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
