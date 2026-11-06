export type TabType = 
  | 'members' 
  | 'ledger' 
  | 'visarjan'
  | 'calendar'
  | 'contributions' 
  | 'ancestors'
  | 'suvichar' 
  | 'about';

export interface Member {
  id: string;
  name: string;
  nameEnglish?: string;
  relation: string; // e.g. "मुख्य कार्यकारिणी", "संरक्षक", "युवा सदस्य"
  fatherOrSpouse: string;
  mobile: string;
  whatsapp?: string;
  instagram?: string;
  dob?: string;
  anniversary?: string;
  address: string;
  photoUrl?: string;
  isSelf?: boolean;
  category: 'executive' | 'elder' | 'youth' | 'extended';
  octoberPaid: boolean;
  octoberAmount: number;
  novemberPaid: boolean;
  novemberAmount: number;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'jama' | 'kharch'; // jama = income, kharch = expense
  amount: number;
  description: string;
  memberName?: string;
  spentBy?: string;
  paymentMode: 'PhonePe' | 'Google Pay' | 'UPI' | 'नकद (Cash)' | 'बैंक ट्रांसफर' | 'उधार / बिल बकाया';
  notes?: string;
  receiptNumber?: string;
  isVisarjan?: boolean;
}

export interface VisarjanItem {
  id: string;
  date: string;
  item: string;
  amount: number;
  spentBy: string;
  paymentMode: string;
  receiptNumber?: string;
}

export interface Ancestor {
  id: string;
  name: string;
  relation: string;
  demiseDate: string; // YYYY-MM-DD
  photoUrl?: string;
  memorialMessage: string;
}

export interface HinduFestival {
  date: string;
  name: string;
  tithi: string;
  description: string;
  isAmavasya?: boolean;
}

export interface DigitalReceiptData {
  receiptNo: string;
  memberName: string;
  mobile: string;
  amount: number;
  month: string;
  dateStr: string;
  timeStr: string;
  paymentMode: string;
  issuerName: string;
  issuerRole: string;
  notes?: string;
}

export interface AmavasyaCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  dateStr: string;
  isToday: boolean;
}

export interface SuvicharCard {
  id: string;
  text: string;
  category: string;
  author?: string;
}
