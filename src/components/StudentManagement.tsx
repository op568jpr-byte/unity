import React, { useState } from 'react';
import { Search, UserPlus, Eye, Trash2, Filter, AlertCircle, PhoneCall, Info, Link, PenSquare, Share2, Copy, Check, ExternalLink, MessageCircle, X } from 'lucide-react';
import { Student, RoomSharing, StudentStatus } from '../types';
import { getLiveAppUrl } from '../utils/url';
import ConfirmationModal from './ConfirmationModal';

interface StudentManagementProps {
  students: Student[];
  onDeleteStudent: (id: number, reason: string) => void;
  onOpenAddStudent: () => void;
  onViewDetails: (student: Student) => void;
  onShowToast?: (msg: string, isError?: boolean) => void;
  onEditStudent?: (student: Student) => void;
  sessionRole?: string;
}

export default function StudentManagement({
  students,
  onDeleteStudent,
  onOpenAddStudent,
  onViewDetails,
  onShowToast,
  onEditStudent,
  sessionRole
}: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sharingFilter, setSharingFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const registrationLink = getLiveAppUrl() + '?mode=student-form';

  const handleCopyLink = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(registrationLink);
      } else {
        const input = document.createElement('input');
        input.value = registrationLink;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      if (onShowToast) onShowToast('Admission Form Link copied! 📋');
    } catch (e) {
      if (onShowToast) onShowToast('Copied link to clipboard! 📋');
    }
  };

  const handleWhatsAppShare = () => {
    const text = `🏛️ *UNITY BOYS HOSTEL, JAIPUR*\n📝 *Online Admission / Registration Form:*\n${registrationLink}\n\nकृपया नए एडमिशन के लिए ऊपर दिए गए लिंक पर अपनी जानकारी भरें। फॉर्म भरते ही आपका डेटा सीधे हॉस्टल डेटाबेस में रजिस्टर हो जाएगा।`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.mobile.includes(searchTerm);
    
    const matchesSharing = sharingFilter === 'All' || s.sharing === sharingFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesSharing && matchesStatus;
  });

  const avatarColors = [
    'bg-[#FF6B35] text-white',
    'bg-indigo-600 text-white',
    'bg-emerald-600 text-white',
    'bg-amber-600 text-white',
    'bg-pink-600 text-white',
    'bg-blue-600 text-white'
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6">
      
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search Input bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by student name, room or mobile..."
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl text-xs sm:text-sm focus:border-[#FF6B35] outline-none transition"
          />
        </div>

        {/* Filters and trigger Add CTA */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sharing selector */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 p-1.5 rounded-xl text-xs">
            <span className="text-gray-400 px-1 font-semibold">Sharing:</span>
            <select
              value={sharingFilter}
              onChange={e => setSharingFilter(e.target.value)}
              className="bg-transparent border-0 outline-none font-bold text-gray-700 cursor-pointer"
            >
              <option value="All">All types</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
            </select>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 p-1.5 rounded-xl text-xs">
            <span className="text-gray-400 px-1 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 outline-none font-bold text-gray-700 cursor-pointer"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Notice">Notice</option>
            </select>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2.5 bg-orange-50 border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white rounded-xl text-xs sm:text-sm font-bold transition duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            Share Form Link
          </button>

          <button
            onClick={onOpenAddStudent}
            className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#FF6B35]/20 hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Add Register
          </button>
        </div>

      </div>

      {/* Online Admissions / Unassigned Rooms Alert Banner */}
      {students.filter(s => s.room === 'Unassigned' || s.room === 'Pending' || !s.room).length > 0 && (
        <div className="p-4 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border-2 border-[#FF6B35]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs sm:text-sm text-gray-900 flex items-center gap-2">
                New Online Student Admissions
                <span className="px-2 py-0.5 rounded-full bg-[#FF6B35] text-white text-[10px] font-black">
                  {students.filter(s => s.room === 'Unassigned' || s.room === 'Pending' || !s.room).length} Pending
                </span>
              </h5>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Students submitted via self-registration form awaiting Room & Bed allocation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {students.filter(s => s.room === 'Unassigned' || s.room === 'Pending' || !s.room).map(unassigned => (
              <button
                key={unassigned.id}
                onClick={() => {
                  if (onEditStudent) onEditStudent(unassigned);
                }}
                className="px-3 py-1.5 bg-[#FF6B35] text-white rounded-lg text-xs font-bold hover:bg-[#e55a24] transition shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>Assign {unassigned.name}</span>
                <PenSquare className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Structured Table of Data results */}
      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-4.5 px-5">Student Details</th>
              <th className="py-4.5 px-5">Warden Room</th>
              <th className="py-4.5 px-5">Beds sharing</th>
              <th className="py-4.5 px-5">Contact & City</th>
              <th className="py-4.5 px-5 text-right">Fee due</th>
              <th className="py-4.5 px-5 text-center">Register Status</th>
              <th className="py-4.5 px-5 text-center">Action commands</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-550 bg-white">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  No students in directory match filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, idx) => {
                const colorHex = avatarColors[idx % avatarColors.length];
                return (
                  <tr key={s.id} className="hover:bg-[#FF6B35]/3 transition-colors duration-150">
                    {/* Name block */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-150 shadow-sm relative">
                          {s.profilePic ? (
                            <img src={s.profilePic} alt={s.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center font-bold text-sm tracking-tight ${colorHex}`}>
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-gray-800 leading-tight">{s.name}</h5>
                          <span className="text-[10px] text-gray-400 font-medium block mt-0.5">Joined: {s.joinDate}</span>
                        </div>
                      </div>
                    </td>

                    {/* Room block */}
                    <td className="py-4 px-5 font-bold">
                      {s.room === 'Unassigned' || s.room === 'Pending' || !s.room ? (
                        <button
                          onClick={() => onEditStudent && onEditStudent(s)}
                          className="px-2.5 py-1 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-800 text-xs font-black hover:bg-amber-200 transition cursor-pointer flex items-center gap-1"
                          title="Click to assign room"
                        >
                          <span>Unassigned</span>
                          <PenSquare className="w-3 h-3 text-amber-700" />
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-lg bg-orange-50 border border-orange-100 text-[#FF6B35]">
                          Room {s.room}
                        </span>
                      )}
                    </td>

                    {/* Bed style */}
                    <td className="py-4 px-5 font-medium text-gray-600">{s.sharing}</td>

                    {/* Primary Contacts & City */}
                    <td className="py-4 px-5">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-gray-800">
                          <span className="bg-blue-50 text-blue-600 text-[9px] uppercase font-black px-1.5 py-0.5 rounded">Student</span>
                          <a href={`tel:${s.mobile}`} className="hover:underline">{s.mobile}</a>
                        </div>
                        {s.fatherMob && (
                          <div className="flex items-center gap-1.5 text-gray-500 font-semibold">
                            <span className="bg-amber-50 text-amber-600 text-[9px] uppercase font-black px-1.5 py-0.5 rounded">Papa</span>
                            <a href={`tel:${s.fatherMob}`} className="hover:underline font-bold text-gray-700">{s.fatherMob}</a>
                            <a
                              href={`https://wa.me/91${s.fatherMob.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${s.father || 'Parent'}, this is a message from Unity Boys Hostel, Jaipur regarding ${s.name}'s hostel status. Please contact us for details.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center px-1 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-md text-[9px] ml-1 transition"
                              title="WhatsApp to Father"
                            >
                              💬 WA
                            </a>
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                          <span className="text-gray-400">📍 City:</span>
                          <span className="text-gray-650 uppercase tracking-wide font-extrabold">{s.city || "Jaipur"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Out due fee */}
                    <td className="py-4 px-5 text-right font-black">
                      <span className={s.due > 0 ? "text-rose-600 bg-rose-50 px-2 py-1 rounded-md" : "text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"}>
                        ₹{s.due.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                        s.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-550 border border-emerald-250/30'
                          : 'bg-amber-50 text-amber-550 border border-amber-250/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>

                    {/* Operations */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onEditStudent && (
                          <button
                            onClick={() => onEditStudent(s)}
                            className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl cursor-pointer transition border border-amber-100"
                            title="Edit Student Profile Details"
                          >
                            <PenSquare className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onViewDetails(s)}
                          className="p-2 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl cursor-pointer transition border border-sky-100"
                          title="View Details"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {sessionRole === 'master' && (
                          <button
                            onClick={() => setStudentToDelete(s)}
                            className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl cursor-pointer transition border border-rose-100"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={studentToDelete !== null}
        onClose={() => setStudentToDelete(null)}
        onConfirm={(reason) => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id, reason || '');
          }
        }}
        title="Delete Student Record"
        message={`Remove records for student "${studentToDelete?.name || ''}"? This operation cannot be undone. All room and details history will be deleted.`}
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        type="danger"
        requireReason={true}
        reasonPlaceholder="लिखें कि छात्र को क्यों हटाया जा रहा है (उदा. कोर्स पूरा हुआ, हॉस्टल छोड़ दिया, आदि)..."
      />

      {/* Share Admission Form Link Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#FF6B35] flex items-center justify-center font-black">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Share Admission Form Link</h3>
                  <p className="text-xs text-gray-500">Send this link to prospective students to register</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Link Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Official Student Self-Registration URL:</label>
              <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-2xl">
                <input
                  type="text"
                  readOnly
                  value={registrationLink}
                  className="bg-transparent border-0 text-xs font-semibold text-gray-700 w-full outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer flex-shrink-0 ${
                    copied 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-[#1A1A2E] text-white hover:bg-[#2e2e4f]'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition shadow-md shadow-[#25D366]/20 active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                Share on WhatsApp
              </button>

              <button
                onClick={() => window.open(registrationLink, '_blank')}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Open & Test Form
              </button>
            </div>

            {/* Cloud Sync Assurance Note */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-800 flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0 animate-ping" />
              <div>
                <p className="font-bold">⚡ Instant Real-Time Database Sync:</p>
                <p className="text-emerald-700/90 mt-0.5">
                  जब भी कोई छात्र इस लिंक से फॉर्म भरेगा, उसका पूरा डेटा (फोटो, आधार, गार्जियन डिटेल्स) तुरंत आपके एडमिन पोर्टल पर <strong>Active Students</strong> में दर्ज हो जाएगा।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
