import { AmavasyaCountdown } from '../types';

// Approximate Amavasya dates for 2026/2027 (Hindu Calendar New Moon dates)
const KNOWN_AMAVASYA_DATES = [
  '2026-01-18',
  '2026-02-17',
  '2026-03-19',
  '2026-04-17',
  '2026-05-16',
  '2026-06-15',
  '2026-07-14',
  '2026-08-12',
  '2026-09-11',
  '2026-10-10',
  '2026-11-09',
  '2026-12-09',
  '2027-01-08',
  '2027-02-06',
  '2027-03-08',
  '2027-04-06',
  '2027-05-06',
  '2027-06-04',
];

export function getNextAmavasyaCountdown(): AmavasyaCountdown {
  const now = new Date();
  
  // Find next Amavasya that is in the future or today
  let targetDate = KNOWN_AMAVASYA_DATES
    .map(d => new Date(`${d}T09:00:00`))
    .find(d => d.getTime() > now.getTime() - 24 * 60 * 60 * 1000);

  if (!targetDate) {
    // Fallback: 29.53 days from now
    targetDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  }

  const diffMs = targetDate.getTime() - now.getTime();
  const isToday = Math.abs(diffMs) < 24 * 60 * 60 * 1000 && targetDate.getDate() === now.getDate();

  if (diffMs <= 0 && isToday) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      dateStr: formatDateHindi(targetDate),
      isToday: true,
    };
  }

  const effectiveMs = Math.max(0, diffMs);
  const days = Math.floor(effectiveMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((effectiveMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((effectiveMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((effectiveMs % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    dateStr: formatDateHindi(targetDate),
    isToday,
  };
}

export function formatDateHindi(date: Date): string {
  const monthsHindi = [
    'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];
  const d = date.getDate();
  const m = monthsHindi[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}
