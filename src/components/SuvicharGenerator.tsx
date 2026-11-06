import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Download, Share2, Copy, Check, Palette, User, Phone, Upload, Camera } from 'lucide-react';
import { SuvicharCard } from '../types';
import { SANCHALAK_INFO } from '../data/initialData';

interface SuvicharGeneratorProps {
  quotes: SuvicharCard[];
}

export const SuvicharGenerator: React.FC<SuvicharGeneratorProps> = ({ quotes }) => {
  const [selectedQuote, setSelectedQuote] = useState<string>(quotes[0]?.text || '');
  const [customText, setCustomText] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(SANCHALAK_INFO.name);
  const [senderMobile, setSenderMobile] = useState<string>(SANCHALAK_INFO.phone);
  const [senderRole, setSenderRole] = useState<string>('मुख्य संचालक');
  const [senderPhotoUrl, setSenderPhotoUrl] = useState<string>('');
  const [theme, setTheme] = useState<'saffron' | 'royal' | 'gold' | 'emerald'>('saffron');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeText = customText.trim() || selectedQuote;

  const themes = {
    saffron: {
      bg1: '#ea580c',
      bg2: '#9a3412',
      accent: '#fef08a',
      border: '#fed7aa',
      text: '#ffffff',
      tagBg: '#c2410c',
    },
    royal: {
      bg1: '#1e3a8a',
      bg2: '#0f172a',
      accent: '#38bdf8',
      border: '#93c5fd',
      text: '#ffffff',
      tagBg: '#1e40af',
    },
    gold: {
      bg1: '#b45309',
      bg2: '#78350f',
      accent: '#fef08a',
      border: '#fde68a',
      text: '#ffffff',
      tagBg: '#92400e',
    },
    emerald: {
      bg1: '#047857',
      bg2: '#064e3b',
      accent: '#a7f3d0',
      border: '#6ee7b7',
      text: '#ffffff',
      tagBg: '#065f46',
    },
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSenderPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Render poster on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    const currentTheme = themes[theme];

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, currentTheme.bg1);
    gradient.addColorStop(1, currentTheme.bg2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative Borders
    ctx.strokeStyle = currentTheme.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(26, 26, width - 52, height - 52);

    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Header Title
    ctx.fillStyle = currentTheme.accent;
    ctx.font = 'bold 34px "Noto Sans Devanagari", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚩 युवा शक्ति ग्रुप 🚩', width / 2, 90);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 21px "Noto Sans Devanagari", sans-serif';
    ctx.fillText('भाटी परिवार • कुचेरा (नागौर)', width / 2, 126);

    // Top Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(100, 150);
    ctx.lineTo(width - 100, 150);
    ctx.stroke();

    // Central Quote text formatting (word wrap)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 31px "Noto Sans Devanagari", sans-serif';
    ctx.textAlign = 'center';

    const words = activeText.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 150 && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = 46;
    const totalTextHeight = lines.length * lineHeight;
    let startY = 320 - totalTextHeight / 2;

    lines.forEach((line) => {
      ctx.fillText(line, width / 2, startY);
      startY += lineHeight;
    });

    // Today Date
    const todayStr = new Date().toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    ctx.fillStyle = currentTheme.accent;
    ctx.font = '600 17px "Noto Sans Devanagari", sans-serif';
    ctx.fillText(`दिनांक: ${todayStr}`, width / 2, 575);

    // Bottom Sender Info Box
    const boxY = 620;
    const boxHeight = 210;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.roundRect(60, boxY, width - 120, boxHeight, 20);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sender Avatar (Photo or Default Initial)
    const avatarCenterX = 150;
    const avatarCenterY = boxY + boxHeight / 2;
    const avatarRadius = 60;

    const drawSenderDetails = () => {
      // Text next to avatar
      ctx.textAlign = 'left';
      
      // Role Tag
      ctx.fillStyle = currentTheme.accent;
      ctx.font = 'bold 15px "Noto Sans Devanagari", sans-serif';
      ctx.fillText(`★ ${senderRole} ★`, 240, avatarCenterY - 35);

      // Sender Name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Noto Sans Devanagari", sans-serif';
      ctx.fillText(senderName, 240, avatarCenterY + 2);

      // Mobile Number
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 22px "Inter", "Noto Sans Devanagari", sans-serif';
      ctx.fillText(`📞 +91 ${senderMobile}`, 240, avatarCenterY + 38);

      // Subtext
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '14px "Noto Sans Devanagari", sans-serif';
      ctx.fillText('युवा शक्ति ग्रुप • कुचेरा (नागौर)', 240, avatarCenterY + 64);
    };

    if (senderPhotoUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(
          img,
          avatarCenterX - avatarRadius,
          avatarCenterY - avatarRadius,
          avatarRadius * 2,
          avatarRadius * 2
        );
        ctx.restore();

        // Border around photo
        ctx.strokeStyle = currentTheme.accent;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
        ctx.stroke();

        drawSenderDetails();
      };
      img.src = senderPhotoUrl;
    } else {
      // Default circular gradient avatar
      const avGrad = ctx.createLinearGradient(
        avatarCenterX - avatarRadius,
        avatarCenterY - avatarRadius,
        avatarCenterX + avatarRadius,
        avatarCenterY + avatarRadius
      );
      avGrad.addColorStop(0, '#f59e0b');
      avGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = avGrad;
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = currentTheme.accent;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Initial letter in Hindi
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px "Noto Sans Devanagari", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(senderName.charAt(0) || 'भा', avatarCenterX, avatarCenterY + 16);

      drawSenderDetails();
    }
  }, [activeText, senderName, senderMobile, senderRole, senderPhotoUrl, theme]);

  // Clean WhatsApp share text (ZERO extraneous member names!)
  const getCleanShareText = () => {
    return `🚩 *युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा)* 🚩\n\n✨ *आज का प्रेरक सुविचार* ✨\n\n${activeText}\n\n🙏 *प्रेषक:* ${senderName} (${senderRole})\n📞 *मोबाइल:* +91 ${senderMobile}\n📍 कुचेरा (नागौर, राजस्थान)`;
  };

  // Download image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.href = image;
    link.download = `Suvichar_${senderName.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    link.click();
  };

  // WhatsApp share (Direct Clean Text & Photo)
  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanText = getCleanShareText();

    if (navigator.share) {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'suvichar.jpg', { type: 'image/jpeg' });
        try {
          await navigator.share({
            title: 'युवा शक्ति ग्रुप - आज का सुविचार',
            text: cleanText,
            files: [file],
          });
        } catch {
          shareViaWhatsAppWeb(cleanText);
        }
      }, 'image/jpeg');
    } else {
      shareViaWhatsAppWeb(cleanText);
    }
  };

  const shareViaWhatsAppWeb = (text: string) => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCleanShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-3 pb-8">
      {/* Title */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-extrabold text-sm text-slate-900">
            दैनिक सुविचार पोस्टर (फोटो व मोबाइल नंबर सहित)
          </h3>
        </div>
        <p className="text-[11px] text-slate-500">
          पोस्टर पर प्रेषक का नाम, फोटो व मोबाइल नंबर प्रदर्शित होगा। व्हाट्सएप शेयर में केवल सुविचार और आपकी जानकारी जाएगी।
        </p>
      </div>

      {/* Preset Quote Pills */}
      <div className="mb-3">
        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
          सुविचार चुनें या नीचे कस्टम विचार लिखें:
        </label>
        <div className="flex flex-col gap-1.5">
          {quotes.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setSelectedQuote(q.text);
                setCustomText('');
              }}
              className={`p-2.5 rounded-xl text-left text-xs border transition cursor-pointer ${
                selectedQuote === q.text && !customText
                  ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <span className="font-bold text-amber-600">{q.category}</span>
                <span>{q.author}</span>
              </div>
              <p className="line-clamp-2 leading-relaxed">{q.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Text Area */}
      <div className="mb-3">
        <label className="block text-[11px] font-bold text-slate-700 mb-1">
          कस्टम सुविचार / पारिवारिक संदेश लिखें:
        </label>
        <textarea
          rows={2}
          placeholder="उदा. संगठन में ही शक्ति है..."
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Sender Details Form (Name, Mobile, Photo, Role) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 mb-3 space-y-3">
        <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>प्रेषक विवरण (कार्ड पर फोटो, नाम व मोबाइल)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              प्रेषक का नाम *
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              मोबाइल नंबर (कार्ड पर प्रदर्शित) *
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="tel"
                value={senderMobile}
                onChange={(e) => setSenderMobile(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              पद / पदनाम टैग
            </label>
            <input
              type="text"
              value={senderRole}
              onChange={(e) => setSenderRole(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              प्रेषक फोटो (अपनी फोटो लगाएं)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-1.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>{senderPhotoUrl ? 'फोटो बदली गई ✅' : 'फोटो अपलोड करें'}</span>
              </button>
              {senderPhotoUrl && (
                <button
                  type="button"
                  onClick={() => setSenderPhotoUrl('')}
                  className="text-[10px] text-rose-600 hover:underline"
                >
                  हटाएं
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Theme Picker */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>पोस्टर थीम रंग चुनें:</span>
          </label>
          <div className="flex gap-2">
            {[
              { id: 'saffron', label: 'भगवा', bg: 'bg-orange-600' },
              { id: 'royal', label: 'रॉयल ब्लू', bg: 'bg-blue-800' },
              { id: 'gold', label: 'स्वर्ण', bg: 'bg-amber-700' },
              { id: 'emerald', label: 'हरा', bg: 'bg-emerald-700' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={`flex-1 py-1.5 px-1 rounded-xl text-[11px] font-bold text-white flex items-center justify-center transition cursor-pointer ${t.bg} ${
                  theme === t.id ? 'ring-2 ring-offset-2 ring-slate-800 scale-102' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Live Preview */}
      <div className="bg-slate-900 rounded-3xl p-3 mb-3 shadow-xl flex justify-center">
        <canvas
          ref={canvasRef}
          className="w-full max-w-[360px] aspect-[800/900] rounded-2xl shadow-lg border border-white/20"
        />
      </div>

      {/* Action Buttons: WhatsApp Share, Download, Copy */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleShare}
          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>व्हाट्सएप शेयर</span>
        </button>

        <button
          onClick={handleDownload}
          className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>फोटो डाउनलोड</span>
        </button>

        <button
          onClick={handleCopy}
          className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'कॉपी हुआ!' : 'टेक्स्ट कॉपी'}</span>
        </button>
      </div>
    </div>
  );
};
