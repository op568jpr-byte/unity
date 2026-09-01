import React, { useState } from 'react';
import { 
  Users, Bed, DoorOpen, IndianRupee, AlertTriangle, Hammer, 
  UserPlus, Search, Landmark, ClipboardList, PenTool, Settings, 
  MapPlus, Sparkles, Building, ChevronRight, Download, Clock, PenSquare,
  Cake, Gift, Zap, Calculator, FileText, CheckCircle2, RefreshCw
} from 'lucide-react';
import { Student, Payment, Complaint, Visitor, HostelSettings, UserSession } from '../types';
import Modal from './Modal';
import { getLiveAppUrl } from '../utils/url';

interface DashboardHomeProps {
  session: UserSession;
  students: Student[];
  payments: Payment[];
  complaints: Complaint[];
  visitors: Visitor[];
  settings: HostelSettings;
  onSaveSettings?: (updated: HostelSettings) => void;
  onNavigateTab: (tab: string) => void;
  onOpenQuickModal: (modalName: 'student' | 'payment' | 'complaint' | 'visitor') => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  onEditStudent: (student: Student) => void;
}

export default function DashboardHome({
  session,
  students,
  payments,
  complaints,
  visitors,
  settings,
  onSaveSettings,
  onNavigateTab,
  onOpenQuickModal,
  onShowToast,
  onEditStudent
}: DashboardHomeProps) {
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const totalCapacity = typeof settings.totalBeds === 'number' && settings.totalBeds > 0 ? settings.totalBeds : 100;
  const [capacityInput, setCapacityInput] = useState<number>(totalCapacity);

  const totalActiveStudents = students.filter(s => s.status === 'Active').length;
  const occupiedBeds = totalActiveStudents; // 1 active student per assigned occupied bed
  const vacantBeds = Math.max(0, totalCapacity - occupiedBeds);

  const handleSaveCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capacityInput || capacityInput < 1) {
      onShowToast('Capacity must be at least 1 seat! ⚠️', true);
      return;
    }
    if (onSaveSettings) {
      onSaveSettings({
        ...settings,
        totalBeds: capacityInput
      });
    }
    setIsCapacityModalOpen(false);
    onShowToast(`Total Seat Capacity set to ${capacityInput} and saved to live database! 🏨`);
  };
  const dueStudentsCount = students.filter(s => s.due > 0).length;
  const pendingComplaintsCount = complaints.filter(c => c.status === 'Pending').length;
  const totalCollectedAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const cashCollectedAmount = payments.filter(p => p.mode === 'Cash').reduce((sum, p) => sum + p.amount, 0);
  const onlineCollectedAmount = payments.filter(p => p.mode !== 'Cash').reduce((sum, p) => sum + p.amount, 0);

  // Helper to parse DD/MM/YYYY or YYYY-MM-DD dates
  const parseJoinDate = (dateStr: string) => {
    if (!dateStr) return new Date();
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

  const isWithin30Days = (dateStr: string) => {
    const joinDate = parseJoinDate(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - joinDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= -1 && diffDays <= 30; // generous with timezone syncs
  };

  const newStudents = students.filter(s => s.status === 'Active' && isWithin30Days(s.joinDate));
  const [isNewStudentsModalOpen, setIsNewStudentsModalOpen] = useState(false);

  // Dynamic custom Quick actions states:
  const [inventories, setInventories] = useState([
    { id: '1', name: 'Almirah Room Keys (ताले/चाबी)', total: 60, assigned: 42 },
    { id: '2', name: 'Study Desks & Chairs (कुर्सियां)', total: 100, assigned: 89 },
    { id: '3', name: 'Cotton Bed Mattresses (गद्दे)', total: 100, assigned: 94 },
    { id: '4', name: 'Individual Reading Lamps (एलईडी)', total: 45, assigned: 30 },
  ]);

  const [visitName, setVisitName] = useState('');
  const [visitRoom, setVisitRoom] = useState('');
  const [visitPurpose, setVisitPurpose] = useState('');

  const [elecOldReading, setElecOldReading] = useState('2100');
  const [elecNewReading, setElecNewReading] = useState('2250');
  const [elecRateInput, setElecRateInput] = useState('10');

  // Compute upcoming/pending installments count based on individual student admission date & yearly total fee
  const getUpcomingInstallmentsCount = () => {
    let count = 0;
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

      let cumulativeRequired = 0;
      for (let i = 1; i <= maxInstallments; i++) {
        cumulativeRequired += installmentAmount;
        const paidSoFar = s.paid || 0;
        if (paidSoFar < cumulativeRequired) {
          count++;
          break; // Only count the next upcoming/first unpaid installment
        }
      }
    });
    return count;
  };

  // Compute active month-start payment alerts count (month started but not paid)
  const getActiveAlertsCount = () => {
    let count = 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

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
      
      const joinDateObj = parseJoinDate(rawDateStr);

      let cumulativeRequired = 0;
      for (let i = 1; i <= maxInstallments; i++) {
        cumulativeRequired += installmentAmount;
        
        const d = new Date(joinDateObj);
        d.setMonth(joinDateObj.getMonth() + (i - 1) * interval);

        const paidSoFar = s.paid || 0;
        const prevRequired = cumulativeRequired - installmentAmount;
        
        let remainingAmount = installmentAmount;
        if (paidSoFar >= cumulativeRequired) {
          remainingAmount = 0;
        } else if (paidSoFar > prevRequired) {
          remainingAmount = cumulativeRequired - paidSoFar;
        }

        const dueYear = d.getFullYear();
        const dueMonth = d.getMonth();
        const isAlertActive = (currentYear > dueYear) || (currentYear === dueYear && currentMonth >= dueMonth);

        if (paidSoFar < cumulativeRequired) {
          if (isAlertActive && remainingAmount > 0) {
            count++;
          }
          break; // Stop checking future installments since this one is unpaid
        }
      }
    });
    return count;
  };

  const getBirthdaysStatus = () => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // 1-12
    const todayDate = today.getDate();

    const todayBirthdays: Student[] = [];
    const upcomingBirthdays: { student: Student; daysRemaining: number; nextAge: number }[] = [];

    students.forEach(s => {
      if (!s.dob) return;
      
      let birthMonth = 0;
      let birthDay = 0;
      let birthYear = 0;

      if (s.dob.includes('-')) {
        const parts = s.dob.split('-');
        birthYear = parseInt(parts[0]);
        birthMonth = parseInt(parts[1]);
        birthDay = parseInt(parts[2]);
      } else if (s.dob.includes('/')) {
        const parts = s.dob.split('/');
        birthDay = parseInt(parts[0]);
        birthMonth = parseInt(parts[1]);
        birthYear = parseInt(parts[2]);
      } else {
        return;
      }

      if (isNaN(birthMonth) || isNaN(birthDay)) return;

      if (birthMonth === todayMonth && birthDay === todayDate) {
        todayBirthdays.push(s);
      } else {
        const currentYear = today.getFullYear();
        let nextBday = new Date(currentYear, birthMonth - 1, birthDay);
        if (nextBday < today) {
          nextBday = new Date(currentYear + 1, birthMonth - 1, birthDay);
        }
        
        const diffTime = nextBday.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0 && diffDays <= 30) {
          upcomingBirthdays.push({
            student: s,
            daysRemaining: diffDays,
            nextAge: birthYear ? (nextBday.getFullYear() - birthYear) : 0
          });
        }
      }
    });

    upcomingBirthdays.sort((a, b) => a.daysRemaining - b.daysRemaining);
    return { todayBirthdays, upcomingBirthdays };
  };

  const { todayBirthdays, upcomingBirthdays } = getBirthdaysStatus();

  const upcomingInstallmentsCount = getUpcomingInstallmentsCount();

  // Take recent 5
  const recentStudents = students.slice().reverse().slice(0, 5);
  const recentPayments = payments.slice().reverse().slice(0, 5);

  const stats = [
    { label: "Total Active Students", value: totalActiveStudents, sub: `Capacity: ${totalCapacity} Total Seats`, colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: <Users className="w-5 h-5 text-emerald-600" /> },
    { label: "Vacant Beds", value: vacantBeds, sub: `Out of ${totalCapacity} Total Capacity`, colorClass: "text-sky-600 bg-sky-50 border-sky-100", icon: <DoorOpen className="w-5 h-5 text-sky-600" /> },
    { label: "Total Collected", value: `₹${totalCollectedAmount.toLocaleString('en-IN')}`, sub: "Accumulated collection", colorClass: "text-[#FF6B35] bg-orange-50 border-orange-100", icon: <IndianRupee className="w-5 h-5 text-[#FF6B35]" /> },
    { label: "Due Payments", value: dueStudentsCount, sub: "Requires instant attention", colorClass: "text-rose-600 bg-rose-50 border-rose-100", icon: <AlertTriangle className="w-5 h-5 text-rose-600" /> },
    { 
      label: "Upcoming Payments", 
      value: upcomingInstallmentsCount, 
      sub: getActiveAlertsCount() > 0 ? `🚨 ${getActiveAlertsCount()} Month Alerts!` : "Future schedule installments", 
      colorClass: getActiveAlertsCount() > 0 ? "text-rose-600 bg-rose-50 border-rose-100 animate-pulse" : "text-amber-600 bg-amber-50/60 border-amber-100", 
      icon: <Clock className="w-5 h-5 text-amber-600" /> 
    },
    { label: "Complaints Open", value: pendingComplaintsCount, sub: "Pending active repair tasks", colorClass: "text-amber-600 bg-amber-50 border-amber-100", icon: <Hammer className="w-5 h-5 text-amber-600" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF6B35]/10 rounded-full blur-2xl"></div>
        <div>
          <h3 className="text-xl sm:text-2xl font-black mb-2 flex items-center gap-2">
            Welcome Back, <span className="text-[#FF6B35]">{session.name}</span>! 👋
          </h3>
          <p className="text-xs sm:text-sm text-gray-300">
            {session.role === 'master' 
              ? "All features unlocked. Full audit access, master setting configurations, and secure hostel ledger tools are ready."
              : "Current system time is tracked. Standard warden protocols are active for the Jaipur Sanganer campus."}
          </p>
        </div>
        <button
          onClick={() => onOpenQuickModal('student')}
          className="px-6 py-3.5 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-[#FF6B35]/30 hover:shadow-[#FF6B35]/50 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add Student Register
        </button>
      </div>

      {/* Stats Bento Layout Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white border border-gray-150 p-5 rounded-2xl hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${s.colorClass}`}>
                {s.icon}
              </div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
              <h4 className="text-lg sm:text-2xl font-black text-gray-800 mt-1 leading-none">{s.value}</h4>
              <span className="text-[9px] text-gray-400 font-medium block mt-1.5 leading-tight">{s.sub}</span>
            </div>
            
            {s.label === "Total Active Students" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNewStudentsModalOpen(true);
                }}
                className="mt-3 flex items-center justify-center gap-1 text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold px-2 py-1 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 border border-emerald-200/40"
                title="Manage Newly Enrolled Students within 1 Month"
              >
                <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>{newStudents.length} New (Edit Form)</span>
              </button>
            )}

            {s.label === "Vacant Beds" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCapacityInput(totalCapacity);
                  setIsCapacityModalOpen(true);
                }}
                className="mt-3 flex items-center justify-center gap-1 text-[10px] bg-sky-100 hover:bg-sky-200 text-sky-800 font-extrabold px-2 py-1 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 border border-sky-200/40"
                title="Click to Change Total Student Capacity / Beds"
              >
                <Settings className="w-3 h-3 text-sky-600" />
                <span>Set Seats ({totalCapacity})</span>
              </button>
            )}

            {s.label === "Total Collected" && (
              <div className="mt-3 pt-2.5 border-t border-dashed border-gray-150 flex flex-col gap-1 text-[10px] text-gray-500 font-bold">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Cash:
                  </span>
                  <span className="text-gray-800 font-black">₹{cashCollectedAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Online:
                  </span>
                  <span className="text-gray-800 font-black">₹{onlineCollectedAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}	
          </div>
        ))}
      </div>

      {/* Online Registrations Pending Room Assignment Alert Banner */}
      {students.filter(s => s.room === 'Unassigned' || s.room === 'Pending' || !s.room).length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-[#FF6B35] text-white p-5 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0 text-white border border-white/30">
              <UserPlus className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-[#FF6B35] text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">Action Needed</span>
                <span className="text-xs font-bold text-orange-100">Self-Registration Portal</span>
              </div>
              <h4 className="text-base font-extrabold mt-0.5">
                {students.filter(s => s.room === 'Unassigned' || s.room === 'Pending' || !s.room).length} New Student Admission(s) Received!
              </h4>
              <p className="text-xs text-orange-100 mt-0.5">
                Students submitted their admission form online. Click to assign them a room and bed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {students.filter(s => s.room === 'Unassigned' || s.room === 'Pending' || !s.room).map(unassigned => (
              <button
                key={unassigned.id}
                onClick={() => onEditStudent(unassigned)}
                className="px-4 py-2 bg-white text-gray-900 font-extrabold text-xs rounded-xl shadow hover:bg-orange-50 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Assign {unassigned.name}</span>
                <PenSquare className="w-3.5 h-3.5 text-[#FF6B35]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions Panel */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4.5 h-4.5 text-[#FF6B35]" />
          <h4 className="text-sm font-bold text-gray-800 tracking-tight uppercase">Quick Actions Gateway</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <button 
            onClick={() => onOpenQuickModal('student')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-150 rounded-2xl hover:border-[#FF6B35]/50 text-gray-600 hover:text-[#FF6B35] cursor-pointer transition text-center group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mb-2 group-hover:scale-105 transition"><UserPlus className="w-5 h-5" /></div>
            <span className="text-[11px] font-bold leading-tight">Add Student</span>
          </button>
          <button 
            onClick={() => onOpenQuickModal('payment')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-150 rounded-2xl hover:border-[#FF6B35]/50 text-gray-600 hover:text-[#FF6B35] cursor-pointer transition text-center group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mb-2 group-hover:scale-105 transition"><IndianRupee className="w-5 h-5" /></div>
            <span className="text-[11px] font-bold leading-tight">Pay Fees</span>
          </button>
          <button 
            onClick={() => onNavigateTab('students')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-150 rounded-2xl hover:border-[#FF6B35]/50 text-gray-600 hover:text-[#FF6B35] cursor-pointer transition text-center group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mb-2 group-hover:scale-105 transition"><Search className="w-5 h-5" /></div>
            <span className="text-[11px] font-bold leading-tight">Search Directory</span>
          </button>
          <button 
            onClick={() => onOpenQuickModal('complaint')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-150 rounded-2xl hover:border-[#FF6B35]/50 text-gray-600 hover:text-[#FF6B35] cursor-pointer transition text-center group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mb-2 group-hover:scale-105 transition"><PenTool className="w-5 h-5" /></div>
            <span className="text-[11px] font-bold leading-tight">File Complaint</span>
          </button>
          <button 
            onClick={() => onOpenQuickModal('visitor')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-150 rounded-2xl hover:border-[#FF6B35]/50 text-gray-600 hover:text-[#FF6B35] cursor-pointer transition text-center group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mb-2 group-hover:scale-105 transition"><MapPlus className="w-5 h-5" /></div>
            <span className="text-[11px] font-bold leading-tight">Log Visitor</span>
          </button>
          <button 
            onClick={() => onNavigateTab('rooms')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-150 rounded-2xl hover:border-[#FF6B35]/50 text-gray-600 hover:text-[#FF6B35] cursor-pointer transition text-center group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mb-2 group-hover:scale-105 transition"><Building className="w-5 h-5" /></div>
            <span className="text-[11px] font-bold leading-tight">Rooms Map</span>
          </button>
          <button 
            onClick={() => onNavigateTab('reports')}
            className="flex flex-col items-center justify-center p-4 bg-white border border-gray-150 rounded-2xl hover:border-[#FF6B35]/50 text-gray-600 hover:text-[#FF6B35] cursor-pointer transition text-center group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mb-2 group-hover:scale-105 transition"><Download className="w-5 h-5" /></div>
            <span className="text-[11px] font-bold leading-tight">CSV Reports</span>
          </button>
          <button 
            onClick={() => onNavigateTab('settings')}
            className={`flex flex-col items-center justify-center p-4 bg-white border border-gray-150 rounded-2xl hover:border-[#FF6B35]/50 text-gray-600 hover:text-[#FF6B35] cursor-pointer transition text-center group active:scale-95 ${
              session.role !== 'master' ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mb-2 group-hover:scale-105 transition"><Settings className="w-5 h-5" /></div>
            <span className="text-[11px] font-bold leading-tight">Settings</span>
          </button>
          
          <button 
            onClick={() => {
              const link = getLiveAppUrl() + '?mode=student-form';
              navigator.clipboard.writeText(link);
              onShowToast('Admission Form Link copied! Send this to students to fill. 📋');
            }}
            className="flex flex-col items-center justify-center p-4 bg-orange-50/40 border border-dashed border-[#FF6B35]/40 rounded-2xl hover:border-[#FF6B35]/80 text-[#FF6B35] cursor-pointer transition text-center group active:scale-95 col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center mb-2 group-hover:scale-110 transition">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold leading-tight">Share Form Link</span>
          </button>
        </div>
      </div>

      {/* Dynamic Activity Lists Split Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Students */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-[#FF6B35]" />
              Recently Registered Students
            </h4>
            <button 
              onClick={() => onNavigateTab('students')}
              className="text-xs font-bold text-[#FF6B35] hover:underline flex items-center cursor-pointer"
            >
              View directory
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {recentStudents.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No students registered yet.</p>
            ) : (
              recentStudents.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between border-b last:border-0 border-gray-50 pb-3 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-orange-400 text-white font-black flex items-center justify-center text-xs">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-gray-800 leading-tight">{s.name}</h5>
                      <span className="text-[10px] text-gray-400 font-medium">Room {s.room} • {s.sharing} sharing</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      s.due > 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                    }`}>
                      {s.due > 0 ? `Due: ₹${s.due}` : 'Paid'}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-1 font-medium">{s.joinDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-b-gray-100">
            <h4 className="text-sm font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <IndianRupee className="w-4.5 h-4.5 text-[#FF6B35]" />
              Recent Received Payments
            </h4>
            <button 
              onClick={() => onNavigateTab('payments')}
              className="text-xs font-bold text-[#FF6B35] hover:underline flex items-center cursor-pointer"
            >
              All collections
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No fee payments logged yet.</p>
            ) : (
              recentPayments.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between border-b last:border-0 border-gray-50 pb-3 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-55 border border-emerald-100/30 flex items-center justify-center text-white text-xs font-black bg-emerald-50 text-emerald-600">
                      <IndianRupee className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-gray-800 leading-tight">{p.studentName}</h5>
                      <span className="text-[10px] text-gray-400 font-medium">Room {p.room} • Mode: {p.mode}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-600">
                      + ₹{p.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-1 font-medium">{p.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* New Students (Within last month) Management Dialog */}
      <Modal
        isOpen={isNewStudentsModalOpen}
        onClose={() => setIsNewStudentsModalOpen(false)}
        title="Newly Registered Students (Last 1 Month)"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs sm:text-sm">
          <p className="text-xs text-gray-400 leading-relaxed">
            These are students registered within the last 1 month (30 days). You can open and edit their detailed admission profiles using the option below.
          </p>

          {newStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-405">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-gray-450" />
              <p className="text-xs font-bold text-gray-450">No students registered in the last 1 month.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {newStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3.5 bg-gradient-to-r from-gray-50 to-white hover:from-orange-50/10 rounded-xl border border-gray-150 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FF6B35]/15 text-[#FF6B35] font-black flex items-center justify-center text-xs">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-gray-800 leading-tight">{s.name}</h5>
                      <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">Room {s.room} • Joined: {s.joinDate}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsNewStudentsModalOpen(false);
                      onEditStudent(s);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-xs transition border border-amber-200 cursor-pointer active:scale-95"
                    title="Open Complete Admission Form for Editing"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    <span>Edit Form</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              onClick={() => setIsNewStudentsModalOpen(false)}
              className="px-4 py-2 bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer transition hover:shadow-md active:scale-95"
            >
              Close List
            </button>
          </div>
        </div>
      </Modal>

      {/* QUICK SET CAPACITY / TOTAL SEATS MODAL */}
      <Modal
        isOpen={isCapacityModalOpen}
        onClose={() => setIsCapacityModalOpen(false)}
        title="Set Total Student Capacity (कुल सीटें / बेड)"
      >
        <form onSubmit={handleSaveCapacity} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl space-y-1">
            <p className="text-amber-900 font-extrabold text-xs">🏨 Hostel Capacity Management</p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Define total beds available in Unity Boys Hostel. Vacant seats count on Dashboard updates automatically!
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              Total Student Seats / Beds (कुल छात्र क्षमता संख्या):
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCapacityInput(prev => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-300 font-black text-lg hover:bg-gray-200 flex items-center justify-center shrink-0 cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={capacityInput}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setCapacityInput(isNaN(val) ? 0 : val);
                }}
                className="w-full text-center font-extrabold text-base text-[#1A1A2E] bg-white border border-gray-300 rounded-xl py-2 px-3 focus:border-[#FF6B35] outline-none shadow-xs"
              />
              <button
                type="button"
                onClick={() => setCapacityInput(prev => prev + 1)}
                className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-300 font-black text-lg hover:bg-gray-200 flex items-center justify-center shrink-0 cursor-pointer"
              >
                +
              </button>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              Current Occupied Beds: <strong className="text-emerald-600">{occupiedBeds}</strong> | Calculated Vacant: <strong className="text-sky-600">{Math.max(0, capacityInput - occupiedBeds)}</strong>
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsCapacityModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs cursor-pointer hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white font-extrabold rounded-xl text-xs cursor-pointer hover:shadow-md transition active:scale-95"
            >
              Save Capacity & Sync Live 💾
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
