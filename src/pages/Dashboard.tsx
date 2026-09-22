import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  IndianRupee,
  AlertTriangle,
  CreditCard,
  ArrowUpRight,
  UserPlus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

import { storageService } from '../services/storageService';
import type { Member, Payment, Attendance, MembershipPlan } from '../types';
import {
  calculateActiveMembers,
  calculateTodayAttendance,
  calculateMonthlyRevenue,
  calculateExpiringMemberships,
  calculatePendingPayments,
  calculateDaysRemaining,
} from '../utils/calculations';
import { formatCurrency, formatDate, getTodayISO } from '../utils/formatters';
import { Badge } from '../components/ui/Badge';

export const Dashboard: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);

  useEffect(() => {
    setMembers(storageService.getMembers());
    setPayments(storageService.getPayments());
    setAttendance(storageService.getAttendance());
    setPlans(storageService.getPlans());
  }, []);

  // Derived KPIs
  const totalMembers = members.length;
  const activeMembers = calculateActiveMembers(members);
  const todayAttendance = calculateTodayAttendance(attendance);
  const monthlyRevenue = calculateMonthlyRevenue(payments);
  const expiringMembershipsCount = calculateExpiringMemberships(members);
  const pendingPaymentsAmount = calculatePendingPayments(payments);

  // Helper map for plan names
  const getPlanName = (planId: string) => {
    return plans.find((p) => p.id === planId)?.name || 'Custom';
  };

  // Recent lists
  const recentMembers = [...members].slice(0, 5);
  const recentPayments = [...payments].slice(0, 5);

  const todayStr = getTodayISO();
  const todayAttendanceList = attendance
    .filter((a) => a.date === todayStr)
    .slice(0, 5);

  const expiringMembers = members
    .filter((m) => {
      const days = calculateDaysRemaining(m.membershipExpiryDate);
      return m.status === 'Active' && days >= 0 && days <= 7;
    })
    .slice(0, 5);

  // Mock chart data derived realistically
  const revenueChartData = [
    { month: 'Apr', amount: 32000 },
    { month: 'May', amount: 45000 },
    { month: 'Jun', amount: 38000 },
    { month: 'Jul', amount: 52000 },
    { month: 'Aug', amount: 48000 },
    { month: 'Sep', amount: monthlyRevenue || 58000 },
  ];

  const memberGrowthChartData = [
    { month: 'Apr', members: 12 },
    { month: 'May', members: 15 },
    { month: 'Jun', members: 16 },
    { month: 'Jul', members: 18 },
    { month: 'Aug', members: 19 },
    { month: 'Sep', members: totalMembers },
  ];

  const attendanceTrendData = [
    { day: 'Mon', count: 18 },
    { day: 'Tue', count: 22 },
    { day: 'Wed', count: 19 },
    { day: 'Thu', count: 24 },
    { day: 'Fri', count: 20 },
    { day: 'Sat', count: 25 },
    { day: 'Sun', count: todayAttendance },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Welcome back, Gym Owner!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Here is your gym's operational summary and daily performance.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/members"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </Link>
          <Link
            to="/attendance"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Clock className="w-4 h-4" />
            <span>Mark Attendance</span>
          </Link>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Members */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Members
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalMembers}</div>
          <span className="text-[11px] text-slate-400 font-medium">All registered</span>
        </div>

        {/* 2. Active Members */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Active Members
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeMembers}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Valid plan active</span>
        </div>

        {/* 3. Today's Attendance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{todayAttendance}</div>
          <span className="text-[11px] text-indigo-600 font-medium">Checked in today</span>
        </div>

        {/* 4. Monthly Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Monthly Revenue
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(monthlyRevenue)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">This month</span>
        </div>

        {/* 5. Expiring Memberships */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Expiring Soon
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {expiringMembershipsCount}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Next 7 days</span>
        </div>

        {/* 6. Pending Payments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              Pending Dues
            </span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(pendingPaymentsAmount)}
          </div>
          <span className="text-[11px] text-orange-600 font-medium">Awaiting payment</span>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Monthly Revenue Trend</h3>
            <span className="text-xs text-slate-400">₹ INR</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${val ?? 0}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Growth Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Member Growth</h3>
            <span className="text-xs text-slate-400">Total Count</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberGrowthChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="members" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Trend Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Weekly Attendance</h3>
            <span className="text-xs text-slate-400">Daily Visits</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Recent Lists & Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Recent Members</h3>
            <Link
              to="/members"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentMembers.map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 text-xs flex items-center justify-center">
                    {m.fullName.charAt(0)}
                  </div>
                  <div>
                    <Link
                      to={`/members/${m.id}`}
                      className="text-xs font-bold text-slate-800 hover:text-emerald-600 block"
                    >
                      {m.fullName}
                    </Link>
                    <span className="text-[11px] text-slate-400">
                      {m.id} &bull; {getPlanName(m.planId)}
                    </span>
                  </div>
                </div>
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
              </div>
            ))}
          </div>
        </div>

        {/* Memberships Expiring Soon */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Expiring Soon (7 Days)</h3>
            <Link
              to="/memberships"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {expiringMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No memberships expiring within the next 7 days.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {expiringMembers.map((m) => {
                const daysLeft = calculateDaysRemaining(m.membershipExpiryDate);
                return (
                  <div key={m.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <Link
                        to={`/members/${m.id}`}
                        className="text-xs font-bold text-slate-800 hover:text-emerald-600 block"
                      >
                        {m.fullName}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        Expires: {formatDate(m.membershipExpiryDate)}
                      </span>
                    </div>
                    <Badge variant="warning">{daysLeft} days left</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's Attendance Snippet */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Today's Check-Ins</h3>
            <Link
              to="/attendance"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>View History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {todayAttendanceList.map((att) => {
              const mem = members.find((m) => m.id === att.memberId);
              return (
                <div key={att.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {mem?.fullName || att.memberId}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      In: {att.checkIn} {att.checkOut ? `| Out: ${att.checkOut}` : ''}
                    </span>
                  </div>
                  <Badge variant={att.status === 'Checked In' ? 'info' : 'active'}>
                    {att.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Recent Transactions</h3>
            <Link
              to="/payments"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPayments.map((p) => {
              const mem = members.find((m) => m.id === p.memberId);
              return (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {mem?.fullName || p.memberId}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {p.paymentMethod} &bull; {formatDate(p.date)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {formatCurrency(p.amount)}
                    </div>
                    <Badge variant={p.status === 'Paid' ? 'active' : 'pending'}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
