import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Calendar, Heart, Shield } from 'lucide-react';
import { Member } from '../types';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
  memberToEdit?: Member | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  memberToEdit,
}) => {
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    nameEnglish: '',
    relation: 'सदस्य',
    fatherOrSpouse: '',
    mobile: '',
    whatsapp: '',
    instagram: '',
    dob: '',
    anniversary: '',
    address: 'कुचेरा (नागौर)',
    category: 'youth',
    isSelf: false,
  });

  useEffect(() => {
    if (memberToEdit) {
      setFormData(memberToEdit);
    } else {
      setFormData({
        name: '',
        nameEnglish: '',
        relation: 'सदस्य',
        fatherOrSpouse: '',
        mobile: '',
        whatsapp: '',
        instagram: '',
        dob: '',
        anniversary: '',
        address: 'कुचेरा (नागौर)',
        category: 'youth',
        isSelf: false,
      });
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const newMember: Member = {
      id: memberToEdit?.id || `m-${Date.now()}`,
      name: formData.name.trim(),
      nameEnglish: formData.nameEnglish?.trim() || '',
      relation: formData.relation?.trim() || 'सदस्य',
      fatherOrSpouse: formData.fatherOrSpouse?.trim() || '',
      mobile: formData.mobile?.trim() || '',
      whatsapp: formData.whatsapp?.trim() || formData.mobile?.trim() || '',
      instagram: formData.instagram?.trim() || '',
      dob: formData.dob || '',
      anniversary: formData.anniversary || '',
      address: formData.address?.trim() || 'कुचेरा (नागौर)',
      category: (formData.category as Member['category']) || 'executive',
      isSelf: !!formData.isSelf,
      octoberPaid: memberToEdit?.octoberPaid ?? true,
      octoberAmount: memberToEdit?.octoberAmount ?? 50,
      novemberPaid: memberToEdit?.novemberPaid ?? false,
      novemberAmount: memberToEdit?.novemberAmount ?? 0,
    };

    onSave(newMember);
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
            <User className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">
              {memberToEdit ? 'सदस्य विवरण संशोधित करें' : 'नया परिवार सदस्य जोड़ें'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                पूरा नाम (हिंदी) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. रेवंत राम भाटी"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                नाम (अंग्रेजी)
              </label>
              <input
                type="text"
                placeholder="e.g. Revant Ram Bhati"
                value={formData.nameEnglish || ''}
                onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                पिता / पति का नाम
              </label>
              <input
                type="text"
                placeholder="उदा. श्री हरकिशन जी भाटी"
                value={formData.fatherOrSpouse || ''}
                onChange={(e) => setFormData({ ...formData, fatherOrSpouse: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                पद / संबंध / श्रेणी
              </label>
              <select
                value={formData.relation || 'सदस्य'}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="मुखिया / वरिष्ठ">मुखिया / वरिष्ठ संरक्षक</option>
                <option value="व्यवस्थापक / एडमिन">व्यवस्थापक / एडमिन</option>
                <option value="कोषाध्यक्ष">कोषाध्यक्ष</option>
                <option value="सक्रिय युवा सदस्य">सक्रिय युवा सदस्य</option>
                <option value="सदस्य">साधारण सदस्य</option>
                <option value="विद्यार्थी">विद्यार्थी / छात्र</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                मोबाइल नंबर (कॉल हेतु)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="9829012345"
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                व्हाट्सएप नंबर
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-emerald-500" />
                <input
                  type="tel"
                  placeholder="9829012345"
                  value={formData.whatsapp || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                जन्मतिथि (Birthdate)
              </label>
              <input
                type="date"
                value={formData.dob || ''}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                वैवाहिक वर्षगांठ (Anniversary)
              </label>
              <input
                type="date"
                value={formData.anniversary || ''}
                onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                निवास स्थान / पता
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="उदा. भाटी मोहल्ला, कुचेरा"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                इंस्टाग्राम यूजरनेम
              </label>
              <div className="relative">
                <InstagramIcon className="w-4 h-4 absolute left-3 top-2.5 text-pink-500" />
                <input
                  type="text"
                  placeholder="उदा. revantram_bhati"
                  value={formData.instagram || ''}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">क्या यह आपकी स्वयं की प्रोफाइल है?</p>
              <p className="text-[11px] text-slate-500">इस प्रोफाइल पर 'आप' (Self) का बैज दिखेगा।</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.isSelf}
                onChange={(e) => setFormData({ ...formData, isSelf: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 active:scale-95 transition cursor-pointer"
            >
              सुरक्षित करें (Save)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
