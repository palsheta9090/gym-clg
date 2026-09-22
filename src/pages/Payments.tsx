import React, { useState, useEffect } from 'react';
import {
  Plus,
  Receipt,
  Search,
  Filter,
  Printer,
  Trash2,
  Dumbbell,
} from 'lucide-react';

import { storageService } from '../services/storageService';
import type { Payment, Member, PaymentMethod, PaymentStatus, Invoice } from '../types';
import { formatCurrency, formatDate, getTodayISO } from '../utils/formatters';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Toast } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    memberId: '',
    date: getTodayISO(),
    amount: 1500,
    paymentMethod: 'UPI' as PaymentMethod,
    reason: 'Monthly Membership Fee',
    status: 'Paid' as PaymentStatus,
    notes: '',
  });

  const loadData = () => {
    setPayments(storageService.getPayments());
    setMembers(storageService.getMembers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setFormData({
      memberId: members[0]?.id || '',
      date: getTodayISO(),
      amount: 1500,
      paymentMethod: 'UPI',
      reason: 'Monthly Membership Renewal',
      status: 'Paid',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId) return;

    const newPayment = storageService.addPayment({
      memberId: formData.memberId,
      date: formData.date,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      reason: formData.reason,
      status: formData.status,
      notes: formData.notes,
    });

    loadData();
    setIsAddModalOpen(false);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'Payment record created successfully.',
    });

    // Automatically trigger invoice preview for new payment
    viewInvoice(newPayment);
  };

  const handleDeleteConfirm = () => {
    if (deletePaymentId) {
      storageService.deletePayment(deletePaymentId);
      loadData();
      setDeletePaymentId(null);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: 'Payment record deleted.',
      });
    }
  };

  const getMemberName = (memberId: string) =>
    members.find((m) => m.id === memberId)?.fullName || memberId;

  const viewInvoice = (payment: Payment) => {
    const admin = storageService.getAdmin();
    const mem = members.find((m) => m.id === payment.memberId);

    const inv: Invoice = {
      invoiceNumber: `INV-${payment.id.replace('PAY-', '')}`,
      paymentId: payment.id,
      memberId: payment.memberId,
      memberName: mem?.fullName || payment.memberId,
      planName: payment.reason,
      paymentDate: payment.date,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      gymName: admin.gymName,
      gymPhone: admin.phone,
      gymEmail: admin.email,
      gymAddress: admin.address,
    };
    setSelectedInvoice(inv);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredPayments = payments.filter((p) => {
    const memName = getMemberName(p.memberId);
    const matchesSearch =
      memName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.memberId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Payments & Receipts</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track fee payments, generate simple printable invoices, and view billing history.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Payment ID or Member Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full md:w-36 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="All">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-36 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No payments found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Invoice / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{p.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">
                        {getMemberName(p.memberId)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{p.memberId}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(p.date)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{p.paymentMethod}</td>
                    <td className="py-3 px-4 text-slate-600">{p.reason}</td>
                    <td className="py-3 px-4">
                      <Badge variant={p.status === 'Paid' ? 'active' : 'pending'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => viewInvoice(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                        <button
                          onClick={() => setDeletePaymentId(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Record Payment */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record New Payment"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Member *</label>
            <select
              required
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.id} - {m.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                min={0}
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Method *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as PaymentStatus })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reason / Description *</label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. Quarterly Renewal Fee"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              placeholder="Transaction reference ID or remarks"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Simple Printable Invoice */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Payment Receipt / Invoice"
        maxWidth="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="printable-area p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-6">
              {/* Gym Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-emerald-600 text-white rounded flex items-center justify-center font-bold">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <span className="font-black text-lg text-slate-900 tracking-tight uppercase">
                      {selectedInvoice.gymName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs">{selectedInvoice.gymAddress}</p>
                  <p className="text-xs text-slate-500">
                    Phone: {selectedInvoice.gymPhone} | {selectedInvoice.gymEmail}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                    TAX INVOICE / RECEIPT
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 block">
                    {selectedInvoice.invoiceNumber}
                  </span>
                  <span className="text-xs text-slate-500">
                    Date: {formatDate(selectedInvoice.paymentDate)}
                  </span>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Billed To (Member)
                  </span>
                  <span className="font-bold text-slate-800 text-sm block">
                    {selectedInvoice.memberName}
                  </span>
                  <span className="text-slate-500 font-mono">Member ID: {selectedInvoice.memberId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Payment Details
                  </span>
                  <span className="font-semibold text-slate-700 block">
                    Method: {selectedInvoice.paymentMethod}
                  </span>
                  <span className="font-bold text-emerald-600 block">
                    Status: {selectedInvoice.status}
                  </span>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200/70 border-b text-[10px] font-bold uppercase text-slate-600">
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {selectedInvoice.planName}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(selectedInvoice.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Row */}
              <div className="flex justify-end text-xs">
                <div className="w-48 space-y-1 text-right">
                  <div className="flex justify-between py-1 text-slate-500">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-slate-300 font-bold text-sm text-slate-900">
                    <span>Total Paid:</span>
                    <span>{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                Thank you for training with FITFLOW Gym! This is a computer-generated receipt.
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 no-print">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs inline-flex items-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletePaymentId}
        onClose={() => setDeletePaymentId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment entry?"
        confirmText="Delete"
      />
    </div>
  );
};
