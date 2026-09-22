import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  LogOut,
  UserCheck,
  Calendar,
  Filter,
} from 'lucide-react';

import { storageService } from '../services/storageService';
import type { Member, Attendance as AttendanceType } from '../types';
import { formatDate, getTodayISO } from '../utils/formatters';
import { Badge } from '../components/ui/Badge';
import { Toast } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';

export const Attendance: React.FC = () => {
  const [attendanceList, setAttendanceList] = useState<AttendanceType[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Search member to quick check in
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Date filter for attendance history table
  const [selectedDateFilter, setSelectedDateFilter] = useState(getTodayISO());

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const loadData = () => {
    setAttendanceList(storageService.getAttendance());
    setMembers(storageService.getMembers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = getTodayISO();

  // Handle Quick Check-In
  const handleCheckIn = (memberId: string) => {
    if (!memberId) return;
    const rec = storageService.checkInMember(memberId);
    loadData();
    setSelectedMemberId('');
    setMemberSearchQuery('');
    const m = members.find((item) => item.id === memberId);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: `${m?.fullName || 'Member'} checked in at ${rec.checkIn}.`,
    });
  };

  // Handle Quick Check-Out
  const handleCheckOut = (attendanceId: string, memberName: string) => {
    const rec = storageService.checkOutMember(attendanceId);
    loadData();
    setToast({
      id: Date.now().toString(),
      type: 'info',
      message: `${memberName} checked out at ${rec.checkOut}.`,
    });
  };

  const getMember = (memberId: string) => members.find((m) => m.id === memberId);

  // Search active members for check-in dropdown
  const memberOptions = members.filter(
    (m) =>
      m.status === 'Active' &&
      (m.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        m.phone.includes(memberSearchQuery))
  );

  // Filter attendance history
  const filteredAttendance = attendanceList.filter((a) => {
    if (selectedDateFilter && a.date !== selectedDateFilter) return false;
    return true;
  });

  const todayCheckedInCount = attendanceList.filter(
    (a) => a.date === todayStr && a.status === 'Checked In'
  ).length;
  const todayTotalVisits = attendanceList.filter((a) => a.date === todayStr).length;

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Attendance Desk</h2>
          <p className="text-xs text-slate-500 mt-1">
            Record member check-ins, check-outs, and monitor daily gym traffic.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-400 font-medium block">Currently Inside</span>
            <span className="text-base font-bold text-indigo-600">{todayCheckedInCount} Members</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs text-xs">
            <span className="text-slate-400 font-medium block">Total Visits Today</span>
            <span className="text-base font-bold text-slate-800">{todayTotalVisits} Visits</span>
          </div>
        </div>
      </div>

      {/* Check In Action Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Quick Member Check-In</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search active member name, ID, or phone to check-in..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            disabled={!selectedMemberId && memberOptions.length !== 1}
            onClick={() => handleCheckIn(selectedMemberId || memberOptions[0]?.id)}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors shadow-xs shrink-0 flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Check-In Member</span>
          </button>
        </div>

        {/* Search Results Dropdown List */}
        {memberSearchQuery.trim() !== '' && (
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 max-h-48 overflow-y-auto space-y-1">
            {memberOptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 px-3">No active matching members found.</p>
            ) : (
              memberOptions.map((m) => {
                const isInside = attendanceList.some(
                  (a) => a.memberId === m.id && a.date === todayStr && a.status === 'Checked In'
                );
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    className={`p-2 rounded-md flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      selectedMemberId === m.id
                        ? 'bg-emerald-100/80 border border-emerald-300'
                        : 'hover:bg-slate-200/60'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-800">{m.fullName}</span>
                      <span className="text-slate-400 ml-2 font-mono">({m.id})</span>
                    </div>
                    {isInside ? (
                      <Badge variant="info">Already Checked In</Badge>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckIn(m.id);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded text-[11px]"
                      >
                        Check-In
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Attendance Log History</span>
          </h3>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            />
          </div>
        </div>

        {filteredAttendance.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No attendance records logged for {formatDate(selectedDateFilter)}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Check-Out Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((att) => {
                  const m = getMember(att.memberId);
                  const isCheckedIn = att.status === 'Checked In';

                  return (
                    <tr key={att.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {m?.fullName || att.memberId}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {att.memberId}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(att.date)}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{att.checkIn}</td>
                      <td className="py-3 px-4 text-slate-600">{att.checkOut || '--'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={isCheckedIn ? 'info' : 'active'}>
                          {att.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isCheckedIn ? (
                          <button
                            onClick={() => handleCheckOut(att.id, m?.fullName || att.memberId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded text-[11px] transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Check Out</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
