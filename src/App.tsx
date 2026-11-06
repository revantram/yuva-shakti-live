import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { AmavasyaCard } from './components/AmavasyaCard';
import { NavigationPills } from './components/NavigationPills';
import { BottomNavigationBar } from './components/BottomNavigationBar';
import { NoticeBoard } from './components/NoticeBoard';
import { MembersView } from './components/MembersView';
import { MemberModal } from './components/MemberModal';
import { LedgerView } from './components/LedgerView';
import { VisarjanView } from './components/VisarjanView';
import { CalendarView } from './components/CalendarView';
import { AncestorsView } from './components/AncestorsView';
import { TransactionModal } from './components/TransactionModal';
import { SuvicharGenerator } from './components/SuvicharGenerator';
import { ContributionsView } from './components/ContributionsView';
import { AboutView } from './components/AboutView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { UpdateModal } from './components/UpdateModal';
import { UpdateBanner } from './components/UpdateBanner';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { checkForUpdates, UpdateCheckResult } from './utils/updateManager';

import {
  INITIAL_11_MEMBERS,
  INITIAL_VISARJAN_EXPENSES,
  INITIAL_VISARJAN_METRICS,
  INITIAL_ANCESTORS,
  INITIAL_FESTIVALS_2026,
  INITIAL_SUVICHAR,
  SANCHALAK_INFO,
} from './data/initialData';
import { Member, Transaction, VisarjanItem, TabType, DigitalReceiptData } from './types';

import { initNotificationServiceWorker, requestNotificationPermissionAndGetToken, triggerLocalNotification } from './utils/fcm';
import { Plus, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  // Members State
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('ysg_members_v2');
      return saved ? JSON.parse(saved) : INITIAL_11_MEMBERS;
    } catch {
      return INITIAL_11_MEMBERS;
    }
  });

  // Base Available Opening Fund (₹2,905 by default as in user's screenshot)
  const [baseFund, setBaseFund] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ysg_base_fund');
      return saved ? Number(saved) : 2905;
    } catch {
      return 2905;
    }
  });

  // Visarjan Metrics (चंदा व आरती आय: 16,400, कुल खर्च: 15,210, बाकी: 1,190)
  const [visarjanMetrics, setVisarjanMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem('ysg_visarjan_metrics');
      return saved ? JSON.parse(saved) : INITIAL_VISARJAN_METRICS;
    } catch {
      return INITIAL_VISARJAN_METRICS;
    }
  });

  // Visarjan Expenses State (39 items)
  const [visarjanItems, setVisarjanItems] = useState<VisarjanItem[]>(() => {
    try {
      const saved = localStorage.getItem('ysg_visarjan_items');
      return saved ? JSON.parse(saved) : INITIAL_VISARJAN_EXPENSES;
    } catch {
      return INITIAL_VISARJAN_EXPENSES;
    }
  });

  // General Ledger Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('ysg_transactions');
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  // Navigation: Default to 'ledger' or 'members'
  const [activeTab, setActiveTab] = useState<TabType>('ledger');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('ysg_is_admin') === 'true';
  });

  // Dynamic Compact Header on Scroll
  const [isHeaderCompact, setIsHeaderCompact] = useState<boolean>(false);

  // Pull to refresh simulated state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txDefaultType, setTxDefaultType] = useState<'jama' | 'kharch'>('jama');

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [isUpdateBannerDismissed, setIsUpdateBannerDismissed] = useState<boolean>(false);

  // Digital Receipt Modal
  const [receiptData, setReceiptData] = useState<DigitalReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Scroll event for dynamic compact header
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderCompact(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize PWA Service Worker & Request Notification Permission & Check Updates
  useEffect(() => {
    initNotificationServiceWorker();
    requestNotificationPermissionAndGetToken();

    const timer = setTimeout(async () => {
      try {
        const info = await checkForUpdates();
        setUpdateInfo(info);
      } catch (e) {
        console.warn('Startup update check failed:', e);
      }
    }, 2500);

    const interval = setInterval(async () => {
      try {
        const info = await checkForUpdates();
        setUpdateInfo(info);
      } catch {}
    }, 30 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('ysg_members_v2', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('ysg_base_fund', baseFund.toString());
  }, [baseFund]);

  useEffect(() => {
    localStorage.setItem('ysg_visarjan_metrics', JSON.stringify(visarjanMetrics));
  }, [visarjanMetrics]);

  useEffect(() => {
    localStorage.setItem('ysg_visarjan_items', JSON.stringify(visarjanItems));
  }, [visarjanItems]);

  useEffect(() => {
    localStorage.setItem('ysg_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ysg_is_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Pull to refresh handler
  const handlePullRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      try {
        confetti({ particleCount: 20, spread: 40, origin: { y: 0.1 } });
      } catch {}
    }, 800);
  };

  // Member CRUD
  const handleSaveMember = (member: Member) => {
    setMembers((prev) => {
      const idx = prev.findIndex((m) => m.id === member.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = member;
        return updated;
      }
      return [member, ...prev];
    });
  };

  const handleDeleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // 🚩 CORE FUNCTIONALITY:
  // "Jab bhi Koi sadasya paise jama karen to usmein counting honi chahie sabse upar 2905 rupaye Hai unmen vah paise add hone chahie"
  const handleUpdateMemberDue = (
    memberId: string,
    month: 'october' | 'november',
    paid: boolean,
    amount: number
  ) => {
    const memberObj = members.find((m) => m.id === memberId);
    const effectiveAmount = amount > 0 ? amount : 50;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          if (month === 'november') {
            return { ...m, novemberPaid: paid, novemberAmount: effectiveAmount };
          } else {
            return { ...m, octoberPaid: paid, octoberAmount: effectiveAmount };
          }
        }
        return m;
      })
    );

    // If paid is marked true, also record a Jama transaction so counting counts up directly in ₹2,905!
    if (paid && memberObj) {
      const now = new Date();
      const newTx: Transaction = {
        id: `tx-due-${Date.now()}-${memberId}`,
        date: now.toISOString().split('T')[0],
        type: 'jama',
        amount: effectiveAmount,
        description: `${month === 'november' ? 'कार्तिक' : 'अश्विन'} अमावस्या अंशदान`,
        memberName: memberObj.name,
        paymentMode: 'PhonePe',
        receiptNumber: `YSG-${month.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      };

      setTransactions((prev) => [newTx, ...prev]);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
        });
      } catch {}
    }
  };

  // Open Generated Digital Receipt
  const handleGenerateReceipt = (receipt: DigitalReceiptData) => {
    setReceiptData(receipt);
    setIsReceiptModalOpen(true);
  };

  // Transaction CRUD
  const handleSaveTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);

    // Also trigger digital receipt for Jama
    if (tx.type === 'jama') {
      const receipt: DigitalReceiptData = {
        receiptNo: tx.receiptNumber || `YSG-${Date.now().toString().slice(-4)}`,
        memberName: tx.memberName || 'अज्ञात सदस्य',
        mobile: '',
        amount: tx.amount,
        month: 'कार्तिक अमावस्या अंशदान',
        dateStr: tx.date,
        timeStr: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
        paymentMode: tx.paymentMode,
        issuerName: SANCHALAK_INFO.name,
        issuerRole: 'मुख्य संचालक',
        notes: tx.description,
      };
      setReceiptData(receipt);
      setIsReceiptModalOpen(true);

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Visarjan CRUD
  const handleAddVisarjanItem = (item: VisarjanItem) => {
    setVisarjanItems((prev) => [item, ...prev]);
  };

  const handleDeleteVisarjanItem = (id: string) => {
    setVisarjanItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Admin Auth (PIN: 869666 or 1234)
  const handleAdminLogin = (pin: string) => {
    if (pin === SANCHALAK_INFO.pin || pin === '1234' || pin === '869666') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  // Push Broadcast triggers
  const handleSendSuvicharBroadcast = () => {
    triggerLocalNotification(
      '🚩 आज का सुविचार • युवा शक्ति ग्रुप',
      'संगठन में ही शक्ति है... - प्रेषक: रेवंतराम भाटी'
    );
  };

  const handleSendDuesBroadcast = () => {
    triggerLocalNotification(
      '⏰ बकाया अंशदान स्मरण • युवा शक्ति ग्रुप',
      'जय श्री राम! कल पावन अमावस्या है। कृपया अपना मासिक अंशदान समय पर PhonePe/UPI (7850983600@ibl) से जमा कराएं।'
    );
  };

  const handleSendMeetingBroadcast = () => {
    triggerLocalNotification(
      '🌙 कल अमावस्या की पावन बैठक • युवा शक्ति ग्रुप',
      'कल अमावस्या की पावन बैठक है। सभी परिवारजन समय पर अपनी उपस्थिति दर्ज कराएं।'
    );
  };

  const handleSendAncestorBroadcast = () => {
    triggerLocalNotification(
      '🙏 आदरणीय पूर्वज पुण्य-तिथि श्रद्धांजलि',
      'आज हमारे आदरणीय पूर्वज की पुण्य-तिथि है। परिवार की ओर से उन्हें भावभीनी श्रद्धांजलि।'
    );
  };

  // Pending November count
  const pendingNovemberCount = members.filter((m) => (m.category === 'executive' || m.id.startsWith('m-')) && !m.novemberPaid).length;

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-slate-900 pb-20 select-none">
      <div className="max-w-md mx-auto">
        {/* Dynamic Compact Glass Header matching Screenshot */}
        <Header
          isAdmin={isAdmin}
          onAdminClick={() => setIsAdminModalOpen(true)}
          onUpdateClick={() => setIsUpdateModalOpen(true)}
          onShareClick={() => {
            const text = `🚩 युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा) आधिकारिक मोबाइल ऐप\nhttps://ais-pre-egblcvfs5exouv6zqqljpf-507192586860.asia-southeast1.run.app/YuvaShaktiGroup.apk`;
            if (navigator.share) {
              navigator.share({ title: 'युवा शक्ति ग्रुप ऐप', text }).catch(() => {});
            } else {
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }
          }}
          onNotificationClick={() => setIsAdminModalOpen(true)}
          hasUpdate={Boolean(updateInfo?.hasUpdate)}
          isCompact={isHeaderCompact}
        />

        {/* Parivar Notice Board & Ticker (परिवार मुख्य सूचना पट्टी) */}
        <NoticeBoard isAdmin={isAdmin} />

        {/* Floating Auto-Update Available Banner */}
        <UpdateBanner
          updateInfo={isUpdateBannerDismissed ? null : updateInfo}
          onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
          onDismiss={() => setIsUpdateBannerDismissed(true)}
        />

        {/* Pull To Refresh Indicator */}
        {isRefreshing && (
          <div className="mx-3 my-2 p-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>डेटा ताज़ा हो रहा है...</span>
          </div>
        )}

        {/* Top Horizontal Navigation Pills for fast switching */}
        <NavigationPills
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          memberCount={members.length}
        />

        {/* Active Tab View */}
        <main className="mt-1">
          {activeTab === 'members' && (
            <MembersView
              members={members}
              isAdmin={isAdmin}
              baseFund={baseFund}
              onAddMember={() => {
                setMemberToEdit(null);
                setIsMemberModalOpen(true);
              }}
              onEditMember={(member) => {
                setMemberToEdit(member);
                setIsMemberModalOpen(true);
              }}
              onDeleteMember={handleDeleteMember}
              onUpdateMemberDue={handleUpdateMemberDue}
              onGenerateReceipt={handleGenerateReceipt}
            />
          )}

          {activeTab === 'ledger' && (
            <LedgerView
              transactions={transactions}
              visarjanItems={visarjanItems}
              members={members}
              isAdmin={isAdmin}
              baseFund={baseFund}
              onUpdateBaseFund={setBaseFund}
              onOpenAddModal={(type) => {
                setTxDefaultType(type);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onAddVisarjanItem={handleAddVisarjanItem}
              onDeleteVisarjanItem={handleDeleteVisarjanItem}
              visarjanMetrics={visarjanMetrics}
              onUpdateVisarjanMetrics={setVisarjanMetrics}
            />
          )}

          {activeTab === 'visarjan' && (
            <VisarjanView
              items={visarjanItems}
              isAdmin={isAdmin}
              onAddItem={handleAddVisarjanItem}
              onDeleteItem={handleDeleteVisarjanItem}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              festivals={INITIAL_FESTIVALS_2026}
              ancestors={INITIAL_ANCESTORS}
              members={members}
            />
          )}

          {activeTab === 'contributions' && (
            <ContributionsView
              onOpenLedgerEntry={() => {
                setTxDefaultType('jama');
                setIsTxModalOpen(true);
              }}
            />
          )}

          {activeTab === 'ancestors' && (
            <AncestorsView ancestors={INITIAL_ANCESTORS} />
          )}

          {activeTab === 'suvichar' && (
            <SuvicharGenerator quotes={INITIAL_SUVICHAR} />
          )}

          {activeTab === 'about' && <AboutView />}
        </main>
      </div>

      {/* Floating Action Button (FAB) for Fast Quick Deposit / Entry */}
      <div className="fixed bottom-16 right-4 z-40">
        <button
          onClick={() => {
            setTxDefaultType('jama');
            setIsTxModalOpen(true);
          }}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/40 border-2 border-white/80 active:scale-90 transition cursor-pointer interactive-tap"
          title="त्वरित जमा प्रविष्टि जोड़ें"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Navigation Bar (Matching Screenshot with 6 Items) */}
      <BottomNavigationBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingDuesCount={pendingNovemberCount}
      />

      {/* Member Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        onSave={handleSaveMember}
        memberToEdit={memberToEdit}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        members={members}
        defaultType={txDefaultType}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        onSendSuvicharBroadcast={handleSendSuvicharBroadcast}
        onSendDuesBroadcast={handleSendDuesBroadcast}
        onSendMeetingBroadcast={handleSendMeetingBroadcast}
        onSendAncestorBroadcast={handleSendAncestorBroadcast}
      />

      {/* Update & APK Download Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        isAdmin={isAdmin}
      />

      {/* Digital Receipt Card Modal */}
      <DigitalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={receiptData}
      />
    </div>
  );
};

export default App;
