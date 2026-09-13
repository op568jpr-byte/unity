import React, { useState } from 'react';
import { Layers, Hotel, HelpCircle, Check, Users, ShieldAlert, DoorOpen, X, UserPlus, Edit3, ArrowRight } from 'lucide-react';
import { Student, RoomSharing } from '../types';

interface RoomManagementProps {
  students: Student[];
  onAssignStudentToRoom?: (studentId: number, roomNum: string, floor: string, bedNumber?: string) => void;
  onOpenAddStudentWithRoom?: (roomNum: string, floor: string) => void;
  onEditStudent?: (student: Student) => void;
}

export default function RoomManagement({
  students,
  onAssignStudentToRoom,
  onOpenAddStudentWithRoom,
  onEditStudent
}: RoomManagementProps) {
  const [activeFloor, setActiveFloor] = useState<'all' | 'G' | '1' | '2'>('all');
  const [selectedRoom, setSelectedRoom] = useState<{ roomNum: string; curOccupancy: Student[]; capacity: number; floorLabel: string } | null>(null);
  const [selectedStudentToAllot, setSelectedStudentToAllot] = useState<string>('');
  const [selectedBedNumber, setSelectedBedNumber] = useState<string>('A');

  const floors = [
    { name: 'Ground Floor Units (101-112)', prefix: '1', count: 12, start: 101, label: 'G', floorName: 'Ground' },
    { name: 'First Floor Units (201-213)', prefix: '2', count: 13, start: 201, label: '1', floorName: 'First' },
    { name: 'Second Floor Units (301-311)', prefix: '3', count: 11, start: 301, label: '2', floorName: 'Second' }
  ];

  // Helper to determine capacity based on standard prefix structure
  const getRoomCapacity = (roomNum: string): number => {
    const match = students.find(s => s.room === roomNum);
    if (match) {
      if (match.sharing === 'Single') return 1;
      if (match.sharing === 'Double') return 2;
      return 3;
    }
    const roomInt = parseInt(roomNum);
    if (!isNaN(roomInt)) {
      if (roomInt >= 101 && roomInt <= 112) return 3;
      if (roomInt % 3 === 0) return 1;
      return 2;
    }
    return 2;
  };

  const handleRoomClick = (roomNum: string, curOccupancy: Student[], capacity: number, floorLabel: string) => {
    setSelectedRoom({ roomNum, curOccupancy, capacity, floorLabel });
    setSelectedStudentToAllot('');
    setSelectedBedNumber('A');
  };

  // Find all pending / unassigned students awaiting room allotment
  const unassignedStudents = students.filter(
    s => !s.room || s.room === 'Pending' || s.room === 'Unassigned' || s.room.trim() === ''
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6">
      
      {/* Legend Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-[#FF6B35]" />
            Visual Campus Occupancy Map
          </h4>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 font-medium">Click on any room node block below to view assigned students and details.</p>
        </div>

        {/* Floor selectors */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-150 rounded-xl self-start">
          {(['all', 'G', '1', '2'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition ${
                activeFloor === f 
                  ? 'bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 bg-transparent'
              }`}
            >
              {f === 'all' ? 'All Floors' : f === 'G' ? 'Ground' : `Floor ${f}`}
            </button>
          ))}
        </div>
      </div>

      {/* Legend categories */}
      <div className="flex items-center gap-5 text-xs text-gray-500 p-3 bg-gray-50 rounded-2xl border border-gray-100">
        <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400">Map Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-500 text-emerald-600 block"></span>
          <span>Vacant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-500 text-amber-600 block"></span>
          <span>Half Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-500 text-rose-600 block"></span>
          <span>Fully Booked</span>
        </div>
      </div>

      {/* Floor Mapping grids */}
      <div className="space-y-8">
        {floors
          .filter(f => activeFloor === 'all' || activeFloor === f.label)
          .map((f, idx) => {
            return (
              <div key={idx} className="space-y-4">
                <h5 className="text-xs sm:text-sm font-extrabold text-gray-800 flex items-center gap-2">
                  <Hotel className="w-4.5 h-4.5 text-[#FF6B35]" />
                  {f.name}
                </h5>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {Array.from({ length: f.count }).map((_, rIdx) => {
                    const roomNum = String(f.start + rIdx);

                    const curOccupancy = students.filter(s => s.room === roomNum);
                    const capacity = getRoomCapacity(roomNum);
                    
                    let bgStyle = 'bg-emerald-50/75 border-emerald-500/30 text-emerald-600';
                    let statusLabel = 'Vacant';
                    
                    if (curOccupancy.length >= capacity) {
                      bgStyle = 'bg-rose-50/75 border-rose-500/30 text-rose-600';
                      statusLabel = 'Full';
                    } else if (curOccupancy.length > 0) {
                      bgStyle = 'bg-amber-50/75 border-amber-500/30 text-amber-600';
                      statusLabel = `${curOccupancy.length}/${capacity}`;
                    }

                    return (
                      <button
                        key={roomNum}
                        onClick={() => handleRoomClick(roomNum, curOccupancy, capacity, f.floorName)}
                        className={`p-4 rounded-xl border text-center transition-all hover:scale-102 hover:shadow-md cursor-pointer active:scale-95 flex flex-col justify-between ${bgStyle}`}
                      >
                        <h6 className="text-[#1A1A2E] text-sm font-black leading-none">{roomNum}</h6>
                        <span className="text-[10px] uppercase font-bold mt-2">{statusLabel}</span>
                        <div className="flex items-center justify-center gap-1 mt-1 text-gray-400">
                          {statusLabel === 'Vacant' ? (
                            <DoorOpen className="w-3.5 h-3.5 text-emerald-500" />
                          ) : statusLabel === 'Full' ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Users className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* Modern Room Detail & Allotment Overlay Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden transform scale-100 transition animate-fade-in max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] p-5 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="font-extrabold text-base sm:text-lg leading-tight">Room {selectedRoom.roomNum}</h5>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold text-white">
                    {selectedRoom.floorLabel} Floor
                  </span>
                </div>
                <span className="text-xs text-[#D4AF37] font-semibold block mt-0.5">
                  Occupancy: {selectedRoom.curOccupancy.filter(s => s.status === 'Active').length} / {selectedRoom.capacity} Beds ({selectedRoom.capacity <= selectedRoom.curOccupancy.length ? 'Full' : `${selectedRoom.capacity - selectedRoom.curOccupancy.length} Vacant`})
                </span>
              </div>
              <button 
                onClick={() => setSelectedRoom(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="p-5 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
              
              {/* SECTION 1: QUICK ALLOTMENT IF BEDS ARE AVAILABLE */}
              {selectedRoom.curOccupancy.length < selectedRoom.capacity ? (
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50/60 border border-orange-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#1A1A2E] flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-[#FF6B35]" />
                      Allot Student to Room {selectedRoom.roomNum}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      {selectedRoom.capacity - selectedRoom.curOccupancy.length} Bed Vacant
                    </span>
                  </div>

                  {unassignedStudents.length > 0 ? (
                    <div className="space-y-2.5">
                      <p className="text-[11px] text-gray-600">
                        Select a pending online registered student to allot this room:
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <select
                          value={selectedStudentToAllot}
                          onChange={(e) => setSelectedStudentToAllot(e.target.value)}
                          className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] cursor-pointer"
                        >
                          <option value="">-- Choose Pending Student ({unassignedStudents.length}) --</option>
                          {unassignedStudents.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.mobile}) • {s.sharing} sharing
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Bed (A/B)"
                            value={selectedBedNumber}
                            onChange={(e) => setSelectedBedNumber(e.target.value.toUpperCase())}
                            maxLength={3}
                            className="w-20 bg-white border border-gray-300 rounded-xl px-2.5 py-2 text-xs font-bold text-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            title="Bed Number"
                          />
                          <button
                            disabled={!selectedStudentToAllot}
                            onClick={() => {
                              if (selectedStudentToAllot && onAssignStudentToRoom) {
                                onAssignStudentToRoom(
                                  Number(selectedStudentToAllot),
                                  selectedRoom.roomNum,
                                  selectedRoom.floorLabel,
                                  selectedBedNumber
                                );
                                setSelectedStudentToAllot('');
                                setSelectedRoom(null);
                              }
                            }}
                            className="px-3.5 py-2 bg-gradient-to-r from-[#FF6B35] to-[#e55a24] text-white rounded-xl text-xs font-bold hover:shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap"
                          >
                            <span>Allot Room</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-500 py-1">
                      No pending online student registrations right now.
                    </div>
                  )}

                  {onOpenAddStudentWithRoom && (
                    <button
                      onClick={() => {
                        onOpenAddStudentWithRoom(selectedRoom.roomNum, selectedRoom.floorLabel);
                        setSelectedRoom(null);
                      }}
                      className="w-full py-2 bg-white border border-[#FF6B35]/40 hover:border-[#FF6B35] text-[#FF6B35] hover:bg-orange-50/50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      + New Manual Admission to Room {selectedRoom.roomNum}
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>Room is fully occupied! ({selectedRoom.capacity}/{selectedRoom.capacity} beds filled)</span>
                </div>
              )}

              {/* SECTION 2: CURRENT OCCUPANTS */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider block">
                  Currently Lodging Students ({selectedRoom.curOccupancy.length})
                </span>

                {selectedRoom.curOccupancy.length === 0 ? (
                  <div className="text-center py-6 space-y-2 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                      <DoorOpen className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h6 className="font-bold text-gray-700 text-xs">Unit is completely vacant</h6>
                      <p className="text-gray-400 text-[10px] mt-0.5">Ready for new student admissions or room reallocations.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {selectedRoom.curOccupancy.map((s, idx) => (
                      <div key={s.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3 hover:bg-orange-50/20 hover:border-orange-200 transition">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center text-xs font-bold text-[#FF6B35] flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 block text-xs sm:text-sm">{s.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {s.mobile} • {s.sharing} • Bed: {s.bedNumber || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-600 font-black' : 'bg-rose-50 text-rose-600 font-black'}`}>
                            {s.status}
                          </span>
                          {onEditStudent && (
                            <button
                              onClick={() => {
                                onEditStudent(s);
                                setSelectedRoom(null);
                              }}
                              className="px-2 py-1 bg-white border border-gray-200 hover:border-[#FF6B35] text-gray-600 hover:text-[#FF6B35] rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Edit or Change Room"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit / Shift</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer action */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 bg-gradient-to-r from-[#1A1A2E] to-[#0F3460] text-white rounded-xl text-xs font-bold shadow-md shadow-gray-200 cursor-pointer hover:shadow-lg active:scale-95 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
