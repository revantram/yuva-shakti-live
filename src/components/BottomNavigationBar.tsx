import React from 'react';
import { Users, FileText, Calendar, QrCode, GitMerge, Settings } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavigationBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingDuesCount?: number;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  onSelectTab,
  pendingDuesCount = 0,
}) => {
  const navItems = [
    { id: 'members' as TabType, label: 'सदस्य', icon: Users, badge: pendingDuesCount > 0 ? pendingDuesCount : undefined },
    { id: 'ledger' as TabType, label: 'खर्च', icon: FileText },
    { id: 'calendar' as TabType, label: 'पंचांग', icon: Calendar },
    { id: 'contributions' as TabType, label: 'जमा राशि', icon: QrCode },
    { id: 'ancestors' as TabType, label: 'वंशावली', icon: GitMerge },
    { id: 'about' as TabType, label: 'सेटिंग्स', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-2xl py-1.5 px-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'ledger' && activeTab === 'visarjan') ||
            (item.id === 'about' && activeTab === 'suvichar');

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative interactive-tap select-none cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-102 nav-item-active'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-black px-1 rounded-full border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-white' : 'text-slate-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
