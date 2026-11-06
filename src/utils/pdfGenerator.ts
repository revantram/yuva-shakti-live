import jsPDF from 'jspdf';
import { Transaction, Member } from '../types';

/**
 * Add subtle background watermark to PDF page
 */
function addWatermark(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.saveGraphicsState();
  doc.setTextColor(241, 245, 249); // ultra light slate #f1f5f9
  doc.setFontSize(36);
  // Centered diagonal watermark
  doc.text('YUVA SHAKTI GROUP • KUCHERA', pageWidth / 2, pageHeight / 2 - 40, {
    align: 'center',
    angle: 35,
  });
  doc.text('BHATI PARIVAR • OFFICIAL', pageWidth / 2, pageHeight / 2 + 30, {
    align: 'center',
    angle: 35,
  });
  doc.restoreGraphicsState();
}

/**
 * Add Sanchalak Signature & Verified Seal at bottom of PDF
 */
function addSanchalakSignature(doc: jsPDF, pageWidth: number, currentY: number) {
  const margin = 40;
  const sigY = Math.max(currentY + 25, 710);

  // Digital Seal Box
  doc.setDrawColor(217, 119, 6);
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(margin, sigY, 150, 48, 4, 4, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('OFFICIAL VERIFIED RECORD', margin + 12, sigY + 16);
  doc.setFontSize(9);
  doc.setTextColor(120, 53, 15);
  doc.text('भाटी परिवार कुचेरा (नागौर)', margin + 12, sigY + 32);

  // Sanchalak Signature
  const rightX = pageWidth - margin - 150;
  doc.setDrawColor(100, 116, 139);
  doc.line(rightX, sigY + 28, rightX + 150, sigY + 28);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('रेवंतराम भाटी', rightX + 75, sigY + 22, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('मुख्य संचालक • युवा शक्ति ग्रुप', rightX + 75, sigY + 40, { align: 'center' });
}

/**
 * 1. Export Member-wise Monthly Passbook to PDF with Watermark & Signatures
 */
export function exportMemberPassbookToPDF(members: Member[], baseFund: number) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;

  addWatermark(doc, pageWidth, pageHeight);

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.roundedRect(margin, 30, pageWidth - margin * 2, 65, 8, 8, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(1.5);
  doc.roundedRect(margin + 2, 32, pageWidth - margin * 2 - 4, 61, 6, 6, 'D');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text('YUVA SHAKTI GROUP (BHATI PARIVAR • KUCHERA)', pageWidth / 2, 56, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(251, 191, 36);
  doc.text('MEMBER MONTHLY PASSBOOK & CONTRIBUTION LEDGER (2026)', pageWidth / 2, 75, { align: 'center' });

  // Summary Stat Strip
  const octPaidCount = members.filter((m) => m.octoberPaid).length;
  const novPaidCount = members.filter((m) => m.novemberPaid).length;
  const totalCollected = members.reduce((sum, m) => sum + (m.novemberPaid ? m.novemberAmount || 50 : 0) + (m.octoberPaid ? m.octoberAmount || 50 : 0), 0);

  let y = 110;
  const boxW = (pageWidth - margin * 2 - 16) / 3;

  // Box 1: Members Count
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, boxW, 40, 6, 6, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175);
  doc.text('TOTAL MEMBERS', margin + 10, y + 14);
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`${members.length} Karyakarini`, margin + 10, y + 30);

  // Box 2: Dues Collection
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin + boxW + 8, y, boxW, 40, 6, 6, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text('OCT / NOV STATUS', margin + boxW + 18, y + 14);
  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105);
  doc.text(`Oct: ${octPaidCount}/${members.length} | Nov: ${novPaidCount}/${members.length}`, margin + boxW + 18, y + 30);

  // Box 3: Total Fund
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(margin + (boxW + 8) * 2, y, boxW, 40, 6, 6, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('SAFE AVAILABLE FUND', margin + (boxW + 8) * 2 + 10, y + 14);
  doc.setFontSize(12);
  doc.setTextColor(180, 83, 9);
  doc.text(`Rs. ${(baseFund + totalCollected).toLocaleString('en-IN')}`, margin + (boxW + 8) * 2 + 10, y + 30);

  // Monthly Table Header
  y = 165;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 22, pageWidth - margin, y + 22);

  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('#', margin + 6, y + 14);
  doc.text('MEMBER NAME', margin + 24, y + 14);
  doc.text('MOBILE', margin + 180, y + 14);
  doc.text('OCTOBER (50)', margin + 260, y + 14);
  doc.text('NOVEMBER (50)', margin + 350, y + 14);
  doc.text('STATUS', pageWidth - margin - 10, y + 14, { align: 'right' });

  y += 24;

  members.forEach((m, idx) => {
    if (y > 690) {
      doc.addPage();
      addWatermark(doc, pageWidth, pageHeight);
      y = 45;
    }

    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(String(idx + 1), margin + 6, y + 12);

    doc.setTextColor(15, 23, 42);
    doc.text(m.name, margin + 24, y + 12);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(m.relation || 'सदस्य', margin + 24, y + 22);

    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(m.mobile || '-', margin + 180, y + 14);

    // October status
    if (m.octoberPaid) {
      doc.setTextColor(4, 120, 87);
      doc.text('PAID (Rs 50)', margin + 260, y + 14);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text('DUE (Rs 50)', margin + 260, y + 14);
    }

    // November status
    if (m.novemberPaid) {
      doc.setTextColor(4, 120, 87);
      doc.text('PAID (Rs 50)', margin + 350, y + 14);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text('PENDING', margin + 350, y + 14);
    }

    // Overall status tag
    const isAllClear = m.novemberPaid && m.octoberPaid;
    if (isAllClear) {
      doc.setTextColor(4, 120, 87);
      doc.text('CLEAR [OK]', pageWidth - margin - 10, y + 14, { align: 'right' });
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text('BAKI [DUE]', pageWidth - margin - 10, y + 14, { align: 'right' });
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 26, pageWidth - margin, y + 26);
    y += 28;
  });

  addSanchalakSignature(doc, pageWidth, y);

  doc.save(`Yuva_Shakti_Sadasya_Passbook_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * 2. Export General Bahi-Khata Ledger to PDF with Watermark & Signatures
 */
export function exportLedgerToPDF(
  transactions: Transaction[],
  totalJama: number,
  totalKharch: number,
  balance: number
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;

  addWatermark(doc, pageWidth, pageHeight);

  // Header Banner
  doc.setFillColor(30, 58, 138); // #1e3a8a
  doc.roundedRect(margin, 30, pageWidth - margin * 2, 65, 8, 8, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.setLineWidth(1.5);
  doc.roundedRect(margin + 2, 32, pageWidth - margin * 2 - 4, 61, 6, 6, 'D');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text('YUVA SHAKTI GROUP (BHATI PARIVAR • KUCHERA)', pageWidth / 2, 56, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(251, 191, 36);
  doc.text('OFFICIAL FAMILY BAHI-KHATA (INCOME & EXPENSE RECORD)', pageWidth / 2, 75, { align: 'center' });

  // Summary Metrics Box
  const summaryY = 110;
  const colWidth = (pageWidth - margin * 2) / 3;

  // Box 1: Total Credits
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, summaryY, colWidth - 6, 44, 6, 6, 'FD');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL CREDITS (JAMA)', margin + 10, summaryY + 16);
  doc.setFontSize(13);
  doc.setTextColor(4, 120, 87);
  doc.text(`Rs. ${totalJama.toLocaleString('en-IN')}`, margin + 10, summaryY + 34);

  // Box 2: Total Debits
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin + colWidth, summaryY, colWidth - 6, 44, 6, 6, 'FD');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DEBITS (KHARCH)', margin + colWidth + 10, summaryY + 16);
  doc.setFontSize(13);
  doc.setTextColor(185, 28, 28);
  doc.text(`Rs. ${totalKharch.toLocaleString('en-IN')}`, margin + colWidth + 10, summaryY + 34);

  // Box 3: Net Balance
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin + colWidth * 2, summaryY, colWidth - 6, 44, 6, 6, 'FD');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('AVAILABLE FUND (KOSH)', margin + colWidth * 2 + 10, summaryY + 16);
  doc.setFontSize(13);
  doc.setTextColor(29, 78, 216);
  doc.text(`Rs. ${balance.toLocaleString('en-IN')}`, margin + colWidth * 2 + 10, summaryY + 34);

  // Table Header
  let currentY = 175;
  const drawHeader = (y: number) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y - 12, pageWidth - margin * 2, 22, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y + 10, pageWidth - margin, y + 10);

    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('DATE', margin + 8, y + 3);
    doc.text('DESCRIPTION / MEMBER', margin + 75, y + 3);
    doc.text('METHOD', margin + 290, y + 3);
    doc.text('TYPE', margin + 380, y + 3);
    doc.text('AMOUNT (INR)', pageWidth - margin - 10, y + 3, { align: 'right' });
  };

  const drawFooter = (pageNum: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 35, pageWidth - margin, pageHeight - 35);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Yuva Shakti Group • Kuchera (Nagaur) • Parivar Bahi-Khata', margin, pageHeight - 20);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
  };

  let pageNumber = 1;
  drawHeader(currentY);
  currentY += 24;

  transactions.forEach((tx) => {
    if (currentY > pageHeight - 85) {
      drawFooter(pageNumber);
      doc.addPage();
      addWatermark(doc, pageWidth, pageHeight);
      pageNumber++;
      currentY = 45;
      drawHeader(currentY);
      currentY += 24;
    }

    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(tx.date, margin + 8, currentY);

    const desc = tx.memberName ? `${tx.description} (${tx.memberName})` : tx.description;
    const truncatedDesc = desc.length > 38 ? desc.substring(0, 36) + '...' : desc;
    doc.setTextColor(15, 23, 42);
    doc.text(truncatedDesc, margin + 75, currentY);

    doc.setTextColor(100, 116, 139);
    doc.text(tx.paymentMode || 'PhonePe', margin + 290, currentY);

    if (tx.type === 'jama') {
      doc.setTextColor(4, 120, 87);
      doc.text('JAMA (+)', margin + 380, currentY);
      doc.text(`+ Rs. ${tx.amount.toLocaleString('en-IN')}`, pageWidth - margin - 10, currentY, { align: 'right' });
    } else {
      doc.setTextColor(185, 28, 28);
      doc.text('KHARCH (-)', margin + 380, currentY);
      doc.text(`- Rs. ${tx.amount.toLocaleString('en-IN')}`, pageWidth - margin - 10, currentY, { align: 'right' });
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + 6, pageWidth - margin, currentY + 6);
    currentY += 20;
  });

  addSanchalakSignature(doc, pageWidth, currentY);
  drawFooter(pageNumber);

  doc.save(`Yuva_Shakti_Bahi_Khata_${new Date().toISOString().split('T')[0]}.pdf`);
}
