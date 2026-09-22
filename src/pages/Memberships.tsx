import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  CreditCard,
  Edit2,
  Trash2,
  Snowflake,
  Layers,
  Search,
} from 'lucide-react';

import { storageService } from '../services/storageService';
import type { Member, MembershipPlan, PlanStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateDaysRemaining, calculateMembershipStatus } from '../utils/calculations';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Toast } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';

export const Memberships: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Search member memberships
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // Modals state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  // Form State for Plan
  const [planFormData, setPlanFormData] = useState({
    name: '',
    durationMonths: 1,
    price: 1500,
    description: '',
    status: 'Active' as PlanStatus,
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const loadData = () => {
    setPlans(storageService.getPlans());
    setMembers(storageService.getMembers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddPlanModal = () => {
    setEditingPlan(null);
    setPlanFormData({
      name: '',
      durationMonths: 1,
      price: 1500,
      description: '',
      status: 'Active',
    });
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (p: MembershipPlan) => {
    setEditingPlan(p);
    setPlanFormData({
      name: p.name,
      durationMonths: p.durationMonths,
      price: p.price,
      description: p.description,
      status: p.status,
    });
    setIsPlanModalOpen(true);
  };

  const handlePlanFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      storageService.updatePlan(editingPlan.id, planFormData);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Plan updated successfully.',
      });
    } else {
      storageService.addPlan(planFormData);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Plan created successfully.',
      });
    }
    loadData();
    setIsPlanModalOpen(false);
  };

  const handleDeletePlanConfirm = () => {
    if (deletePlanId) {
      storageService.deletePlan(deletePlanId);
      loadData();
      setDeletePlanId(null);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: 'Plan deleted successfully.',
      });
    }
  };

  const handleFreezeToggle = (member: Member) => {
    const newStatus = member.status === 'Inactive' ? 'Active' : 'Inactive';
    storageService.updateMember(member.id, { status: newStatus });
    loadData();
    setToast({
      id: Date.now().toString(),
      type: 'info',
      message: `Membership status updated to ${newStatus}.`,
    });
  };

  const getPlanName = (planId: string) => plans.find((p) => p.id === planId)?.name || 'Custom';

  const filteredMembers = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchMemberQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Memberships & Plans</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure gym pricing packages and monitor active member memberships.
          </p>
        </div>
        <button
          onClick={openAddPlanModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* SECTION 1: Membership Plans */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Available Membership Packages</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between relative group hover:border-emerald-500/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}
                  </span>
                  <Badge variant={p.status === 'Active' ? 'active' : 'inactive'}>
                    {p.status}
                  </Badge>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1">{p.name}</h4>
                <div className="text-2xl font-black text-slate-900 my-2">
                  {formatCurrency(p.price)}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{p.description}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => openEditPlanModal(p)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeletePlanId(p.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Member Memberships List */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Active Member Memberships</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search member..."
              value={searchMemberQuery}
              onChange={(e) => setSearchMemberQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Days Remaining</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => {
                  const daysLeft = calculateDaysRemaining(m.membershipExpiryDate);
                  const memStatus = calculateMembershipStatus(m.membershipExpiryDate);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <Link
                          to={`/members/${m.id}`}
                          className="font-bold text-slate-800 hover:text-emerald-600 block"
                        >
                          {m.fullName}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-mono">{m.id}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {getPlanName(m.planId)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(m.membershipStartDate)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {formatDate(m.membershipExpiryDate)}
                      </td>
                      <td className="py-3 px-4">
                        {daysLeft < 0 ? (
                          <span className="font-bold text-rose-600">Expired ({Math.abs(daysLeft)}d ago)</span>
                        ) : daysLeft <= 7 ? (
                          <span className="font-bold text-amber-600">{daysLeft} Days Left</span>
                        ) : (
                          <span className="font-semibold text-emerald-600">{daysLeft} Days</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            m.status === 'Inactive'
                              ? 'inactive'
                              : memStatus === 'Active'
                              ? 'active'
                              : memStatus === 'Expiring Soon'
                              ? 'warning'
                              : 'expired'
                          }
                        >
                          {m.status === 'Inactive' ? 'Frozen' : memStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/members/${m.id}`}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded text-[11px]"
                          >
                            Renew / View
                          </Link>
                          <button
                            onClick={() => handleFreezeToggle(m)}
                            title={m.status === 'Inactive' ? 'Unfreeze Membership' : 'Freeze Membership'}
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded hover:bg-slate-100"
                          >
                            <Snowflake className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Create/Edit Membership Plan */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={editingPlan ? 'Edit Membership Package' : 'Create New Membership Package'}
      >
        <form onSubmit={handlePlanFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Plan Name *</label>
            <input
              type="text"
              required
              value={planFormData.name}
              onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. Monthly Plan, Yearly Gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Duration (Months) *</label>
              <input
                type="number"
                min={1}
                max={36}
                required
                value={planFormData.durationMonths}
                onChange={(e) =>
                  setPlanFormData({ ...planFormData, durationMonths: Number(e.target.value) })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Price (₹ INR) *</label>
              <input
                type="number"
                min={0}
                required
                value={planFormData.price}
                onChange={(e) =>
                  setPlanFormData({ ...planFormData, price: Number(e.target.value) })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={planFormData.description}
              onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              placeholder="Package highlights, facilities included..."
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Status</label>
            <select
              value={planFormData.status}
              onChange={(e) =>
                setPlanFormData({ ...planFormData, status: e.target.value as PlanStatus })
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs"
            >
              Save Package
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Plan Confirm Modal */}
      <ConfirmModal
        isOpen={!!deletePlanId}
        onClose={() => setDeletePlanId(null)}
        onConfirm={handleDeletePlanConfirm}
        title="Delete Membership Plan"
        message="Are you sure you want to delete this plan package?"
        confirmText="Delete Plan"
      />
    </div>
  );
};
