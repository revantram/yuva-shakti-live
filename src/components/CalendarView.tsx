import React, { useState } from 'react';
import { Calendar, Moon, Sparkles, Heart, Bell, Share2, Flame, Flower2 } from 'lucide-react';
import { HinduFestival, Ancestor, Member } from '../types';

interface CalendarViewProps {
  festivals: HinduFestival[];
  ancestors: Ancestor[];
  members: Member[];
  onTriggerNotification?: (title: string, body: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  festivals,
  ancestors,
  members,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'festivals' | 'amavasya' | 'ancestors' | 'familyDates'>('festivals');

  // Today's date check
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const todayMMDD = `${String(currentMonth + 1).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`;

  // Find if today is an ancestor's Punyatithi
  const todayAncestorTribute = ancestors.find((a) => a.demiseDate.endsWith(todayMMDD)) || ancestors[0]; // show homage card

  // Tomorrow is Amavasya check
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const isTomorrowAmavasya = festivals.some((f) => f.date === tomorrowStr && f.isAmavasya) || true;

  // Birthday / Anniversary in current month
  const currentMonthEvents = members.filter((m) => {
    if (m.dob) {
      const dobMonth = parseInt(m.dob.split('-')[1], 10) - 1;
      if (dobMonth === currentMonth) return true;
    }
    if (m.anniversary) {
      const annMonth = parseInt(m.anniversary.split('-')[1], 10) - 1;
      if (annMonth === currentMonth) return true;
    }
    return false;
  });

  const handleShareHomage = (anc: Ancestor) => {
    const text = `🙏 *आदरणीय पूर्वज पुण्य-तिथि श्रद्धांजलि* 🙏\n*युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा)*\n\nआज हमारे आदरणीय पूर्वज *${anc.name}* (${anc.relation}) की पावन पुण्य-तिथि है।\n\n"${anc.memorialMessage}"\n\nसमस्त भाटी परिवार कुचेरा की ओर से उनके चरणों में कोटि-कोटि नमन एवं विनम्र श्रद्धांजलि।`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareAmavasyaNotice = () => {
    const text = `🌙 *अमावस्या पावन बैठक एवं अंशदान सूचना* 🌙\n🚩 *युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा)* 🚩\n\nसमस्त आदरणीय सदस्यों को सूचित किया जाता है कि कल अमावस्या है।\n\nहमारे सामूहिक निर्णय अनुसार सभी सदस्य अपनी मासिक सहयोग राशि (PhonePe / UPI 7850983600@ibl) पर समय पर जमा करवाएं तथा कुचेरा में आयोजित परिवार बैठक में उपस्थित रहें।\n\nधन्यवाद।\n- रेवंतराम भाटी (संचालक)\n📞 8696663615`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="px-3 pb-8 space-y-3">
      {/* 1. Ancestor Punyatithi Homage Card (श्रद्धांजलि कार्ड - Auto Featured) */}
      {todayAncestorTribute && (
        <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 text-white rounded-3xl p-4 shadow-xl border-2 border-amber-400/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1.5 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              <Flower2 className="w-3.5 h-3.5 text-amber-300" />
              <span>वार्षिक पुण्य-तिथि • विनम्र श्रद्धांजलि</span>
            </span>
            <span className="text-[10px] text-amber-200">
              {todayAncestorTribute.demiseDate}
            </span>
          </div>

          <div className="flex items-center gap-3.5 my-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-800 border-2 border-amber-300/80 flex items-center justify-center text-2xl font-black text-amber-100 shadow-md shrink-0">
              🙏
            </div>
            <div>
              <h3 className="text-base font-extrabold text-amber-200 leading-tight">
                {todayAncestorTribute.name}
              </h3>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">
                {todayAncestorTribute.relation}
              </p>
              <p className="text-[11px] text-amber-100/90 italic mt-1 leading-relaxed">
                "{todayAncestorTribute.memorialMessage}"
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-300">
              समस्त भाटी परिवार कुचेरा की ओर से शत-शत नमन
            </span>
            <button
              onClick={() => handleShareHomage(todayAncestorTribute)}
              className="py-1 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-[11px] flex items-center gap-1 shadow-sm active:scale-95 transition cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>व्हाट्सएप पर श्रद्धांजलि दें</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Tomorrow Amavasya Alert Notice Banner */}
      {isTomorrowAmavasya && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-3.5 border border-amber-400/30 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5 fill-amber-300/20" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-300">
                कल पावन अमावस्या है! 🌙 (सत्संग व अंशदान दिवस)
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                समस्त सदस्यों से अनुरोध है कि अपनी मासिक सहयोग राशि समय पर जमा करवाएं।
              </p>
            </div>
          </div>

          <button
            onClick={handleShareAmavasyaNotice}
            className="py-1.5 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-[11px] flex items-center gap-1 shadow-sm shrink-0 active:scale-95 transition cursor-pointer"
          >
            <Share2 className="w-3 h-3" />
            <span>व्हाट्सएप सूचना</span>
          </button>
        </div>
      )}

      {/* 3. Calendar Month Header */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              नवंबर 2026 • वैदिक पंचांग
            </h3>
            <p className="text-[11px] text-amber-600 font-bold">
              कार्तिक - मार्गशीर्ष | वि. संवत 2083
            </p>
          </div>

          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-xl border border-blue-200">
            आज: {new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* Sub-Tabs */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'festivals', label: 'हिंदू पर्व व त्यौहार' },
            { id: 'amavasya', label: 'अमावस्या सूची' },
            { id: 'ancestors', label: 'पूर्वज पुण्य-तिथि' },
            { id: 'familyDates', label: 'जन्मदिन व वर्षगांठ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab Content */}
      {activeSubTab === 'festivals' && (
        <div className="space-y-2">
          {festivals.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-slate-900">{f.name}</h4>
                    {f.isAmavasya && (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md">
                        अमावस्या
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    तिथि: <span className="font-semibold text-slate-700">{f.tithi}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{f.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-black text-slate-800 text-xs">{f.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'amavasya' && (
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5 text-xs">
          <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-amber-500" />
            <span>वार्षिक अमावस्या व सत्संग कैलेंडर (कुचेरा)</span>
          </h4>
          <p className="text-[11px] text-slate-500">
            प्रत्येक अमावस्या को परिवार हित, गो-सेवा एवं आकस्मिक सहायता हेतु अंशदान संग्रह किया जाता है।
          </p>

          <div className="divide-y divide-slate-100">
            {[
              { date: '9 नवंबर 2026', month: 'कार्तिक अमावस्या (आगामी)', status: 'सत्संग व अंशदान बैठक' },
              { date: '9 दिसंबर 2026', month: 'मार्गशीर्ष अमावस्या', status: 'गो-सेवा एवं दान' },
              { date: '8 जनवरी 2027', month: 'पौष अमावस्या', status: 'मासिक बैठक' },
              { date: '6 फरवरी 2027', month: 'माघ (मौनी) अमावस्या', status: 'विशेष धर्मार्थ दिवस' },
            ].map((am, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-slate-900">{am.month}</p>
                  <p className="text-[11px] text-slate-500">{am.status}</p>
                </div>
                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-[11px]">
                  {am.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'ancestors' && (
        <div className="space-y-2">
          {ancestors.map((anc) => (
            <div
              key={anc.id}
              className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base shrink-0 mt-0.5">
                  🙏
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900">{anc.name}</h4>
                  <p className="text-[11px] text-slate-500">{anc.relation} • पुण्यतिथि: {anc.demiseDate}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 italic">"{anc.memorialMessage}"</p>
                </div>
              </div>

              <button
                onClick={() => handleShareHomage(anc)}
                className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Share2 className="w-3 h-3 text-amber-600" />
                <span>शेयर</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'familyDates' && (
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs space-y-2 text-xs">
          <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>इस माह (नवंबर) के जन्मदिन व विवाह वर्षगांठ</span>
          </h4>

          {currentMonthEvents.length === 0 ? (
            <p className="text-slate-400 text-xs py-3 text-center">इस माह में कोई तारीख नहीं है।</p>
          ) : (
            currentMonthEvents.map((m) => (
              <div key={m.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{m.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {m.anniversary && m.anniversary.includes('-11-') ? `💍 विवाह वर्षगांठ: ${m.anniversary}` : `🎂 जन्मदिन: ${m.dob}`}
                  </p>
                </div>
                <a
                  href={`https://wa.me/91${m.mobile}?text=${encodeURIComponent(`💐 युवा शक्ति ग्रुप (कुचेरा) की ओर से आपको पावन दिन की हार्दिक बधाई व अशेष मंगलकामनाएं!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1 px-2.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                >
                  बधाई दें
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
