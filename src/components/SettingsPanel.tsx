import React, { useState } from 'react';
import { Settings, Save, Trash2, Download, Upload, HelpCircle, ShieldAlert, Copy, Check, FileText, Zap, Globe } from 'lucide-react';
import JSZip from 'jszip';
import { HostelSettings, Student, Payment, Complaint, Visitor, PartnerWithdrawal, HostelExpense } from '../types';
import { generateStandaloneHTML } from '../utils/standaloneHTML';
import { getLiveAppUrl } from '../utils/url';

// Raw source files imported as strings via Vite raw loader
// @ts-ignore
import appCode from '../App.tsx?raw';
// @ts-ignore
import dueCode from './DuePayments.tsx?raw';
// @ts-ignore
import typesCode from '../types.ts?raw';
// @ts-ignore
import dashCode from './DashboardHome.tsx?raw';
// @ts-ignore
import mockCode from '../mockData.ts?raw';
// @ts-ignore
import receiptCode from './ReceiptPrinter.tsx?raw';
// @ts-ignore
import studentCode from './StudentManagement.tsx?raw';
// @ts-ignore
import paymentCode from './PaymentManagement.tsx?raw';

interface SettingsPanelProps {
  settings: HostelSettings;
  onSaveSettings: (updated: HostelSettings) => void;
  onClearAllData: () => void;
  onBackupAllData: () => void;
  onRestoreAllData: (importedDB: any) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  students: Student[];
  payments: Payment[];
  complaints: Complaint[];
  visitors: Visitor[];
  partnerWithdrawals: PartnerWithdrawal[];
  expenses: HostelExpense[];
}

export default function SettingsPanel({
  settings,
  onSaveSettings,
  onClearAllData,
  onBackupAllData,
  onRestoreAllData,
  onShowToast,
  students,
  payments,
  complaints,
  visitors,
  partnerWithdrawals,
  expenses
}: SettingsPanelProps) {
  const [form, setForm] = useState<HostelSettings>({ ...settings });

  React.useEffect(() => {
    setForm({ ...settings });
  }, [settings]);
  
  // Credentials modification state
  const [masterUser, setMasterUser] = useState(settings.masterUsername || localStorage.getItem('ubh_creds_master_u') || 'admin');
  const [masterPass, setMasterPass] = useState(settings.masterPassword || localStorage.getItem('ubh_creds_master_p') || 'admin123');
  const [staffUser, setStaffUser] = useState(settings.staffUsername || localStorage.getItem('ubh_creds_staff_u') || 'staff');
  const [staffPass, setStaffPass] = useState(settings.staffPassword || localStorage.getItem('ubh_creds_staff_p') || 'staff123');
  const [recoveryKey, setRecoveryKey] = useState(settings.recoveryKey || localStorage.getItem('ubh_creds_recovery_key') || 'A040619932024Z');

  React.useEffect(() => {
    if (settings.masterUsername) setMasterUser(settings.masterUsername);
    if (settings.masterPassword) setMasterPass(settings.masterPassword);
    if (settings.staffUsername) setStaffUser(settings.staffUsername);
    if (settings.staffPassword) setStaffPass(settings.staffPassword);
    if (settings.recoveryKey) setRecoveryKey(settings.recoveryKey);
  }, [settings]);

  const handleUpdateCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterUser || !masterPass || !staffUser || !staffPass) {
      onShowToast('Credentials cannot be empty! ⚠️', true);
      return;
    }
    if (!recoveryKey.trim()) {
      onShowToast('Recovery verification key cannot be empty! ⚠️', true);
      return;
    }
    localStorage.setItem('ubh_creds_master_u', masterUser);
    localStorage.setItem('ubh_creds_master_p', masterPass);
    localStorage.setItem('ubh_creds_staff_u', staffUser);
    localStorage.setItem('ubh_creds_staff_p', staffPass);
    localStorage.setItem('ubh_creds_recovery_key', recoveryKey.trim());

    // Save to Firestore synced settings
    onSaveSettings({
      ...settings,
      masterUsername: masterUser,
      masterPassword: masterPass,
      staffUsername: staffUser,
      staffPassword: staffPass,
      recoveryKey: recoveryKey.trim()
    });

    onShowToast('Login Credentials & Recovery Key successfully updated and synced with live database! 🔐');
  };

  // Notepad export custom state
  const [selectedCodeFileName, setSelectedCodeFileName] = useState('App.tsx');
  const [copiedFileStatus, setCopiedFileStatus] = useState<string | null>(null);
  const [copiedDataStatus, setCopiedDataStatus] = useState<string | null>(null);
  const [copiedStandaloneStatus, setCopiedStandaloneStatus] = useState(false);
  const [copiedCleanStandaloneStatus, setCopiedCleanStandaloneStatus] = useState(false);
  const [copiedRawTemplateStatus, setCopiedRawTemplateStatus] = useState(false);

  const handleCopyStandaloneHTML = async () => {
    onShowToast('Preparing standalone HTML with live data... ⚙️');
    try {
      const htmlCont = await generateStandaloneHTML(students, payments, settings, complaints, visitors, partnerWithdrawals, expenses);
      navigator.clipboard.writeText(htmlCont).then(() => {
        setCopiedStandaloneStatus(true);
        onShowToast('Live Standalone HTML code copied successfully! 📋');
        setTimeout(() => setCopiedStandaloneStatus(false), 3000);
      }).catch(() => {
        onShowToast('Could not copy HTML content! ⚠️', true);
      });
    } catch (err) {
      console.error(err);
      onShowToast('Failed to generate template! ⚠️', true);
    }
  };

  const handleCopyCleanStandaloneHTML = async () => {
    onShowToast('Preparing clean standalone HTML with current settings... ⚙️');
    try {
      // Empty lists but keep the branding and setup settings
      const htmlCont = await generateStandaloneHTML([], [], settings, [], [], [], []);
      navigator.clipboard.writeText(htmlCont).then(() => {
        setCopiedCleanStandaloneStatus(true);
        onShowToast('Clean Standalone HTML (Pre-configured) copied successfully! 📋');
        setTimeout(() => setCopiedCleanStandaloneStatus(false), 3000);
      }).catch(() => {
        onShowToast('Could not copy HTML content! ⚠️', true);
      });
    } catch (err) {
      console.error(err);
      onShowToast('Failed to generate template! ⚠️', true);
    }
  };

  const handleCopyRawOfflineTemplate = async () => {
    onShowToast('Copying absolute original raw HTML template... ⚙️');
    try {
      // Generate clean standalone HTML
      const safeTemplate = await generateStandaloneHTML([], [], settings, [], [], [], []);
      navigator.clipboard.writeText(safeTemplate).then(() => {
        setCopiedRawTemplateStatus(true);
        onShowToast('Absolute original raw code copied successfully! 📋');
        setTimeout(() => setCopiedRawTemplateStatus(false), 3000);
      }).catch(() => {
        onShowToast('Could not copy raw HTML content! ⚠️', true);
      });
    } catch (err) {
      console.error(err);
      onShowToast('Failed to generate raw HTML code! ⚠️', true);
    }
  };

  const handleDownloadLiveIndexHtml = async () => {
    onShowToast('Preparing production-ready combined index.html... 🌐');
    try {
      const indexHtmlContent = await generateStandaloneHTML(students, payments, settings, complaints, visitors, partnerWithdrawals, expenses);
      const blob = new Blob([indexHtmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'index.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('Live combined index.html downloaded! 📂');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to download index.html! ⚠️', true);
    }
  };

  const handleDownloadCleanIndexHtml = async () => {
    onShowToast('Preparing clean production-ready index.html... ⚙️');
    try {
      const indexHtmlContent = await generateStandaloneHTML([], [], settings, [], [], [], []);
      const blob = new Blob([indexHtmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'index.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast('Clean index.html downloaded successfully! 📂');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to download clean index.html! ⚠️', true);
    }
  };

  const handleDownloadCpanelZip = async () => {
    onShowToast('Preparing cPanel-ready ZIP archive... 📦');
    try {
      const indexHtmlContent = await generateStandaloneHTML(students, payments, settings, complaints, visitors, partnerWithdrawals, expenses);
      
      const zip = new JSZip();
      
      // Add index.html to the ZIP
      zip.file('index.html', indexHtmlContent);
      
      // Add a helpful deployment instructions file
      const instructions = `==========================================================
   UNITY BOYS HOSTEL - CPANEL DEPLOYMENT INSTRUCTIONS
==========================================================

Follow these steps to host this web application on your cPanel:

1. Log in to your Hosting Account and open the "File Manager".
2. Navigate to your website's root public directory (typically "public_html").
3. Upload this entire "unity_boys_hostel_site.zip" file.
4. Right-click the uploaded ZIP file inside the File Manager and click "Extract" (unzip).
5. Ensure the extracted "index.html" file sits directly inside the "public_html" folder.
6. Delete the ZIP file after successful extraction to keep your space clean.

Your hostel website is now live! It automatically synchronizes with your cloud-hosted Firebase Firestore database.

Thank you!
Unity Boys Hostel Management System
Generated Date: ${new Date().toLocaleString('en-IN')}
==========================================================`;

      zip.file('readme.txt', instructions);
      
      // Generate the zip file as a blob
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Trigger download
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'unity_boys_hostel_site.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onShowToast('cPanel ZIP downloaded successfully! 📦');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to generate cPanel ZIP! ⚠️', true);
    }
  };


  const codeFiles = [
    { name: 'App.tsx', path: '/src/App.tsx', content: appCode || '', desc: 'Controls admin sessions, local storage persistence, tabs routing, status updates.' },
    { name: 'DuePayments.tsx', path: '/src/components/DuePayments.tsx', content: dueCode || '', desc: 'Main dues planner, payment schedules calculated from Student joining dates.' },
    { name: 'DashboardHome.tsx', path: '/src/components/DashboardHome.tsx', content: dashCode || '', desc: 'Visual analytics dashboard, quick action counters for cash flow.' },
    { name: 'types.ts', path: '/src/types.ts', content: typesCode || '', desc: 'Strict TypeScript interface safety models, Student/Payment state types.' },
    { name: 'mockData.ts', path: '/src/mockData.ts', content: mockCode || '', desc: 'Default startup registers, pre-seeded room occupancies.' },
    { name: 'ReceiptPrinter.tsx', path: '/src/components/ReceiptPrinter.tsx', content: receiptCode || '', desc: 'Voucher generator with high-fidelity printer layouts.' },
    { name: 'StudentManagement.tsx', path: '/src/components/StudentManagement.tsx', content: studentCode || '', desc: 'Active student directory management panel.' },
    { name: 'PaymentManagement.tsx', path: '/src/components/PaymentManagement.tsx', content: paymentCode || '', desc: 'Logs new collections and maintains payment diaries.' }
  ];

  const currentSelectedFile = codeFiles.find(f => f.name === selectedCodeFileName) || codeFiles[0];

  const handleCopyCodeToNotepad = () => {
    if (!currentSelectedFile.content) {
      onShowToast('Could not extract file content! ⚠️', true);
      return;
    }
    navigator.clipboard.writeText(currentSelectedFile.content).then(() => {
      setCopiedFileStatus(currentSelectedFile.name);
      onShowToast(`Successfully copied ${currentSelectedFile.name} code! Paste in Notepad 📝`);
      setTimeout(() => setCopiedFileStatus(null), 3000);
    }).catch(err => {
      onShowToast('Failed to copy to clipboard! ⚠️', true);
    });
  };

  const handleCopyDataToNotepad = (dataString: string, typeName: string) => {
    navigator.clipboard.writeText(dataString).then(() => {
      setCopiedDataStatus(typeName);
      onShowToast(`Copied ${typeName} register! Paste in Notepad 📝`);
      setTimeout(() => setCopiedDataStatus(null), 3000);
    }).catch(err => {
      onShowToast('Failed to copy! ⚠️', true);
    });
  };

  const generateStudentsText = () => {
    let t = `==========================================================\n`;
    t += `       UNITY BOYS HOSTEL - STUDENTS DIRECTORY REGISTER\n`;
    t += `==========================================================\n`;
    t += `Total Students Active: ${students.length}\n`;
    t += `Generated Stamp: ${new Date().toLocaleString('en-IN')}\n`;
    t += `----------------------------------------------------------\n\n`;
    students.forEach((s, idx) => {
      t += `[${idx + 1}] Lodger Name  : ${s.name}\n`;
      t += `    Room Assigned: Room ${s.room} (Status: ${s.status})\n`;
      t += `    Join Date    : ${s.joinDate || 'N/A'}\n`;
      t += `    Contact Mon  : +91 ${s.mobile || 'N/A'}\n`;
      t += `    Father Name  : ${s.father || 'N/A'}\n`;
      t += `    Father Mobile: +91 ${s.fatherMob || 'N/A'}\n`;
      t += `    Monthly Rent : ₹${s.fee.toLocaleString('en-IN')}\n`;
      t += `    Amount Paid  : ₹${s.paid.toLocaleString('en-IN')}\n`;
      t += `    Outstanding  : ₹${s.due.toLocaleString('en-IN')}\n`;
      t += `    Emergency No : ${s.emergencyMobile || 'N/A'}\n`;
      t += `----------------------------------------------------------\n`;
    });
    return t;
  };

  const generatePaymentsText = () => {
    let t = `==========================================================\n`;
    t += `       UNITY BOYS HOSTEL - PAYMENT TRANSACTIONS JOURNAL\n`;
    t += `==========================================================\n`;
    t += `Total Completed: ${payments.length} transactions\n`;
    t += `Generated Stamp: ${new Date().toLocaleString('en-IN')}\n`;
    t += `----------------------------------------------------------\n\n`;
    payments.forEach((p, idx) => {
      t += `[#${p.receipt}] Date: ${p.date}\n`;
      t += `    Billing Tenant : ${p.studentName}\n`;
      t += `    Room ID        : Room ${p.room}\n`;
      t += `    Month Segment  : ${p.month}\n`;
      t += `    Amount Logged  : ₹${p.amount.toLocaleString('en-IN')}\n`;
      t += `    Payment Mode   : ${p.mode}\n`;
      t += `----------------------------------------------------------\n`;
    });
    return t;
  };

  const generateRoomsMapText = () => {
    let t = `==========================================================\n`;
    t += `         UNITY BOYS HOSTEL - ROOM OCCUPANCY MAP\n`;
    t += `==========================================================\n`;
    t += `Generated Stamp: ${new Date().toLocaleString('en-IN')}\n\n`;
    
    // Group students by room
    const occupancy: { [key: string]: Student[] } = {};
    students.forEach(s => {
      if (!occupancy[s.room]) occupancy[s.room] = [];
      occupancy[s.room].push(s);
    });

    // Create floors list (101 to 145/201 etc)
    const listRooms = Array.from({ length: 45 }, (_, i) => {
      const roomNum = (100 + i + 1).toString();
      const tenants = occupancy[roomNum] || [];
      return { roomNum, tenants };
    });

    listRooms.forEach(r => {
      const status = r.tenants.length === 0 ? 'VACANT' : r.tenants.length >= 2 ? 'FULLY OCCUPIED' : 'PARTIALLY OCCUPIED';
      t += `Room #${r.roomNum} : Status: ${status} [${r.tenants.length}/2 beds occupied]\n`;
      if (r.tenants.length > 0) {
        t += `    Beds taken by : ` + r.tenants.map(tn => `${tn.name} (Mob: ${tn.mobile}, Due: ₹${tn.due})`).join('  |  ') + `\n`;
      }
      t += `----------------------------------------------------------\n`;
    });
    return t;
  };

  const handleTextChange = (field: keyof HostelSettings, val: string | number | boolean) => {
    setForm({
      ...form,
      [field]: val
    });
  };

  const handleCheckboxChange = (field: keyof HostelSettings, checked: boolean) => {
    setForm({
      ...form,
      [field]: checked
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      onShowToast('Please fill out Name, Phone, and Email configs! ⚠️', true);
      return;
    }
    onSaveSettings({ ...form });
  };

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && (json.students || json.payments || json.complaints || json.visitors)) {
          onRestoreAllData(json);
          // Refresh configuration state form
          if (json.settings) {
            setForm({ ...json.settings });
          }
        } else {
          onShowToast('Invalid JSON backup file structure! ❌', true);
        }
      } catch (err) {
        onShowToast('Failed to parse selected JSON file! ❌', true);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      onShowToast('QR image size should be less than 1MB for storage safety! ⚠️', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm(prev => ({ ...prev, upiQrUrl: base64 }));
      onShowToast('Custom QR Code image uploaded! Save settings to apply. 📸');
    };
    reader.readAsDataURL(file);
  };

  const handleClearQr = () => {
    setForm(prev => ({ ...prev, upiQrUrl: '' }));
    onShowToast('Custom QR Code cleared. Auto-generated UPI QR will be used! 🔄');
  };

  return (
    <div className="space-y-6">
      
      {/* Configuration Form wrapper */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-5 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#FF6B35]" />
          Hostel System General Settings
        </h4>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Hostel Name config</label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleTextChange('name', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Admission Phone Helpdesk</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => handleTextChange('phone', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-semibold">Campus Address specifications</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={e => handleTextChange('address', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Target WhatsApp Contact link</label>
              <input
                type="text"
                value={form.wa}
                onChange={e => handleTextChange('wa', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Corporate Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleTextChange('email', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-bold">Default UPI ID (For Fee collection receipts)</label>
              <input
                type="text"
                value={form.upi}
                onChange={e => handleTextChange('upi', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-bold">UPI Payee / Merchant Name</label>
              <input
                type="text"
                value={form.upiPayeeName || ''}
                onChange={e => handleTextChange('upiPayeeName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
                placeholder="e.g. Unity Boys Hostel"
              />
            </div>
          </div>

          {/* Custom QR Code upload/replacement option */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-3">
            <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              🖼️ Custom Payment QR Code (कस्टम भुगतान क्यूआर कोड)
            </h5>
            <p className="text-[11px] text-slate-500 mb-3 font-medium leading-relaxed">
              If you have a customized static QR from PhonePe, Paytm or Google Pay standee, upload it here.
              If empty, the system will dynamically generate a clean verified QR code from your default UPI ID above.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="hidden"
                  id="custom-qr-upload-input"
                />
                <div className="flex flex-wrap gap-2">
                  <label
                    htmlFor="custom-qr-upload-input"
                    className="px-4 py-2 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-xs font-black tracking-tight cursor-pointer shadow-sm transition active:scale-95"
                  >
                    Select QR Image File
                  </label>
                  {form.upiQrUrl && (
                    <button
                      type="button"
                      onClick={handleClearQr}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black border border-rose-100 transition active:scale-95 cursor-pointer"
                    >
                      Remove Custom QR
                    </button>
                  )}
                </div>
              </div>
              {form.upiQrUrl ? (
                <div className="w-24 h-24 bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center relative overflow-hidden group">
                  <img
                    src={form.upiQrUrl}
                    alt="Custom QR Preview"
                    className="w-full h-full object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-black tracking-wide uppercase text-center py-0.5">Active</span>
                </div>
              ) : (
                <div className="w-24 h-24 bg-slate-100 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                  <span className="text-lg">⚡</span>
                  <span className="text-[9px] font-bold">Auto-Gen Active</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-dashed border-gray-100 my-4 pt-4 space-y-6">
            <h5 className="text-xs font-black text-[#FF6B35] uppercase tracking-wider flex items-center gap-1.5">
              ⚙️ Dynamic System controls (सिस्टम सेटअप नियंत्रक)
            </h5>
            
            {/* CAPACITY INCREMENT / DECREMENT BUTTON GROUPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Control 1: Total Beds Control */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Total Bed Capacity</label>
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('totalBeds', Math.max(1, (form.totalBeds || 100) - 1))}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-[#1A1A2E]">{form.totalBeds || 100} beds</span>
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('totalBeds', (form.totalBeds || 100) + 1)}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Control 2: Double Rooms Count */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Double Sharing (दुवाल रूम संख्या)</label>
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('doubleRoomsCount', Math.max(1, (form.doubleRoomsCount || 25) - 1))}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-[#1A1A2E]">{form.doubleRoomsCount || 25} Rooms</span>
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('doubleRoomsCount', (form.doubleRoomsCount || 25) + 1)}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Control 3: Triple Rooms Count */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Triple Sharing (त्रिपल रूम संख्या)</label>
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('tripleRoomsCount', Math.max(1, (form.tripleRoomsCount || 15) - 1))}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-[#1A1A2E]">{form.tripleRoomsCount || 15} Rooms</span>
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('tripleRoomsCount', (form.tripleRoomsCount || 15) + 1)}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Control 4: Total Rooms Setup */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Total Rooms (कमरा संख्या नियंत्रक)</label>
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('totalRoomsCount', Math.max(1, (form.totalRoomsCount || 45) - 1))}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-xs text-[#1A1A2E]">{form.totalRoomsCount || 45} Rooms</span>
                  <button 
                    type="button" 
                    onClick={() => handleTextChange('totalRoomsCount', (form.totalRoomsCount || 45) + 1)}
                    className="w-8 h-8 rounded-lg bg-white border font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer hover:border-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* CUSTOM SELECTION OPTIONS FOR THEME & FORM TEMPLATE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sidebar Theme Changer */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Side Theme Change (साइडबार बैकग्राउंड कलर थीम)</label>
                <select
                  value={form.sidebarTheme || 'dark'}
                  onChange={e => handleTextChange('sidebarTheme', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] bg-white font-extrabold text-gray-700 cursor-pointer outline-none"
                >
                  <option value="dark">Classic Charcoal Dark (डार्क चारकोल)</option>
                  <option value="coal">Rich Obsidian Black (कोजी चारकोल ब्लैक)</option>
                  <option value="orange">Vibrant Sunset Orange (सूर्यास्त नारंगी)</option>
                  <option value="indigo">Deep Ocean Indigo (शाही इंडिगो नीला)</option>
                  <option value="emerald">Lush Emerald Forest (पन्ना हरा)</option>
                </select>
              </div>

              {/* Form Template Changer */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-tight">Form Template Option (रजिस्ट्रेशन फॉर्म विकल्प)</label>
                <select
                  value={form.registrationFormTemplate || 'Bilingual'}
                  onChange={e => handleTextChange('registrationFormTemplate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] bg-white font-extrabold text-gray-700 cursor-pointer outline-none"
                >
                  <option value="Bilingual">Bilingual Hindi-English (हिन्दी एवं English)</option>
                  <option value="English">Pure English / Standard (केवल अंग्रेज़ी)</option>
                  <option value="Simplified">Simplified Minimalist (सरलीकृत सामान्य प्रारूप)</option>
                </select>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-dashed border-gray-100 pb-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-bold">Default Late Fee Charge per day (₹)</label>
              <input
                type="number"
                value={form.lateFee}
                onChange={e => handleTextChange('lateFee', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 font-bold">Standard Electricity Tariff per unit (₹)</label>
              <input
                type="number"
                step="0.1"
                value={form.standardElecRate || 10}
                onChange={e => handleTextChange('standardElecRate', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none bg-white font-medium"
              />
            </div>
          </div>

          {/* 🚪 Student Portal Dynamic Master Control Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-2 space-y-3">
            <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              🚪 Student Portal Controls (स्टूडेंट पोर्टल नियंत्रण)
            </h5>
            <p className="text-[11px] text-slate-500 font-medium">
              Manage student portal availability and permissions globally. These settings take effect instantly for all students.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Toggle 1: Student Portal Live */}
              <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                <input
                  type="checkbox"
                  checked={form.isStudentPortalLive !== false} // default true
                  onChange={e => handleCheckboxChange('isStudentPortalLive', e.target.checked)}
                  className="mt-1 accent-[#FF6B35] h-4 w-4 rounded"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    Student Portal Live 🌐 (स्टूडेंट पोर्टल चालू रखें)
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Uncheck to disable student login and dues lookup globally. Students will see a "Maintenance" notice.
                  </span>
                </div>
              </label>

              {/* Toggle 2: Block Password/PIN Change */}
              <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                <input
                  type="checkbox"
                  checked={!!form.blockStudentPasswordChange}
                  onChange={e => handleCheckboxChange('blockStudentPasswordChange', e.target.checked)}
                  className="mt-1 accent-[#FF6B35] h-4 w-4 rounded"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    Block Password/PIN Changes 🔒 (पासवर्ड बदलाव ब्लॉक करें)
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    Check this to block students from changing their portal login passwords or PIN codes.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 📢 Banner / Advertisement Master Control Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-4 space-y-3">
            <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              📢 Website Background Banner Slider & Ads (मल्टीपल फोटो बैकग्राउंड एवं विज्ञापन सेटिंग्स)
            </h5>
            <p className="text-[11px] text-slate-500 font-medium">
              अपनी मुख्य वेबसाइट (Landing Page) के बैकग्राउंड में एक अत्यंत व्यावसायिक स्लाइडर (Professional Slideshow/Carousel) बनाने के लिए यहाँ कई तस्वीरें अपलोड करें। ये आपकी वेबसाइट को एक आकर्षक प्रीमियम लुक देंगी।
            </p>
            
            <div className="space-y-4 pt-1">
              {/* Toggle: Show Banner */}
              <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
                <input
                  type="checkbox"
                  checked={!!form.showAdBanner}
                  onChange={e => handleCheckboxChange('showAdBanner', e.target.checked)}
                  className="mt-1 accent-[#FF6B35] h-4 w-4 rounded"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    Show Background Slideshow & Banners 🌐 (वेबसाइट बैकग्राउंड स्लाइडशो चालू करें)
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    इसे चेक करने पर अपलोड की गई फोटोज़ वेबसाइट के मुख्य बैनर/बैकग्राउंड स्लाइडर में प्रदर्शित होंगी।
                  </span>
                </div>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Text Field: Banner Caption / Ad Tagline */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Banner Announcement / Caption Text (बैनर का सन्देश / टैगलाइन)
                  </label>
                  <input
                    type="text"
                    value={form.adBannerText || ''}
                    onChange={e => handleTextChange('adBannerText', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 focus:border-[#FF6B35] rounded-xl text-xs sm:text-sm bg-white font-semibold outline-none transition"
                    placeholder="e.g. Admission Open for 2026 Batch! Call 8209696820"
                  />
                  <span className="text-[9px] text-slate-400 block">
                    This message will be shown as a gorgeous overlay alert box on your website banner.
                  </span>
                </div>

                {/* File Upload: Image & PDF */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Add Payout/Background Photo or PDF (नई फोटो या पीडीएफ जोड़ें - Max 4MB each)
                  </label>
                  <div className="flex gap-2 items-center">
                    <label className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300 rounded-xl cursor-pointer text-slate-800 text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-slate-600 animate-bounce" />
                      Upload Photo / PDF Document
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        multiple
                        onChange={e => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            Array.from(files).forEach((file: any) => {
                              if (file.size > 4 * 1024 * 1024) {
                                onShowToast(`"${file.name}" is over 4MB limit! ⚠️`, true);
                                return;
                              }
                              const isPdfFile = file.type === 'application/pdf' || file.name.endsWith('.pdf');
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setForm(prev => {
                                  const currentUrls = prev.adBannerUrls || (prev.adBannerUrl ? [prev.adBannerUrl] : []);
                                  const updatedUrls = [...currentUrls, reader.result as string];
                                  return {
                                    ...prev,
                                    adBannerUrls: updatedUrls,
                                    adBannerUrl: updatedUrls[0],
                                    showAdBanner: true
                                  };
                                });
                                onShowToast(isPdfFile ? "PDF document added to slides! 📄" : "Image successfully added to slides! 📸");
                              };
                              reader.readAsDataURL(file);
                            });
                          }
                        }}
                        className="hidden" 
                      />
                    </label>
                    {((form.adBannerUrls && form.adBannerUrls.length > 0) || form.adBannerUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(prev => ({ ...prev, adBannerUrl: '', adBannerUrls: [] }));
                          onShowToast("All slides and gallery cleared 🗑️");
                        }}
                        className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black border border-rose-100 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear All
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 block">
                    Supports JPG, PNG, WebP, and PDF notices. You can upload multiple files to rotate dynamically.
                  </span>
                </div>
              </div>

              {/* Multiple Banner Images Slides / Grid Preview */}
              {((form.adBannerUrls && form.adBannerUrls.length > 0) || form.adBannerUrl) && (
                <div className="p-4 border border-slate-200 bg-white rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      🖼️ Active Gallery Slideshow ({((form.adBannerUrls && form.adBannerUrls.length > 0) ? form.adBannerUrls.length : 1)} Images)
                    </span>
                    <span className="text-[9px] text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-full">
                      Slides will auto-rotate dynamically
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {(() => {
                      const list = form.adBannerUrls && form.adBannerUrls.length > 0 
                        ? form.adBannerUrls 
                        : (form.adBannerUrl ? [form.adBannerUrl] : []);
                      return list.map((imgUrl, index) => {
                        const isPdf = imgUrl && (imgUrl.startsWith('data:application/pdf') || imgUrl.endsWith('.pdf') || imgUrl.includes('application/pdf'));
                        return (
                          <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm group">
                            {isPdf ? (
                              <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-2 text-slate-800">
                                <FileText className="w-8 h-8 text-indigo-600 mb-1" />
                                <span className="text-[10px] font-extrabold uppercase text-center truncate w-full px-2 text-slate-700">PDF Notice</span>
                                <span className="text-[8px] text-indigo-600 font-extrabold bg-indigo-50 px-1.5 py-0.5 rounded-md mt-0.5">Interactive Slide</span>
                              </div>
                            ) : (
                              <img 
                                src={imgUrl} 
                                className="w-full h-full object-cover" 
                                alt={`Banner Slide ${index + 1}`}
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-[8px] font-black text-white px-1.5 py-0.5 rounded-md">
                              Slide #{index + 1}
                            </div>
                            
                            {/* Remove individual image button */}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedList = list.filter((_, idx) => idx !== index);
                                setForm(prev => ({
                                  ...prev,
                                  adBannerUrls: updatedList,
                                  adBannerUrl: updatedList.length > 0 ? updatedList[0] : ''
                                }));
                                onShowToast(`Deleted Slide #${index + 1} 🗑️`);
                              }}
                              className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 hover:scale-105 active:scale-95 transition cursor-pointer shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                              title="Delete this image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {form.adBannerText && (
                    <div className="mt-3 text-center border-t border-slate-100 pt-2.5">
                      <p className="text-xs text-amber-800 font-extrabold px-3 py-1 bg-amber-50 border border-amber-100 rounded-full inline-block">
                        📢 Caption Alert: {form.adBannerText}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-[#FF6B35]/25 hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:scale-95 transition flex items-center gap-2 cursor-pointer pt"
          >
            <Save className="w-4 h-4" />
            Save specifications
          </button>
        </form>
      </div>

      {/* 🔮 Login Password Changer (लॉगिन विवरण एवं पासवर्ड बदलें) */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-650 text-indigo-505 text-indigo-500" />
          Update Login Credentials (लॉगिन पासवर्ड बदलें)
        </h4>
        <p className="text-xs text-gray-400 mb-5">
          Configure secure usernames and passwords for both Master Admin and Staff member. These credentials take effect instantly.
        </p>

        <form onSubmit={handleUpdateCreds} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Master credentials card */}
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
              <span className="text-[10px] bg-indigo-50 border border-indigo-150 inline-block px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-indigo-600">
                ⭐ Master Admin privileges
              </span>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Master Username</label>
                  <input
                    type="text"
                    value={masterUser}
                    onChange={e => setMasterUser(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Master Password</label>
                  <input
                    type="text"
                    value={masterPass}
                    onChange={e => setMasterPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Warden credentials card */}
            <div className="p-4 bg-orange-50/20 border border-orange-100 rounded-xl space-y-3">
              <span className="text-[10px] bg-orange-50 border border-orange-150 inline-block px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[#FF6B35]">
                🔒 Staff Privileges
              </span>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-orange-600/70 mb-1 uppercase">Staff Username</label>
                  <input
                    type="text"
                    value={staffUser}
                    onChange={e => setStaffUser(e.target.value)}
                    className="w-full px-3 py-2 border border-orange-200/50 rounded-lg text-xs font-semibold focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-orange-600/70 mb-1 uppercase">Staff Password</label>
                  <input
                    type="text"
                    value={staffPass}
                    onChange={e => setStaffPass(e.target.value)}
                    className="w-full px-3 py-2 border border-orange-200/50 rounded-lg text-xs font-mono font-bold focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recovery verification key card */}
          <div className="p-4 bg-amber-50/40 border border-amber-200/60 rounded-xl space-y-3">
            <span className="text-[10px] bg-amber-100/60 border border-amber-200 inline-block px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-amber-800">
              🔑 Password Reset / Recovery verification key (ओटीपी रीसेट कोड)
            </span>
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-amber-800/80 mb-1 uppercase">Master Reset Key / OTP Code</label>
                <input
                  type="text"
                  value={recoveryKey}
                  onChange={e => setRecoveryKey(e.target.value)}
                  placeholder="Enter custom reset key"
                  className="w-full md:w-1/2 px-3 py-2 border border-amber-200 rounded-lg text-xs font-mono font-bold focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white text-amber-900"
                />
                <p className="text-[10px] text-amber-700/80 mt-1">
                  ⚠️ <strong>Security Advice:</strong> Change this key from the default to your own custom secret key to prevent code-level leaks.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              Update Credentials
            </button>
          </div>
        </form>
      </div>

      {/* Advanced Database maintenance */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-4">
        <div>
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            System Maintenance & Data Backup
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Maintain local storage backups to prevent data loss due to browser cache clearance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Backup data */}
          <button
            onClick={onBackupAllData}
            className="px-5 py-3.5 bg-gradient-to-r from-sky-600 to-sky-700 text-white hover:shadow-[#0F3460]/20 hover:shadow-lg rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Backup Entire System (JSON)
          </button>

          {/* Restore data */}
          <label className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-amber-500/20 hover:shadow-lg rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative overflow-hidden">
            <Upload className="w-4 h-4" />
            Restore Database (JSON)
            <input
              type="file"
              accept=".json"
              onChange={handleJSONImport}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>

          {/* Delete everything */}
          <button
            onClick={onClearAllData}
            className="px-5 py-3.5 bg-gradient-to-r from-rose-650 to-rose-700 text-white hover:bg-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto max-sm:ml-0"
          >
            <Trash2 className="w-4 h-4" />
            Flush and Reset Database
          </button>
        </div>
      </div>

      {/* 🌐 NEW: WEB PORTAL EXPORTER & DOWNLOAD CENTER */}
      <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-6 shadow-md space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Globe className="w-5 h-5 text-emerald-600 animate-pulse" />
            </span>
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                Live Website Exporter & cPanel Download Center 🌐
              </h4>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Download the exact files required to host your Unity Boys Hostel website on any web hosting server!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#113a2c] to-[#0d1f1a] text-white rounded-2xl p-5 border border-emerald-800/40 space-y-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                HOSTING COMPATIBILITY: 100% SUCCESS ON ALL SERVERS
              </span>
              <h5 className="font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                Live Firebase-Connected Website Builder 🚀
              </h5>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded">cPanel-Ready</span>
          </div>

          <p className="text-xs text-slate-300 leading-normal font-medium">
            Apni live database running website ko kisi bhi web server par chalane ke liye, aap niche diye gaye buttons se direct <strong>index.html</strong> ya <strong>ZIP Archive</strong> download karein. Ise apne hosting ke mukhya folder me upload karte hi aapki live website, admission portal aur admin panel live ho jayenge!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Download index.html */}
            <button
              type="button"
              onClick={handleDownloadLiveIndexHtml}
              className="py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-extrabold uppercase rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/15 border border-emerald-500/30"
              title="Download standard index.html file"
            >
              <FileText className="w-4 h-4 text-white animate-bounce" />
              Download index.html File 🌐
            </button>

            {/* Download ZIP file for cPanel */}
            <button
              type="button"
              onClick={handleDownloadCpanelZip}
              className="py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-95 text-white text-xs font-extrabold uppercase rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-500/15 border border-indigo-500/30"
              title="Download index.html inside a ZIP file, ready to upload and extract"
            >
              <Download className="w-4 h-4 text-white" />
              Download cPanel ZIP Archive 📦
            </button>
          </div>
        </div>

        {/* HUMAN-READABLE TEXT EXPORTS */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div>
            <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">
              📋 Text Registers Export (बैकअप के लिए टेक्स्ट कॉपी करें)
            </h5>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Aap apne record ke liye active records ka text copy karke Notepad me direct paste kar sakte hain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Copy Students register */}
            <button
              type="button"
              onClick={() => handleCopyDataToNotepad(generateStudentsText(), 'Students Register')}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-between transition active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="text-[11px] font-bold">Students Directory</span>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Copy room map occupancy */}
            <button
              type="button"
              onClick={() => handleCopyDataToNotepad(generateRoomsMapText(), 'Rooms Occupancy Map')}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-between transition active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="text-[11px] font-bold">Room Occupancy Map</span>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Copy Payments register ledger */}
            <button
              type="button"
              onClick={() => handleCopyDataToNotepad(generatePaymentsText(), 'Payments Ledger')}
              className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-between transition active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="text-[11px] font-bold">Payments Ledger</span>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
