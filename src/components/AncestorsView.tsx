import React, { useState } from 'react';
import { GitMerge, Heart, Share2, Flower2, Sparkles, Plus, Award } from 'lucide-react';
import { Ancestor } from '../types';
import confetti from 'canvas-confetti';

interface AncestorsViewProps {
  ancestors: Ancestor[];
}

export const AncestorsView: React.FC<AncestorsViewProps> = ({ ancestors }) => {
  const [tributeCount, setTributeCount] = useState<Record<string, number>>({});

  const handleOfferFlower = (id: string) => {
    setTributeCount((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#ffffff'],
        origin: { y: 0.7 },
      });
    } catch {}
  };

  const handleShareHomage = (anc: Ancestor) => {
    const text = `🙏 *आदरणीय पूर्वज पुण्य-तिथि श्रद्धांजलि* 🙏\n*युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा)*\n\nपरम पूज्य पूर्वज *${anc.name}* (${anc.relation})\nपुण्य-तिथि: ${anc.demiseDate}\n\n"${anc.memorialMessage}"\n\nसमस्त भाटी परिवार कुचेरा की ओर से उनके पावन चरणों में शत-शत नमन एवं विनम्र श्रद्धांजलि।`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="px-3 pb-8 space-y-3">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 text-white rounded-3xl p-5 shadow-xl border border-amber-400/30 text-center relative overflow-hidden">
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-amber-800 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-lg mb-2.5">
          🌳
        </div>
        <h2 className="text-base sm:text-lg font-black text-amber-300">
          भाटी परिवार कुचेरा वंशावली व पूर्वज
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
          "जिनके आदर्श, संस्कार और आशीर्वाद से हमारा परिवार संगठित, समृद्ध और सेवा-भावी है।"
        </p>
      </div>

      {/* Lineage Tree Header Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <GitMerge className="w-4 h-4 text-blue-600" />
          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
            कुचेरा भाटी वंश कुल परंपरा
          </h4>
        </div>

        <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs text-amber-950 space-y-1">
          <p className="font-black text-amber-900">🚩 कुल देवी / इष्ट देव:</p>
          <p className="text-[11px] text-slate-700">
            श्री स्वांगिया माता जी • बाबा रामदेव जी महाराज
          </p>
          <p className="font-black text-amber-900 pt-1">📍 मूल स्थान:</p>
          <p className="text-[11px] text-slate-700">
            भाटी मोहल्ला, कुचेरा (तहसील: खींवसर / नागौर, राजस्थान)
          </p>
        </div>
      </div>

      {/* Ancestor Homage Cards */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider px-1">
          आदरणीय पूर्वज स्मृति व श्रद्धांजलि
        </h3>

        {ancestors.map((anc) => (
          <div
            key={anc.id}
            className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3 interactive-tap"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-amber-700 text-white flex items-center justify-center text-xl font-bold shadow-sm shrink-0 border border-amber-200">
                  🙏
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900 leading-tight">
                    {anc.name}
                  </h4>
                  <p className="text-[11px] font-bold text-amber-800">
                    {anc.relation}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    पुण्य-तिथि: {anc.demiseDate}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                अमर स्मृति
              </span>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 italic leading-relaxed">
              "{anc.memorialMessage}"
            </p>

            {/* Action Bar: Pushpanjali & WhatsApp Tribute */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleOfferFlower(anc.id)}
                className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Flower2 className="w-3.5 h-3.5 text-amber-600" />
                <span>पुष्पांजलि अर्पित करें</span>
                {tributeCount[anc.id] ? (
                  <span className="text-[10px] bg-amber-200 px-1.5 py-0.2 rounded-full font-black">
                    +{tributeCount[anc.id]}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => handleShareHomage(anc)}
                className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>श्रद्धांजलि शेयर</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
