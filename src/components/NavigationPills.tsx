import React from 'react';
import { Users, BookOpen, Image, QrCode, Info, Sparkles, Calendar } from 'lucide-react';
import { TabType } from '../types';

interface NavigationPillsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  memberCount: number;
}

interface TabItem {
  id: TabType;
  label: string;
  count?: number;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NavigationPills: React.FC<NavigationPillsProps> = ({
  activeTab,
  onSelectTab,
  memberCount,
}) => {
  const tabs: TabItem[] = [
    { id: 'members', label: 'सदस्य व पासबुक', count: 11, icon: Users },
    { id: 'ledger', label: 'बही-खाता (खर्च)', icon: BookOpen },
    { id: 'visarjan', label: 'गणेश विसर्जन', badge: 'विशेष', icon: Sparkles },
    { id: 'calendar', label: 'पंचांग व श्रद्धांजलि', icon: Calendar },
    { id: 'contributions', label: 'अंशदान (PhonePe/UPI)', icon: QrCode },
    { id: 'suvichar', label: 'सुविचार पोस्टर', icon: Image },
    { id: 'about', label: 'संचालक व ग्रुप', icon: Info },
  ];

  return (
    <div className="flex gap-2 px-3 py-1.5 overflow-x-auto no-scrollbar scroll-smooth mb-2.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 shrink-0 ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-500 scale-100'
                : 'bg-white/90 backdrop-blur-md text-slate-700 hover:bg-white border border-slate-200/90 shadow-xs'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5 ${
                  isActive ? 'bg-blue-700/80 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
