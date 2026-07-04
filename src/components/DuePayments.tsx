import React, { useState } from 'react';
import { MessageSquare, AlertOctagon, AlertCircle, Calendar, Users, Filter, Clock, CheckCircle2, ChevronRight, RefreshCw, PhoneCall, Copy, Download, FileSpreadsheet, Printer, Smartphone } from 'lucide-react';
import { Student } from '../types';

interface DuePaymentsProps {
  students: Student[];
  viewMode: 'outstanding' | 'upcoming';
}

export default function DuePayments({ students, viewMode }: DuePaymentsProps) {
  const [upcomingSearch, setUpcomingSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('All Months');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [includePenalty, setIncludePenalty] = useState(true);

  // Filter states for Outstanding Dues
  const [outstandingSearch, setOutstandingSearch] = useState('');
  const [installmentFilter, setInstallmentFilter] = useState('All');

  const dueStudents = students.filter(s => s.due > 0);

  const filteredDueStudents = dueStudents.filter(s => {
    const matchesSearch = outstandingSearch ? (
      s.name.toLowerCase().includes(outstandingSearch.toLowerCase()) ||
      s.room.toLowerCase().includes(outstandingSearch.toLowerCase())
    ) : true;

    if (installmentFilter === 'All') return matchesSearch;
    
    const type = (s.installmentType || 'Monthly').trim().toLowerCase();
    
    if (installmentFilter === 'Monthly') {
      return matchesSearch && type === 'monthly';
    }
    if (installmentFilter === 'Installments') {
      return matchesSearch && type !== 'monthly';
    }
    // Specific match like "One Time", "2 Installments" etc.
    return matchesSearch && type === installmentFilter.toLowerCase();
  });

  const showCopyToast = (msg: string) => {
    setCopyStatus(msg);
    setTimeout(() => {
      setCopyStatus(null);
    }, 2500);
  };

  const handleCopyText = (text: string, successMsg: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showCopyToast(successMsg);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  // Helper to trigger CSV file download which opens seamlessly in Microsoft Excel
  const downloadExcelDues = () => {
    try {
      let csv = "\uFEFF"; // UTF-8 BOM so Excel displays rupee symbols/accents correctly
      csv += "Student Name,Room Number,Monthly / Installment Payment (INR),Paid So Far (INR),Outstanding Balance (INR),Student Mobile,Father Name,Father Mobile,City\n";
      
      filteredDueStudents.forEach(s => {
        const name = (s.name || '').replace(/"/g, '""');
        const room = (s.room || '').replace(/"/g, '""');
        const mobile = (s.mobile || '').replace(/"/g, '""');
        const fatherName = (s.father || '').replace(/"/g, '""');
        const fatherMobile = (s.fatherMob || '').replace(/"/g, '""');
        const city = (s.city || 'Jaipur').replace(/"/g, '""');
        csv += `"${name}","Room ${room}",${s.fee},${s.paid},${s.due},"${mobile}","${fatherName}","${fatherMobile}","${city}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `unity_boys_hostel_outstanding_dues_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showCopyToast("Excel LEDGER Downloaded Successfully! 📊");
    } catch (err) {
      console.error("Excel generation error", err);
    }
  };

  const downloadPDFDues = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups to print PDF reports!");
      return;
    }

    const nowStr = new Date().toLocaleString('en-IN');
    
    let html = `
      <html>
      <head>
        <title>Outstanding Dues Report - Unity Boys Hostel</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          @page {
            size: A4 portrait;
            margin: 15mm 12mm 15mm 12mm;
          }
          body {
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            padding: 0;
            margin: 0;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .official-badge {
            background-color: #ff6b35;
            color: white;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 8px;
          }
          .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: 800;
            text-transform: uppercase;
            margin: 0 0 6px 0;
            color: #111;
            letter-spacing: -0.5px;
          }
          .header p {
            font-size: 14px;
            color: #64748b;
            margin: 0;
            font-weight: 600;
          }
          .header-meta {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 20px;
            font-size: 11px;
            color: #64748b;
          }
          .meta-box strong {
            color: #1e293b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 30px;
            border: 1px solid #e2e8f0;
          }
          th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #cbd5e1;
            padding: 10px 12px;
            text-align: left;
            font-size: 10px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
            vertical-align: middle;
          }
          tr:nth-child(even) td {
            background-color: #fafafa;
          }
          .amount-due {
            color: #ef4444;
            font-weight: 700;
          }
          .total-row {
            font-weight: 800;
            background-color: #f1f5f9 !important;
            border-top: 2px solid #cbd5e1;
          }
          .total-row td {
            color: #0f172a;
            font-size: 11px;
            padding: 12px;
          }
          .no-print {
            text-align: right;
            padding: 12px 16px;
            background-color: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 24px;
          }
          .print-btn {
            background-color: #ff6b35;
            color: white;
            border: none;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgb(255 107 53 / 0.1);
            transition: all 0.2s;
          }
          .print-btn:hover {
            background-color: #e55a24;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
          }
          .signature-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 50px;
            padding-right: 12px;
          }
          .signature-box {
            text-align: center;
            width: 160px;
            border-top: 1px solid #94a3b8;
            padding-top: 6px;
            font-size: 10px;
            color: #64748b;
            font-weight: 600;
          }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="print-btn" onclick="window.print()">🖨️ Save as PDF / Print Dues Report</button>
        </div>
        <div style="padding: 10px;">
          <div class="official-badge">OFFICIAL LEDGER RECORD</div>
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h1>Unity Boys Hostel</h1>
                <p>Outstanding Fee Dues Summary Sheet (A4 Compact)</p>
              </div>
              <div style="text-align: right; font-size: 11px; color: #64748b; line-height: 1.4;">
                <strong>Jaipur Branch</strong><br/>
                Sector 5, Mansarovar<br/>
                Jaipur, Rajasthan
              </div>
            </div>
          </div>
          <div class="header-meta">
            <div>
              <strong>Report Generated:</strong> ${nowStr}
            </div>
            <div>
              <strong>Outstanding Accounts:</strong> ${filteredDueStudents.length} Students Pending
            </div>
          </div>
          <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 25%;">Student Name</th>
              <th style="width: 15%;">Unit / Room</th>
              <th style="width: 12%;">Monthly / Installment Fee</th>
              <th style="width: 12%;">Paid So Far</th>
              <th style="width: 12%;">Amount Due</th>
              <th style="width: 19%;">Contacts Summary</th>
            </tr>
          </thead>
          <tbody>
    `;

    let totalRent = 0;
    let totalPaid = 0;
    let totalDue = 0;

    filteredDueStudents.forEach((s, idx) => {
      totalRent += s.fee;
      totalPaid += s.paid;
      totalDue += s.due;
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${s.name}</strong></td>
          <td>Room ${s.room} (${s.sharing})</td>
          <td>₹${s.fee.toLocaleString('en-IN')}</td>
          <td>₹${s.paid.toLocaleString('en-IN')}</td>
          <td class="amount-due"><strong>₹${s.due.toLocaleString('en-IN')}</strong></td>
          <td style="font-size: 10px; line-height: 1.4;">
            Mobile: ${s.mobile}<br/>
            ${s.fatherMob ? `Father: ${s.fatherMob}<br/>` : ''}
            City: ${s.city || 'Jaipur'}
          </td>
        </tr>
      `;
    });

    html += `
            <tr class="total-row">
              <td colspan="3" style="text-align: right;"><strong>GRAND TOTAL:</strong></td>
              <td><strong>₹${totalRent.toLocaleString('en-IN')}</strong></td>
              <td><strong>₹${totalPaid.toLocaleString('en-IN')}</strong></td>
              <td class="amount-due"><strong>₹${totalDue.toLocaleString('en-IN')}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-box">
            AUTHORIZED WARDEN<br/>
            (UNITY BOYS HOSTEL)
          </div>
        </div>

        <div class="footer">
          Unity Boys Hostel Management System • Generated Digitally • Jaipur, Rajasthan
        </div>
        </div>
      </body>
      <\${'script'}>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        }
      </\${'script'}>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Helper to construct WhatsApp message body
  const getWhatsAppMsg = (s: Student, isFather: boolean = false) => {
    const name = isFather ? s.father : s.name;
    const penaltyText = includePenalty ? " समय पर जमा कराए अन्यथा पेनल्टी (penalty) लग जाएगी।" : "";
    return `Hello ${name || 'Parent'}, this is an outstanding fee reminder from Unity Boys Hostel, Jaipur regarding the outstanding hostel due balance of ₹${s.due}.${penaltyText} Please process the payment or UPI transfer. Thank you!\n- Warden Office.`;
  };

  const getWhatsAppLink = (s: Student, isFather: boolean = false) => {
    const phone = isFather ? s.fatherMob : s.mobile;
    const msg = getWhatsAppMsg(s, isFather);
    return `https://wa.me/91${phone ? phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(msg)}`;
  };

  const getSMSLink = (phone: string, msg: string) => {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    return `sms:+91${cleanPhone}?body=${encodeURIComponent(msg)}`;
  };

  // Generate a formatted report of outstanding dues for Notepad
  const getOutstandingReportText = () => {
    let report = `============================================\n`;
    report += `   OUTSTANDING HOSTEL DUES LEDGER REPORT\n`;
    report += `   UNITY BOYS HOSTEL, JAIPUR\n`;
    report += `============================================\n`;
    report += `Date of Export : ${new Date().toLocaleString('en-IN')}\n`;
    report += `Total Pending  : ${filteredDueStudents.length} Students\n`;
    report += `--------------------------------------------\n\n`;

    filteredDueStudents.forEach((s, idx) => {
      report += `${idx + 1}. STUDENT NAME : ${s.name}\n`;
      report += `   Room Number  : Room ${s.room}\n`;
      report += `   Monthly/Installment Fee  : ₹${s.fee.toLocaleString('en-IN')}\n`;
      report += `   Amount Paid  : ₹${s.paid.toLocaleString('en-IN')}\n`;
      report += `   DUE BALANCE  : ₹${s.due.toLocaleString('en-IN')}\n`;
      report += `   Student Mob  : ${s.mobile || 'N/A'}\n`;
      report += `   Father Name  : ${s.father || 'N/A'}\n`;
      report += `   Father Mob   : ${s.fatherMob || 'N/A'}\n`;
      report += `--------------------------------------------\n`;
    });

    report += `\n* Created & formatted for easy Notepad editing & offline storage *`;
    return report;
  };

  // Helper to parse student's admission / join date (DD/MM/YYYY or YYYY-MM-DD)
  const parseStudentJoinDate = (dateStr: string) => {
    if (!dateStr) return new Date(); // Fallback to current
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // Usually YYYY-MM-DD
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  // Generate dynamic installments schedule based on student's actual admission date and selected frequency Plan (1, 2, 3, 4, 6, 12 months)
  const getInstallments = () => {
    const installmentsList: Array<{
      id: string;
      student: Student;
      installmentNum: number;
      dueDate: string;
      dueDateObj: Date;
      dueMonthLabel: string;
      applicableMonthLabels: string[];
      planLabel: string;
      amount: number;
      status: 'Paid' | 'Partial' | 'Upcoming';
      remainingAmount: number;
      isAlertActive: boolean;
    }> = [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const getApplicableMonths = (start: Date, end: Date, isFirst: boolean): string[] => {
      const months: string[] = [];
      const curr = new Date(start);
      if (!isFirst) {
        curr.setMonth(curr.getMonth() + 1);
      }
      curr.setDate(1);
      const endCompare = new Date(end);
      endCompare.setDate(1);

      while (curr <= endCompare) {
        months.push(curr.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        curr.setMonth(curr.getMonth() + 1);
      }

      const endLabel = end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!months.includes(endLabel)) {
        months.push(endLabel);
      }
      return months;
    };

    students.forEach(s => {
      let maxInstallments = 12;
      let interval = 1;

      const instType = (s.installmentType || '').trim().toLowerCase();
      if (instType === 'monthly') {
        maxInstallments = 12;
        interval = 1;
      } else if (instType === '2 installments') {
        maxInstallments = 2;
        interval = 6;
      } else if (instType === '3 installments') {
        maxInstallments = 3;
        interval = 4;
      } else if (instType === '4 installments') {
        maxInstallments = 4;
        interval = 3;
      } else if (instType === '6 installments') {
        maxInstallments = 6;
        interval = 2;
      } else if (instType === 'one time' || instType === 'one-time') {
        maxInstallments = 1;
        interval = 12;
      } else {
        // Fallback to feePlan if available
        if (s.feePlan) {
          const match = s.feePlan.match(/\d+/);
          if (match) {
            interval = parseInt(match[0]) || 1;
          }
        }
        maxInstallments = Math.max(1, Math.floor(12 / interval));
      }

      // Calculate dynamic planLabel, e.g. "84000/4" or "₹84000/4"
      let planLabel = s.feePlan || '1 Month';
      if (s.yearlyTotalFee && s.yearlyTotalFee > 0) {
        planLabel = `${s.yearlyTotalFee}/${maxInstallments}`;
      } else if (s.fee && s.fee > 0) {
        planLabel = `${s.fee}/Month`;
      }

      // Calculate installment amount
      // If student has a defined yearly total fee, divide it by total installments
      let installmentAmount = 0;
      if (s.yearlyTotalFee !== undefined && s.yearlyTotalFee > 0) {
        installmentAmount = Math.round(s.yearlyTotalFee / maxInstallments);
      } else {
        const isMonthly = !s.installmentType || s.installmentType.trim().toLowerCase() === 'monthly';
        if (isMonthly) {
          installmentAmount = s.fee || 7500;
        } else {
          installmentAmount = s.fee || 21000;
        }
      }
      
      // Determine base date according to monthly vs installment plan type
      const isMonthly = !s.installmentType || s.installmentType.trim().toLowerCase() === 'monthly';
      const rawDateStr = isMonthly 
        ? (s.joinDate || s.agreementStartDate || '')
        : (s.agreementStartDate || s.joinDate || '');
      
      const joinDateObj = parseStudentJoinDate(rawDateStr);

      let cumulativeRequired = 0;
      let hasFoundUnpaid = false;
      for (let i = 1; i <= maxInstallments; i++) {
        cumulativeRequired += installmentAmount;
        
        // Compute due dates starting from join date in increments of 'interval' months
        const d = new Date(joinDateObj);
        d.setMonth(joinDateObj.getMonth() + (i - 1) * interval);
        
        const dueDateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const dueMonthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        // Compute previous installment date for applicable months calculation
        const prevD = new Date(joinDateObj);
        if (i > 1) {
          prevD.setMonth(joinDateObj.getMonth() + (i - 2) * interval);
        }
        const applicableMonthLabels = getApplicableMonths(prevD, d, i === 1);

        let status: 'Paid' | 'Partial' | 'Upcoming' = 'Upcoming';
        let remainingAmount = installmentAmount;
        const paidSoFar = s.paid || 0;
        const prevRequired = cumulativeRequired - installmentAmount;

        if (paidSoFar >= cumulativeRequired) {
          status = 'Paid';
          remainingAmount = 0;
        } else if (paidSoFar > prevRequired) {
          status = 'Partial';
          remainingAmount = cumulativeRequired - paidSoFar;
        } else {
          status = 'Upcoming';
          remainingAmount = installmentAmount;
        }

        // Alert activates if we've reached or passed the start of the installment due month
        const dueYear = d.getFullYear();
        const dueMonth = d.getMonth();
        const isAlertActive = (currentYear > dueYear) || (currentYear === dueYear && currentMonth >= dueMonth);

        if (status !== 'Paid') {
          if (hasFoundUnpaid) {
            // Skip future unpaid installments to only display/track the next immediate unpaid installment
            continue;
          }
          hasFoundUnpaid = true;
        }

        installmentsList.push({
          id: `${s.id}-inst-${i}`,
          student: s,
          installmentNum: i,
          dueDate: dueDateStr,
          dueDateObj: d,
          dueMonthLabel,
          applicableMonthLabels,
          planLabel,
          amount: installmentAmount,
          status,
          remainingAmount,
          isAlertActive: isAlertActive && remainingAmount > 0
        });
      }
    });

    // Sort by Due Date
    return installmentsList.sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime());
  };

  const installments = getInstallments();

  // Get unique months labels for filter dropdown
  const uniqueMonths = ['All Months', ...Array.from(new Set(installments.flatMap(inst => inst.applicableMonthLabels)))];

  // Filter installments
  const filteredInstallments = installments.filter(inst => {
    const matchesSearch = inst.student.name.toLowerCase().includes(upcomingSearch.toLowerCase()) || 
                          inst.student.room.toLowerCase().includes(upcomingSearch.toLowerCase());
    const matchesMonth = monthFilter === 'All Months' || inst.applicableMonthLabels.includes(monthFilter);
    let matchesPlan = true;
    if (planFilter !== 'All') {
      const type = (inst.student.installmentType || 'Monthly').trim().toLowerCase();
      if (planFilter === 'Monthly') {
        matchesPlan = type === 'monthly';
      } else if (planFilter === 'Installments') {
        matchesPlan = type !== 'monthly';
      } else {
        matchesPlan = type === planFilter.toLowerCase();
      }
    }
    const matchesStatus = statusFilter === 'All Statuses' || 
                          (statusFilter === 'Pending' ? inst.status !== 'Paid' : inst.status === statusFilter);
    return matchesSearch && matchesMonth && matchesPlan && matchesStatus;
  });

  const getUpcomingWhatsAppMsg = (inst: typeof installments[0], isFather: boolean = false) => {
    const name = isFather ? inst.student.father : inst.student.name;
    const penaltyText = includePenalty ? " समय पर जमा कराए अन्यथा पेनल्टी (penalty) लग जाएगी।" : "";
    return `Hello ${name || 'Parent'}, an upcoming/pending payment reminder from Unity Boys Hostel, Jaipur.\n\nInstallment #${inst.installmentNum} of ₹${inst.remainingAmount} falls on ${inst.dueDate} according to the ${inst.planLabel} installment schedule.${penaltyText}\n\nPlease clear the dues. Thank you!\n- Warden Office.`;
  };

  const getUpcomingWhatsAppLink = (inst: typeof installments[0], isFather: boolean = false) => {
    const phone = isFather ? inst.student.fatherMob : inst.student.mobile;
    const msg = getUpcomingWhatsAppMsg(inst, isFather);
    return `https://wa.me/91${phone ? phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(msg)}`;
  };

  const getUpcomingReportText = () => {
    let report = `============================================\n`;
    report += `   UPCOMING FUTURE INSTALLMENTS REPORT\n`;
    report += `   UNITY BOYS HOSTEL, JAIPUR\n`;
    report += `============================================\n`;
    report += `Date of Export : ${new Date().toLocaleString('en-IN')}\n`;
    report += `Filter Month   : ${monthFilter}\n`;
    report += `Total Scheduled: ${filteredInstallments.length} Records\n`;
    report += `--------------------------------------------\n\n`;

    filteredInstallments.forEach((inst, idx) => {
      report += `${idx + 1}. STUDENT NAME : ${inst.student.name}\n`;
      report += `   Room Number  : Room ${inst.student.room}\n`;
      report += `   Installment  : #${inst.installmentNum} of standard ${inst.planLabel} cycle\n`;
      report += `   Due Date     : ${inst.dueDate} (${inst.dueMonthLabel})\n`;
      report += `   Gross Amount : ₹${inst.amount.toLocaleString('en-IN')}\n`;
      report += `   Remaining    : ₹${inst.remainingAmount.toLocaleString('en-IN')}\n`;
      report += `   Status       : ${inst.status.toUpperCase()}${inst.isAlertActive ? ' (🚨 MONTH STARTED - REQ COLLECTION)' : ''}\n`;
      report += `   Student Mob  : ${inst.student.mobile || 'N/A'}\n`;
      report += `   Father Mob   : ${inst.student.fatherMob || 'N/A'}\n`;
      report += `--------------------------------------------\n`;
    });

    report += `\n* Created & formatted for easy Notepad editing & offline storage *`;
    return report;
  };

  const downloadExcelInstallments = () => {
    try {
      let csv = "\uFEFF"; // UTF-8 BOM so Excel displays rupee symbols/accents correctly
      csv += "Student Name,Room Number,Installment Plan,Installment Number,Scheduled Due Date,Month,Gross Amount (INR),Expected Remaining (INR),Status,Student Mobile,Father Mobile\n";
      
      filteredInstallments.forEach(inst => {
        const name = (inst.student.name || '').replace(/"/g, '""');
        const room = (inst.student.room || '').replace(/"/g, '""');
        const plan = (inst.planLabel).replace(/"/g, '""');
        const mobile = (inst.student.mobile || '').replace(/"/g, '""');
        const fatherMobile = (inst.student.fatherMob || '').replace(/"/g, '""');
        csv += `"${name}","Room ${room}","${plan}",${inst.installmentNum},"${inst.dueDate}","${inst.dueMonthLabel}",${inst.amount},${inst.remainingAmount},"${inst.status}","${mobile}","${fatherMobile}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `unity_boys_hostel_upcoming_installments_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showCopyToast("Excel PLANNER Downloaded Successfully! 📊");
    } catch (err) {
      console.error("Excel generation error", err);
    }
  };

  const downloadPDFInstallments = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups to print PDF reports!");
      return;
    }

    const nowStr = new Date().toLocaleString('en-IN');
    
    let html = `
      <html>
      <head>
        <title>Upcoming Installments Planner - Unity Boys Hostel</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1a202c;
            padding: 40px;
            margin: 0;
            background-color: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 3px double #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: 850;
            text-transform: uppercase;
            margin: 0 0 5px 0;
            letter-spacing: 1px;
            color: #111;
          }
          .header p {
            font-size: 13px;
            color: #4a5568;
            margin: 0;
            font-weight: 700;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #4a5568;
            margin-bottom: 20px;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 30px;
          }
          th {
            background-color: #1e2022;
            color: #ffffff;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #2d3748;
            padding: 12px 10px;
            text-align: left;
          }
          td {
            padding: 12px 10px;
            border-bottom: 1px solid #edf2f7;
            color: #2d3748;
          }
          tr:nth-child(even) td {
            background-color: #f7fafc;
          }
          .badge {
            display: inline-block;
            background-color: #feebcb;
            color: #c05621;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .badge-unpaid {
            background-color: #fff5f5;
            color: #c53030;
          }
          .badge-paid {
            background-color: #c6f6d5;
            color: #22543d;
          }
          .total-row {
            font-weight: 800;
            background-color: #e2e8f0 !important;
            border-top: 2px solid #cbd5e0;
          }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #718096;
            border-top: 1px solid #edf2f7;
            padding-top: 15px;
          }
          .print-btn {
            background-color: #e53e3e;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right;">
          <button class="print-btn" onclick="window.print()">🖨️ Save as PDF / Print Report</button>
        </div>
        <div class="header">
          <h1>Unity Boys Hostel, Jaipur</h1>
          <p>Upcoming Installments billing Planner</p>
        </div>
        <div class="meta-info">
          <div>DATE OF REPORT: ${nowStr}</div>
          <div>FILTERED PLANNER SCHEDULES: ${filteredInstallments.length} Records</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 25%;">Student Name</th>
              <th style="width: 10%;">Room</th>
              <th style="width: 15%;">Installment Detail</th>
              <th style="width: 15%;">Scheduled Date</th>
              <th style="width: 15%;">Remaining Due</th>
              <th style="width: 15%;">Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    let totalDueAmt = 0;

    filteredInstallments.forEach((inst, idx) => {
      totalDueAmt += inst.remainingAmount;
      const statusClass = inst.status.toLowerCase() === 'unpaid' ? 'badge-unpaid' : 'badge-paid';
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${inst.student.name}</strong><br/><small style="color:#718096">Mob: ${inst.student.mobile}</small></td>
          <td>Room ${inst.student.room}</td>
          <td>Installment #${inst.installmentNum} (${inst.planLabel})</td>
          <td><strong>${inst.dueDate}</strong><br/><small style="color:#718096">${inst.dueMonthLabel}</small></td>
          <td><strong>₹${inst.remainingAmount.toLocaleString('en-IN')}</strong></td>
          <td><span class="badge ${statusClass}">${inst.status.toUpperCase()}</span></td>
        </tr>
      `;
    });

    html += `
            <tr class="total-row">
              <td colspan="5" style="text-align: right;">TOTAL PENDING:</td>
              <td><strong>₹${totalDueAmt.toLocaleString('en-IN')}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div class="footer">
          Unity Boys Hostel Management System • Generated Digitally • Jaipur, Rajasthan
        </div>
      </body>
      <\${'script'}>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        }
      </\${'script'}>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {viewMode === 'outstanding' && (
        <>
          {/* 1. OUTSTANDING OVERDUE BALANCES */}
      <div id="outstanding-section" className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6 scroll-mt-6">
        
        {/* Header section with Penalty and Export commands */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-rose-600 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500" />
              1. Outstanding Dues Ledger (बकाया फ़ीस विवरण)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">List of students who currently have pending outstanding dues ({filteredDueStudents.length} of {dueStudents.length} Students)</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Penalty Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs font-black text-amber-800 select-none transition">
              <input 
                type="checkbox" 
                checked={includePenalty} 
                onChange={(e) => setIncludePenalty(e.target.checked)} 
                className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 border-amber-350 accent-amber-600"
              />
              <span className="hidden sm:inline">⚠️ Add Penalty Warning</span>
              <span className="sm:hidden">⚠️ Penalty</span>
            </label>

            {filteredDueStudents.length > 0 && (
              <>
                <button
                  onClick={downloadExcelDues}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs border border-emerald-600/10"
                  title="Download all outstanding student dues data directly in Excel/CSV format"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download Excel</span>
                  <span className="sm:hidden">Excel</span>
                </button>
                <button
                  onClick={downloadPDFDues}
                  className="px-2.5 py-1.5 bg-[#e53e3e] hover:bg-[#c53030] text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs border border-red-650/15"
                  title="Download / Print outstanding dues as a high-quality PDF document"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print PDF</span>
                  <span className="sm:hidden">Print</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters & Control bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-gray-150">
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Users className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search student or room..."
              value={outstandingSearch}
              onChange={e => setOutstandingSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Installment Type Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-150 w-full md:w-auto">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold whitespace-nowrap">Plan / Mode:</span>
              <select
                value={installmentFilter}
                onChange={e => setInstallmentFilter(e.target.value)}
                className="w-full md:w-40 py-0.5 text-xs outline-none bg-white text-gray-750 font-bold cursor-pointer"
              >
                <option value="All">All (सभी प्रकार)</option>
                <option value="Monthly">Monthly Only (केवल मासिक)</option>
                <option value="Installments">Installment Only (केवल किस्त)</option>
                <option value="One Time">One Time (एक बार)</option>
                <option value="2 Installments">2 Installments</option>
                <option value="3 Installments">3 Installments</option>
                <option value="4 Installments">4 Installments</option>
                <option value="6 Installments">6 Installments</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table register */}
        <div className="overflow-x-auto border border-gray-100 rounded-2xl">
          <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#1E2022] to-[#2E3135] text-white text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-4.5 px-5">Student / Name</th>
                <th className="py-4.5 px-5">Room Assigned</th>
                <th className="py-4.5 px-5">Monthly / Installment Payment</th>
                <th className="py-4.5 px-5">Paid so far</th>
                <th className="py-4.5 px-5 text-right">Outstanding Balance</th>
                <th className="py-4.5 px-5 text-center">Alert Warden commands</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 bg-white">
              {filteredDueStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#D4AF37]">
                    <AlertCircle className="w-8 h-8 text-[#D4AF37]/45 mx-auto mb-2" />
                    <span className="font-extrabold block text-sm mb-1">🎉 No matching records found!</span>
                    <span className="text-gray-400 text-xs">Either there are no students with pending dues, or none match the selected filters.</span>
                  </td>
                </tr>
              ) : (
                filteredDueStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-rose-50/20 transition-all">
                    
                    {/* Name block */}
                    <td className="py-4 px-5">
                      <div>
                        <h5 className="font-extrabold text-gray-800 leading-tight">{s.name}</h5>
                        <div className="text-[10px] text-gray-400 font-medium space-y-0.5 mt-0.5">
                          <span className="block">Student Mob: {s.mobile}</span>
                          <span className="block text-slate-600 font-bold">Papa Mob: {s.fatherMob} ({s.father})</span>
                        </div>
                      </div>
                    </td>

                    {/* Room */}
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-[#D4AF37] rounded-lg">
                        Room {s.room}
                      </span>
                    </td>

                    {/* Rent */}
                    <td className="py-4 px-5 font-semibold text-gray-650">
                      <div>
                        <span>₹{s.fee.toLocaleString('en-IN')}</span>
                        <span className="block text-[10px] text-gray-400 font-bold mt-0.5">({s.installmentType || 'Monthly'})</span>
                      </div>
                    </td>

                    {/* Paid */}
                    <td className="py-4 px-5 font-semibold text-emerald-600">
                      ₹{s.paid.toLocaleString('en-IN')}
                    </td>

                    {/* due balance */}
                    <td className="py-4 px-5 text-right font-black text-rose-600">
                      ₹{s.due.toLocaleString('en-IN')}
                    </td>

                    {/* reminder action button */}
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-2 min-w-[260px] max-w-[310px] mx-auto text-left">
                        {/* Student Dues Options */}
                        <div className="flex items-center justify-between text-[11px] pb-1 border-b border-gray-150 last:border-0 last:pb-0">
                          <span className="font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wide text-[9px]">
                            Student
                          </span>
                          <div className="flex items-center gap-1">
                            <a
                              href={getWhatsAppLink(s, false)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-emerald-200 transition active:scale-95"
                              title="WhatsApp Student"
                            >
                              <MessageSquare className="w-3 h-3 fill-current text-emerald-500" />
                              WA
                            </a>
                            {s.mobile && (
                              <a
                                href={getSMSLink(s.mobile, getWhatsAppMsg(s, false))}
                                className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-violet-200 transition active:scale-95"
                                title="Send SMS text reminder to Student"
                              >
                                <Smartphone className="w-3 h-3 text-violet-500" />
                                SMS
                              </a>
                            )}
                            {s.mobile && (
                              <a
                                href={`tel:${s.mobile}`}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-blue-200 transition active:scale-95"
                                title="Call Student"
                              >
                                <PhoneCall className="w-3 h-3 text-blue-500" />
                                Call
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Father Dues Options */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg uppercase tracking-wide text-[9px] truncate max-w-[100px]" title={s.father || 'Parent'}>
                            Papa: {s.father || 'Parent'}
                          </span>
                          <div className="flex items-center gap-1">
                            <a
                              href={getWhatsAppLink(s, true)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-emerald-200 transition active:scale-95"
                              title="WhatsApp Father"
                            >
                              <MessageSquare className="w-3 h-3 fill-current text-emerald-500" />
                              WA
                            </a>
                            {s.fatherMob && (
                              <a
                                href={getSMSLink(s.fatherMob, getWhatsAppMsg(s, true))}
                                className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-violet-200 transition active:scale-95"
                                title="Send SMS text reminder to Father"
                              >
                                <Smartphone className="w-3 h-3 text-violet-500" />
                                SMS
                              </a>
                            )}
                            {s.fatherMob && (
                              <a
                                href={`tel:${s.fatherMob}`}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-amber-200 transition active:scale-95"
                                title="Call Father"
                              >
                                <PhoneCall className="w-3 h-3 text-amber-500" />
                                Call
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {viewMode === 'upcoming' && (
        <>
          {/* 2. UPCOMING PAYMENTS */}
          <div id="installments-section" className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6 scroll-mt-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#D4AF37] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              2. Upcoming Payments Planner (आगामी किराया किश्तें)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Tracks future rental milestones computed from student join dates</p>
          </div>

          {filteredInstallments.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={downloadExcelInstallments}
                className="px-2.5 py-1.5 bg-[#D4AF37] hover:bg-[#bfa032] text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
                title="Download all filtered upcoming installments in Excel/CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Download Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>
              <button
                onClick={downloadPDFInstallments}
                className="px-2.5 py-1.5 bg-[#e53e3e] hover:bg-[#c53030] text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs border border-red-650/15"
                title="Print filtered upcoming installments as PDF document"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Print PDF</span>
                <span className="sm:hidden">Print</span>
              </button>
            </div>
          )}
        </div>

        {/* Filters & Control bar */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-gray-150">
          <div className="relative w-full lg:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Users className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by student or room..."
              value={upcomingSearch}
              onChange={e => setUpcomingSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full lg:w-auto">
            {/* Month Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-150">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold px-1.5 whitespace-nowrap">Month:</span>
              <select
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                className="w-full py-0.5 text-xs outline-none bg-white text-gray-700 font-bold cursor-pointer"
              >
                {uniqueMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Plan Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-150">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold px-1.5 whitespace-nowrap">Plan / Mode:</span>
              <select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                className="w-full py-0.5 text-xs outline-none bg-white text-gray-750 font-bold cursor-pointer"
              >
                <option value="All">All (सभी प्रकार)</option>
                <option value="Monthly">Monthly Only (केवल मासिक)</option>
                <option value="Installments">Installment Only (केवल किस्त)</option>
                <option value="One Time">One Time (एक बार)</option>
                <option value="2 Installments">2 Installments</option>
                <option value="3 Installments">3 Installments</option>
                <option value="4 Installments">4 Installments</option>
                <option value="6 Installments">6 Installments</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-gray-150">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold px-1.5 whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full py-0.5 text-xs outline-none bg-white text-gray-700 font-bold cursor-pointer"
              >
                <option value="Pending">Pending / Unpaid (बकाया)</option>
                <option value="All Statuses">All Statuses (सभी)</option>
                <option value="Upcoming">Upcoming Only (केवल आगामी)</option>
                <option value="Partial">Partial Paid (आंशिक भुगतान)</option>
                <option value="Paid">Fully Paid (पूर्ण भुगतान)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Installments List Grid */}
        <div className="overflow-x-auto border border-gray-100 rounded-2xl">
          <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-[#1E2022] to-[#2E3135] text-white text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-4 px-5">Student</th>
                <th className="py-4 px-5">Room</th>
                <th className="py-4 px-5">Installment Interval</th>
                <th className="py-4 px-5">Scheduled Due Date</th>
                <th className="py-4 px-5">Gross Amount</th>
                <th className="py-4 px-5">Expected Remaining</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 bg-white">
              {filteredInstallments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <span className="font-extrabold block text-sm mb-1">No installment matches found</span>
                    <span className="text-gray-400 text-xs text-center">Try adjusting your filters or search terms.</span>
                  </td>
                </tr>
              ) : (
                filteredInstallments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/50 transition-all">
                    {/* Student */}
                    <td className="py-3.5 px-5">
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-gray-800 leading-tight">{inst.student.name}</h5>
                        <span className="text-[10px] text-gray-400 font-semibold block">Student: {inst.student.mobile}</span>
                        <span className="text-[10px] text-slate-500 font-bold block">Papa: {inst.student.fatherMob} ({inst.student.father})</span>
                      </div>
                    </td>

                    {/* Room */}
                    <td className="py-3.5 px-5 font-extrabold text-[#D4AF37]">
                      Room {inst.student.room}
                    </td>

                    {/* Installment count */}
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 text-xs">Plan: {inst.planLabel}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Installment #{inst.installmentNum}</span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-5 font-mono text-xs font-extrabold text-blue-900">
                      {inst.dueDate}
                      <span className="block text-[9px] text-gray-400 font-sans mt-0.5">{inst.dueMonthLabel}</span>
                    </td>

                    {/* Amount total */}
                    <td className="py-3.5 px-5 font-semibold text-gray-700">
                      ₹{inst.amount.toLocaleString('en-IN')}
                    </td>

                    {/* Remaining to pay */}
                    <td className="py-3.5 px-5 font-black text-rose-600">
                      ₹{inst.remainingAmount.toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      {inst.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          RECEIVED
                        </span>
                      ) : inst.isAlertActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-rose-50 text-rose-600 rounded-full border border-rose-200 animate-pulse" title="This installment's scheduled month has started! Needs immediate collection.">
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          🚨 DUE: MONTH STARTED
                        </span>
                      ) : inst.status === 'Partial' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-amber-50 text-amber-600 rounded-full border border-amber-200">
                          PARTIAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black bg-slate-50 text-slate-500 rounded-full border border-slate-200">
                          UPCOMING
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5">
                      {inst.status !== 'Paid' ? (
                        <div className="flex flex-col gap-2 min-w-[260px] max-w-[310px] mx-auto text-left">
                          {/* Student Dues Options */}
                          <div className="flex items-center justify-between text-[11px] pb-1 border-b border-gray-150 last:border-0 last:pb-0">
                            <span className="font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wide text-[9px]">
                              Student
                            </span>
                            <div className="flex items-center gap-1">
                              <a
                                href={getUpcomingWhatsAppLink(inst, false)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-emerald-200 transition active:scale-95"
                                title="WhatsApp Student"
                              >
                                <MessageSquare className="w-3 h-3 fill-current text-emerald-500" />
                                WA
                              </a>
                              {inst.student.mobile && (
                                <a
                                  href={getSMSLink(inst.student.mobile, getUpcomingWhatsAppMsg(inst, false))}
                                  className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-violet-200 transition active:scale-95"
                                  title="Send SMS text reminder to Student"
                                >
                                  <Smartphone className="w-3 h-3 text-violet-500" />
                                  SMS
                                </a>
                              )}
                              {inst.student.mobile && (
                                <a
                                  href={`tel:${inst.student.mobile}`}
                                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-blue-200 transition active:scale-95"
                                  title="Call Student"
                                >
                                  <PhoneCall className="w-3 h-3 text-blue-500" />
                                  Call
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Father Dues Options */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg uppercase tracking-wide text-[9px] truncate max-w-[100px]" title={inst.student.father || 'Parent'}>
                              Papa: {inst.student.father || 'Parent'}
                            </span>
                            <div className="flex items-center gap-1">
                              <a
                                href={getUpcomingWhatsAppLink(inst, true)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-emerald-200 transition active:scale-95"
                                title="WhatsApp Father"
                              >
                                <MessageSquare className="w-3 h-3 fill-current text-emerald-500" />
                                WA
                              </a>
                              {inst.student.fatherMob && (
                                <a
                                  href={getSMSLink(inst.student.fatherMob, getUpcomingWhatsAppMsg(inst, true))}
                                  className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-violet-200 transition active:scale-95"
                                  title="Send SMS text reminder to Father"
                                >
                                  <Smartphone className="w-3 h-3 text-violet-500" />
                                  SMS
                                </a>
                              )}
                              {inst.student.fatherMob && (
                                <a
                                  href={`tel:${inst.student.fatherMob}`}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg font-bold text-[10px] flex items-center gap-0.5 border border-amber-200 transition active:scale-95"
                                  title="Call Father"
                                >
                                  <PhoneCall className="w-3 h-3 text-amber-500" />
                                  Call
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-extrabold justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Clear
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Modern Floating Toast Notification */}
      {copyStatus && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A2E] text-white border border-[#FF6B35]/30 rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-ping" />
          <span className="text-xs font-black tracking-wide uppercase text-slate-100">{copyStatus}</span>
        </div>
      )}

    </div>
  );
}
