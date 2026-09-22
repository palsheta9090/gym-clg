import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  Search,
  Calendar,
} from 'lucide-react';

import { storageService } from '../services/storageService';
import type { Member, Attendance, Payment, MembershipPlan } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge } from '../components/ui/Badge';

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'attendance' | 'revenue' | 'memberships'>('members');

  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setMembers(storageService.getMembers());
    setAttendance(storageService.getAttendance());
    setPayments(storageService.getPayments());
    setPlans(storageService.getPlans());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // CSV Export Helper
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).map((v) => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPlanName = (planId: string) => plans.find((p) => p.id === planId)?.name || 'Custom';
  const getMemberName = (memberId: string) => members.find((m) => m.id === memberId)?.fullName || memberId;

  // Filtered dataset helpers
  const filteredMembers = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery)
  );

  const filteredAttendance = attendance.filter((a) => {
    const mName = getMemberName(a.memberId);
    const matchesQuery =
      mName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.memberId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStart = !startDate || a.date >= startDate;
    const matchesEnd = !endDate || a.date <= endDate;
    return matchesQuery && matchesStart && matchesEnd;
  });

  const filteredPayments = payments.filter((p) => {
    const mName = getMemberName(p.memberId);
    const matchesQuery =
      mName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.memberId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStart = !startDate || p.date >= startDate;
    const matchesEnd = !endDate || p.date <= endDate;
    return matchesQuery && matchesStart && matchesEnd;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Operational Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate and print reports for members, attendance, revenue, and memberships.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={() => {
              if (activeTab === 'members') exportToCSV(filteredMembers, 'members_report');
              else if (activeTab === 'attendance') exportToCSV(filteredAttendance, 'attendance_report');
              else if (activeTab === 'revenue') exportToCSV(filteredPayments, 'revenue_report');
              else exportToCSV(filteredMembers, 'memberships_report');
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg inline-flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 no-print">
        <button
          onClick={() => setActiveTab('members')}
          className={`py-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'members'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Member Report
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'attendance'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Attendance Report
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`py-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'revenue'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Revenue Report
        </button>
        <button
          onClick={() => setActiveTab('memberships')}
          className={`py-2.5 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'memberships'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Membership Report
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-4 no-print">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search report records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            placeholder="Start Date"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Report Content Printable Wrapper */}
      <div className="printable-area space-y-6">
        {/* TAB 1: MEMBER REPORT */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 font-medium block">Total Members</span>
                <span className="text-2xl font-bold text-slate-900">{members.length}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 font-medium block">Active Members</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {members.filter((m) => m.status === 'Active').length}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 font-medium block">Inactive Members</span>
                <span className="text-2xl font-bold text-slate-500">
                  {members.filter((m) => m.status === 'Inactive').length}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 font-medium block">Expired Memberships</span>
                <span className="text-2xl font-bold text-rose-600">
                  {members.filter((m) => m.status === 'Expired').length}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-3 px-4">Member ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Joining Date</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => (
                    <tr key={m.id}>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{m.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{m.fullName}</td>
                      <td className="py-3 px-4 text-slate-600">{m.phone}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(m.joiningDate)}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{getPlanName(m.planId)}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            m.status === 'Active'
                              ? 'active'
                              : m.status === 'Expired'
                              ? 'expired'
                              : 'inactive'
                          }
                        >
                          {m.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ATTENDANCE REPORT */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-400 font-medium block">Total Attendance Entries</span>
              <span className="text-2xl font-bold text-slate-900">{filteredAttendance.length}</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-3 px-4">Log ID</th>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.map((a) => (
                    <tr key={a.id}>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{a.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{getMemberName(a.memberId)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(a.date)}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{a.checkIn}</td>
                      <td className="py-3 px-4 text-slate-600">{a.checkOut || '--'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={a.status === 'Checked In' ? 'info' : 'active'}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REVENUE REPORT */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 font-medium block">Total Collected Revenue</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(
                    filteredPayments
                      .filter((p) => p.status === 'Paid')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 font-medium block">Pending Collection</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(
                    filteredPayments
                      .filter((p) => p.status === 'Pending')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-[11px] font-bold uppercase text-slate-500">
                    <th className="py-3 px-4">Payment ID</th>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{p.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{getMemberName(p.memberId)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(p.date)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{p.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <Badge variant={p.status === 'Paid' ? 'active' : 'pending'}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MEMBERSHIP REPORT */}
        {activeTab === 'memberships' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {plans.map((plan) => {
                const count = members.filter((m) => m.planId === plan.id).length;
                return (
                  <div key={plan.id} className="bg-white p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-400 font-medium block">{plan.name}</span>
                    <span className="text-xl font-bold text-slate-900">{count} Subscribers</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
