import type { Member, Attendance, Payment, MembershipStatus } from '../types';
import { getTodayISO } from './formatters';

export const calculateDaysRemaining = (expiryDateString: string): number => {
  if (!expiryDateString) return 0;
  const today = new Date(getTodayISO()).getTime();
  const expiry = new Date(expiryDateString).getTime();
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateMembershipStatus = (expiryDateString: string): MembershipStatus => {
  const days = calculateDaysRemaining(expiryDateString);
  if (days < 0) return 'Expired';
  if (days <= 7) return 'Expiring Soon';
  return 'Active';
};

export const calculateActiveMembers = (members: Member[]): number => {
  return members.filter(m => m.status === 'Active').length;
};

export const calculateTodayAttendance = (attendanceRecords: Attendance[]): number => {
  const today = getTodayISO();
  return attendanceRecords.filter(a => a.date === today).length;
};

export const calculateMonthlyRevenue = (payments: Payment[]): number => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return payments
    .filter(p => {
      if (p.status !== 'Paid') return false;
      const pDate = new Date(p.date);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.amount, 0);
};

export const calculateExpiringMemberships = (members: Member[]): number => {
  return members.filter(m => {
    if (m.status === 'Inactive') return false;
    const days = calculateDaysRemaining(m.membershipExpiryDate);
    return days >= 0 && days <= 7;
  }).length;
};

export const calculatePendingPayments = (payments: Payment[]): number => {
  return payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);
};
