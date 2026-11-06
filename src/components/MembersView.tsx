import React, { useState } from 'react';
import { Search, Phone, MessageCircle, Edit, Trash2, UserPlus, Cake, Heart, MapPin, Sparkles, CheckCircle, Clock, Send, BellRing, ShieldCheck, FileCheck, Download } from 'lucide-react';
import { Member, DigitalReceiptData } from '../types';
import { SANCHALAK_INFO } from '../data/initialData';
import { exportMemberPassbookToPDF } from '../utils/pdfGenerator';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

interface MembersViewProps {
  members: Member[];
  isAdmin: boolean;
  baseFund?: number;
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onUpdateMemberDue: (memberId: string, month: 'october' | 'november', paid: boolean, amount: number) => void;
  onGenerateReceipt: (receipt: DigitalReceiptData) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  isAdmin,
  baseFund = 2905,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onUpdateMemberDue,
  onGenerateReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'passbook' | 'directory'>('passbook');
  const [selectedMonth, setSelectedMonth] = useState<'november' | 'october'>('november');
  const [reminderSent, setReminderSent] = useState(false);

  // Executive 11 Members
  const executiveMembers = members.filter((m) => m.category === 'executive' || m.id.startsWith('m-'));
  
  // Pending dues in November
  const pendingNovemberCount = executiveMembers.filter((m) => !m.novemberPaid).length;
  const paidNovemberTotal = executiveMembers.reduce((sum, m) => sum + (m.novemberPaid ? m.novemberAmount : 0), 0);
  const paidOctoberTotal = executiveMembers.reduce((sum, m) => sum + (m.octoberPaid ? m.octoberAmount : 0), 0);

  const filteredMembers = members.filter((m) => {
    return (
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.nameEnglish && m.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.fatherOrSpouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mobile.includes(searchTerm)
    );
  });

  const handleBroadcastReminder = () => {
    const upiLink = `upi://pay?pa=7850983600@ibl&pn=Yuva%20Shakti%20Bhati%20Parivar&am=50&cu=INR`;
    const message = `🚩 *युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा)* 🚩\n\n⏰ *बकाया अंशदान स्मरण (कार्तिक अमावस्या)*\n\nसमस्त आदरणीय सदस्यों को सूचित किया जाता है कि कल अमावस्या पूंजी संग्रह दिवस है।\n\nजिन सदस्यों का इस माह का सहयोग अंशदान (₹50) अभी शेष है, कृपया समय पर जमा करवाने की कृपा करें।\n\n📲 *सीधे 1-क्लिक भुगतान लिंक (PhonePe / GPay):*\n${upiLink}\n_(लिंक पर क्लिक करते ही PhonePe/GPay में ₹50 व नाम स्वतः भर जाएगा, केवल UPI पिन डालें)_\n\n💳 *PhonePe / UPI ID:* ${SANCHALAK_INFO.upiId}\n📞 *संचालक:* ${SANCHALAK_INFO.name} (${SANCHALAK_INFO.phone})\n\n🙏 परिवार व गो-सेवा में सहयोग के लिए हार्दिक धन्यवाद।`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 3000);
  };

  const handleSendIndividualReminder = (m: Member) => {
    const upiLink = `upi://pay?pa=7850983600@ibl&pn=Yuva%20Shakti%20Bhati%20Parivar&am=50&cu=INR`;
    const message = `🚩 *युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा)* 🚩\n\nनमस्ते ${m.name} जी,\nजय श्री राम! आपके रिकॉर्ड अनुसार इस माह का अमावस्या पूंजी अंशदान (₹50) अभी बाकी है।\n\n📲 *सीधे 1-क्लिक भुगतान लिंक (PhonePe / GPay):*\n${upiLink}\n_(लिंक पर क्लिक करते ही PhonePe/GPay में ₹50 व नाम स्वतः भर जाएगा)_\n\n💳 *UPI ID:* ${SANCHALAK_INFO.upiId}\n\nधन्यवाद।\n- रेवंतराम भाटी (संचालक)`;
    window.open(`https://wa.me/91${m.mobile}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleQuickPayAndReceipt = (m: Member, month: 'november' | 'october') => {
    const amount = 50; // standard monthly executive contribution
    onUpdateMemberDue(m.id, month, true, amount);

    const now = new Date();
    const receiptData: DigitalReceiptData = {
      receiptNo: `YSG-${month.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      memberName: m.name,
      mobile: m.mobile,
      amount,
      month: month === 'november' ? 'कार्तिक अमावस्या (नवंबर 2026)' : 'अश्विन अमावस्या (अक्टूबर 2026)',
      dateStr: now.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      timeStr: now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      paymentMode: 'PhonePe / UPI (7850983600@ibl)',
      issuerName: SANCHALAK_INFO.name,
      issuerRole: 'मुख्य संचालक',
      notes: 'मासिक अमावस्या पूंजी व परिवार कल्याण कोष अंशदान',
    };

    onGenerateReceipt(receiptData);
  };

  return (
    <div className="px-3 pb-8 space-y-3">
      {/* View Switcher Pills */}
      <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1 rounded-2xl">
        <button
          onClick={() => setActiveView('passbook')}
          className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeView === 'passbook'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>सदस्य अंशदान पासबुक (11 सदस्य)</span>
        </button>

        <button
          onClick={() => setActiveView('directory')}
          className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeView === 'directory'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <span>परिवार डायरेक्टरी ({members.length})</span>
        </button>
      </div>

      {activeView === 'passbook' ? (
        <div className="space-y-3">
          {/* Sanchalak Pending Due Reminder Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 shadow-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <h3 className="font-extrabold text-sm text-slate-100">
                  बकायादार सदस्य रिमाइंडर (संचालक)
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                {pendingNovemberCount} सदस्य बाकी
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              जिन सदस्यों के पैसे बाकी हैं, उन्हें सीधे 1-क्लिक में इन-ऐप व व्हाट्सएप रिमाइंडर भेजें।
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={handleBroadcastReminder}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{reminderSent ? 'रिमाइंडर भेजा गया! ✅' : 'सभी बकायादारों को व्हाट्सएप रिमाइंडर भेजें'}</span>
              </button>

              <button
                onClick={() => exportMemberPassbookToPDF(executiveMembers, baseFund)}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                title="वॉटरमार्क और संचालक मुहर सहित मासिक पासबुक PDF डाउनलोड करें"
              >
                <Download className="w-3.5 h-3.5" />
                <span>📄 सदस्य पासबुक PDF</span>
              </button>

              <button
                onClick={onAddMember}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>LIVE + परिवार सदस्य जोड़ें</span>
              </button>
            </div>
          </div>

          {/* Monthly Collection Summary Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={() => setSelectedMonth('november')}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                selectedMonth === 'november'
                  ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/30'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <p className="text-[10px] font-bold text-slate-500">इस महीने जमा (नवंबर)</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">₹{paidNovemberTotal}</p>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
                {11 - pendingNovemberCount}/11 सदस्य जमा • 8 नव॰
              </span>
            </div>

            <div
              onClick={() => setSelectedMonth('october')}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                selectedMonth === 'october'
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/30'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <p className="text-[10px] font-bold text-slate-500">पिछले माह जमा (अक्टूबर)</p>
              <p className="text-lg font-black text-emerald-700 mt-0.5">₹{paidOctoberTotal}</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mt-1">
                11 सदस्य पूर्ण जमा ✅
              </span>
            </div>
          </div>

          {/* 11 Executive Members List */}
          <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  मासिक अमावस्या सहयोग विवरण • कुचेरा
                </h4>
                <p className="text-[11px] text-slate-500">
                  {selectedMonth === 'november' ? 'नवंबर 2026 (कार्तिक अमावस्या)' : 'अक्टूबर 2026 (अभियान शुरुआत)'}
                </p>
              </div>
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                11 सदस्य पूर्ण ✅
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {executiveMembers.map((m, idx) => {
                const isPaid = selectedMonth === 'november' ? m.novemberPaid : m.octoberPaid;
                const amount = selectedMonth === 'november' ? m.novemberAmount : m.octoberAmount;

                return (
                  <div key={m.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-extrabold text-slate-900">{m.name}</h5>
                          {m.isSelf && (
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1 py-0.2 rounded">
                              आप
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-slate-500">{m.relation} • {m.mobile}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPaid ? (
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-600">₹{amount || 50}</span>
                          <div className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>जमा (Paid)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-black text-rose-600">₹50</span>
                          <div className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>बाकी (Due)</span>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {!isPaid ? (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => handleQuickPayAndReceipt(m, selectedMonth)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                            title="जमा करें व रसीद बनाएं"
                          >
                            जमा करें
                          </button>
                          <button
                            onClick={() => handleSendIndividualReminder(m)}
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                            title="व्हाट्सएप रिमाइंडर भेजें"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleQuickPayAndReceipt(m, selectedMonth)}
                          className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] cursor-pointer"
                          title="डिजिटल रसीद कार्ड देखें / साझा करें"
                        >
                          रसीद कार्ड
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => onEditMember(m)}
                          className="p-1 text-slate-300 hover:text-blue-600 cursor-pointer"
                          title="संशोधित करें"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Family Directory View */
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="नाम, पिता का नाम, मोबाइल नंबर या पता खोजें..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white text-xs border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <button
              onClick={onAddMember}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>नया सदस्य</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-base shrink-0 shadow-inner">
                      {member.name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          {member.name}
                        </h3>
                        {member.isSelf && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-md">
                            आप
                          </span>
                        )}
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md">
                          {member.relation}
                        </span>
                      </div>

                      {member.fatherOrSpouse && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          पिता/पति: <span className="font-medium text-slate-700">{member.fatherOrSpouse}</span>
                        </p>
                      )}

                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{member.address}</span>
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditMember(member)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                        title="संशोधित करें"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`क्या आप ${member.name} को हटाना चाहते हैं?`)) {
                            onDeleteMember(member.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Important Dates */}
                {(member.dob || member.anniversary) && (
                  <div className="mt-2.5 pt-2 border-t border-dashed border-slate-100 flex flex-wrap gap-3 text-[11px] text-slate-500">
                    {member.dob && (
                      <span className="inline-flex items-center gap-1">
                        <Cake className="w-3 h-3 text-amber-500" />
                        <span>जन्म: {member.dob}</span>
                      </span>
                    )}
                    {member.anniversary && (
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500" />
                        <span>विवाह वर्षगांठ: {member.anniversary}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Action Grid (Call, WhatsApp, Instagram) */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100">
                  <a
                    href={`tel:${member.mobile}`}
                    className="py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <Phone className="w-3 h-3" />
                    <span>कॉल</span>
                  </a>

                  <a
                    href={`https://wa.me/91${member.mobile}?text=${encodeURIComponent(`जय श्री तेजाजी री सा! युवा शक्ति ग्रुप (कुचेरा) परिवार संदेश।`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>व्हाट्सएप</span>
                  </a>

                  {member.instagram ? (
                    <a
                      href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      <InstagramIcon className="w-3 h-3" />
                      <span>इंस्टा</span>
                    </a>
                  ) : (
                    <span className="py-1.5 px-2 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-semibold flex items-center justify-center gap-1 text-center">
                      <InstagramIcon className="w-3 h-3" />
                      <span>प्रोफाइल</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
