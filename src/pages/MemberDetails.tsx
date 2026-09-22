import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  UserCheck,
  Receipt,
  ShieldCheck,
} from 'lucide-react';

import { storageService } from '../services/storageService';
import type { Member, MembershipPlan, Trainer, Attendance, Payment } from '../types';
import { formatDate, formatCurrency, getTodayISO } from '../utils/formatters';
import { calculateDaysRemaining } from '../utils/calculations';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';

export const MemberDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<Member | null>(null);
  const [plan, setPlan] = useState<MembershipPlan | null>(null);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [memberAttendance, setMemberAttendance] = useState<Attendance[]>([]);
  const [memberPayments, setMemberPayments] = useState<Payment[]>([]);

  // Modals state
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [allPlans, setAllPlans] = useState<MembershipPlan[]>([]);

  // Renew form
  const [renewPlanId, setRenewPlanId] = useState('');
  
  // Quick payment form
  const [paymentAmount, setPaymentAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('UPI');
  const [paymentReason, setPaymentReason] = useState('Membership Renewal');

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const loadMemberData = () => {
    if (!id) return;
    const m = storageService.getMemberById(id);
    if (!m) return;
    setMember(m);

    const plansList = storageService.getPlans();
    setAllPlans(plansList);
    const p = plansList.find((item) => item.id === m.planId) || null;
    setPlan(p);
    if (p) setRenewPlanId(p.id);

    const trainersList = storageService.getTrainers();
    setTrainer(trainersList.find((t) => t.id === m.assignedTrainerId) || null);

    const atts = storageService.getAttendance().filter((a) => a.memberId === m.id);
    setMemberAttendance(atts);

    const pays = storageService.getPayments().filter((p) => p.memberId === m.id);
    setMemberPayments(pays);
  };

  useEffect(() => {
    loadMemberData();
  }, [id]);

  if (!member) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-slate-500 font-medium text-sm">Member profile not found.</p>
        <Link
          to="/members"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members</span>
        </Link>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(member.membershipExpiryDate);

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPlan = allPlans.find((p) => p.id === renewPlanId);
    if (!selectedPlan) return;

    const today = new Date();
    // Expiry extension: if current expiry date is in future, add from there; else add from today
    let baseDate = new Date();
    if (new Date(member.membershipExpiryDate) > today) {
      baseDate = new Date(member.membershipExpiryDate);
    }
    baseDate.setMonth(baseDate.getMonth() + selectedPlan.durationMonths);
    const newExpiry = baseDate.toISOString().split('T')[0];

    storageService.updateMember(member.id, {
      planId: selectedPlan.id,
      membershipExpiryDate: newExpiry,
      status: 'Active',
    });

    // Automatically record corresponding payment
    storageService.addPayment({
      memberId: member.id,
      date: getTodayISO(),
      amount: selectedPlan.price,
      paymentMethod: 'UPI',
      membershipPlanId: selectedPlan.id,
      reason: `Renewal: ${selectedPlan.name}`,
      status: 'Paid',
    });

    loadMemberData();
    setIsRenewModalOpen(false);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: `Membership renewed successfully until ${formatDate(newExpiry)}.`,
    });
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addPayment({
      memberId: member.id,
      date: getTodayISO(),
      amount: Number(paymentAmount),
      paymentMethod,
      reason: paymentReason,
      status: 'Paid',
    });

    loadMemberData();
    setIsPaymentModalOpen(false);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'Payment recorded successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/members')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members List</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRenewModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            Renew Membership
          </button>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            Record Payment
          </button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-2xl flex items-center justify-center border border-emerald-200 shadow-2xs">
            {member.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{member.fullName}</h2>
              <Badge
                variant={
                  member.status === 'Active'
                    ? 'active'
                    : member.status === 'Expired'
                    ? 'expired'
                    : 'inactive'
                }
              >
                {member.status}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1">
              ID: <span className="font-bold text-slate-700">{member.id}</span> &bull; Joined:{' '}
              {formatDate(member.joiningDate)}
            </div>
          </div>
        </div>

        {/* Membership Validity Quick Box */}
        <div className="w-full md:w-auto bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Plan & Expiry
            </span>
            <span className="text-sm font-bold text-slate-800">
              {plan?.name || 'Custom Plan'}
            </span>
            <div className="text-xs text-slate-500 mt-0.5">
              Expires: {formatDate(member.membershipExpiryDate)}
            </div>
          </div>
          <div className="pl-4 border-l border-slate-200 text-right">
            <span className="text-xs font-bold block text-emerald-600">
              {daysRemaining >= 0 ? `${daysRemaining} Days` : 'Expired'}
            </span>
            <span className="text-[10px] text-slate-400">Remaining</span>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Personal & Fitness Info */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
              Personal Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">{member.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{member.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{member.address || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>DOB: {formatDate(member.dateOfBirth)} ({member.gender})</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 pt-2 border-t">
                <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Emergency Contact</span>
                  <span className="font-semibold text-slate-800">
                    {member.emergencyContact || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
              Fitness Info & Trainer
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Height
                </span>
                <span className="text-sm font-bold text-slate-800">{member.height || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Weight
                </span>
                <span className="text-sm font-bold text-slate-800">{member.weight || 'N/A'}</span>
              </div>
            </div>
            <div className="text-xs pt-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Fitness Goal
              </span>
              <span className="font-semibold text-slate-800">{member.fitnessGoal}</span>
            </div>
            <div className="text-xs pt-3 border-t">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Assigned Trainer
              </span>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">
                  {trainer ? `${trainer.name} (${trainer.specialization})` : 'General Trainer'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Attendance & Payment Summaries */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance History */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Attendance Log Summary</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Total Visits: {memberAttendance.length}
              </span>
            </div>

            {memberAttendance.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No attendance records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Check-In</th>
                      <th className="py-2 px-3">Check-Out</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberAttendance.slice(0, 5).map((att) => (
                      <tr key={att.id}>
                        <td className="py-2 px-3 font-medium text-slate-700">
                          {formatDate(att.date)}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{att.checkIn}</td>
                        <td className="py-2 px-3 text-slate-600">{att.checkOut || '--'}</td>
                        <td className="py-2 px-3">
                          <Badge variant={att.status === 'Checked In' ? 'info' : 'active'}>
                            {att.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Payment History</span>
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                + Record Payment
              </button>
            </div>

            {memberPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No payment history recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500">
                      <th className="py-2 px-3">Payment ID</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Method</th>
                      <th className="py-2 px-3">Reason</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{p.id}</td>
                        <td className="py-2 px-3 text-slate-600">{formatDate(p.date)}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{p.paymentMethod}</td>
                        <td className="py-2 px-3 text-slate-600">{p.reason}</td>
                        <td className="py-2 px-3">
                          <Badge variant={p.status === 'Paid' ? 'active' : 'pending'}>
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Renew Membership */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title="Renew Membership"
      >
        <form onSubmit={handleRenewSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Select Membership Plan
            </label>
            <select
              value={renewPlanId}
              onChange={(e) => setRenewPlanId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              {allPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationMonths} Months) &bull; ₹{p.price}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
            <span className="font-bold block text-slate-800">Renewal Notice</span>
            <span>
              Extends validity from current date or expiry date. Automatically records a paid receipt.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsRenewModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs"
            >
              Confirm Renewal
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Quick Record Payment */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment"
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Amount (₹) *</label>
            <input
              type="number"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reason / Note</label>
            <input
              type="text"
              required
              value={paymentReason}
              onChange={(e) => setPaymentReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. Monthly Renewal Fee"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs"
            >
              Save Receipt
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
