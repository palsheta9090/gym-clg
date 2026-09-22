import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';

import { storageService } from '../services/storageService';
import type { Member, MembershipPlan, Trainer, MemberStatus, Gender } from '../types';
import { formatDate } from '../utils/formatters';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Toast } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';

export const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [planFilter, setPlanFilter] = useState<string>('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Confirmation modal
  const [deactivateMemberId, setDeactivateMemberId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '2000-01-01',
    gender: 'Male' as Gender,
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    joiningDate: new Date().toISOString().split('T')[0],
    planId: '',
    membershipStartDate: new Date().toISOString().split('T')[0],
    membershipExpiryDate: '',
    assignedTrainerId: '',
    status: 'Active' as MemberStatus,
    height: '175 cm',
    weight: '70 kg',
    fitnessGoal: 'General Fitness & Conditioning',
  });

  const loadData = () => {
    setMembers(storageService.getMembers());
    setPlans(storageService.getPlans());
    setTrainers(storageService.getTrainers());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update expiry date based on selected plan and start date
  const handlePlanOrDateChange = (planId: string, startDateStr: string) => {
    const selectedPlan = plans.find((p) => p.id === planId);
    if (selectedPlan && startDateStr) {
      const start = new Date(startDateStr);
      start.setMonth(start.getMonth() + selectedPlan.durationMonths);
      const expiryStr = start.toISOString().split('T')[0];
      setFormData((prev) => ({
        ...prev,
        planId,
        membershipStartDate: startDateStr,
        membershipExpiryDate: expiryStr,
      }));
    } else {
      setFormData((prev) => ({ ...prev, planId, membershipStartDate: startDateStr }));
    }
  };

  const resetForm = () => {
    const defaultPlan = plans[0]?.id || '';
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      fullName: '',
      dateOfBirth: '2000-01-01',
      gender: 'Male',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      joiningDate: today,
      planId: defaultPlan,
      membershipStartDate: today,
      membershipExpiryDate: '',
      assignedTrainerId: '',
      status: 'Active',
      height: '175 cm',
      weight: '70 kg',
      fitnessGoal: 'General Fitness',
    });
    if (defaultPlan) {
      handlePlanOrDateChange(defaultPlan, today);
    }
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      fullName: member.fullName,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      phone: member.phone,
      email: member.email,
      address: member.address,
      emergencyContact: member.emergencyContact,
      joiningDate: member.joiningDate,
      planId: member.planId,
      membershipStartDate: member.membershipStartDate,
      membershipExpiryDate: member.membershipExpiryDate,
      assignedTrainerId: member.assignedTrainerId || '',
      status: member.status,
      height: member.height,
      weight: member.weight,
      fitnessGoal: member.fitnessGoal,
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addMember(formData);
    loadData();
    setIsAddModalOpen(false);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'Member added successfully.',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember) {
      storageService.updateMember(selectedMember.id, formData);
      loadData();
      setIsEditModalOpen(false);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Member updated successfully.',
      });
    }
  };

  const handleDeactivateConfirm = () => {
    if (deactivateMemberId) {
      storageService.deleteMember(deactivateMemberId);
      loadData();
      setDeactivateMemberId(null);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: 'Member permanently deleted from Firebase database.',
      });
    }
  };

  // Filtering
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesPlan = planFilter === 'All' || m.planId === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getPlanName = (planId: string) => plans.find((p) => p.id === planId)?.name || 'Custom';
  const getTrainerName = (trainerId?: string) =>
    trainers.find((t) => t.id === trainerId)?.name || 'Unassigned';

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Members Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage gym members, profiles, and active memberships.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-4">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Member ID, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-36 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {/* Membership Plan filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full md:w-40 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-500">No members found.</p>
            <button
              onClick={openAddModal}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              + Add Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Membership</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Trainer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{m.id}</td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/members/${m.id}`}
                        className="font-bold text-slate-800 hover:text-emerald-600 transition-colors"
                      >
                        {m.fullName}
                      </Link>
                      <div className="text-[11px] text-slate-400">{m.gender} &bull; {m.fitnessGoal}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">{m.phone}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {getPlanName(m.planId)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(m.membershipExpiryDate)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {getTrainerName(m.assignedTrainerId)}
                    </td>
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
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/members/${m.id}`}
                          title="View Profile"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(m)}
                          title="Edit Member"
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeactivateMemberId(m.id)}
                          title="Delete Member from Firebase"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
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

      {/* Modal: Add Member */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Member"
        maxWidth="2xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Info */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b">
                Personal Information
              </h4>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Rahul Patel"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">DOB *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  placeholder="rahul@example.com"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  placeholder="Street, Area, City"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  placeholder="+91 98765 00000 (Father)"
                />
              </div>
            </div>

            {/* Gym & Fitness Info */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b">
                Membership & Fitness Details
              </h4>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Membership Plan *</label>
                <select
                  required
                  value={formData.planId}
                  onChange={(e) => handlePlanOrDateChange(e.target.value, formData.membershipStartDate)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                >
                  <option value="">Select Plan</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.durationMonths} Mo - ₹{p.price})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.membershipStartDate}
                    onChange={(e) => handlePlanOrDateChange(formData.planId, e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    readOnly
                    value={formData.membershipExpiryDate}
                    className="w-full p-2 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Assign Trainer</label>
                <select
                  value={formData.assignedTrainerId}
                  onChange={(e) => setFormData({ ...formData, assignedTrainerId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                >
                  <option value="">None (General Training)</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialization})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Height</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                    placeholder="175 cm"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Weight</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                    placeholder="70 kg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Fitness Goal</label>
                <input
                  type="text"
                  value={formData.fitnessGoal}
                  onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  placeholder="Weight Loss, Muscle Gain, etc."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
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
              Save Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Member */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Member Details (${selectedMember?.id})`}
        maxWidth="2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b">
                Personal Information
              </h4>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberStatus })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b">
                Gym & Trainer Settings
              </h4>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Membership Plan</label>
                <select
                  value={formData.planId}
                  onChange={(e) => handlePlanOrDateChange(e.target.value, formData.membershipStartDate)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.durationMonths} Mo)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.membershipExpiryDate}
                  onChange={(e) => setFormData({ ...formData, membershipExpiryDate: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Trainer</label>
                <select
                  value={formData.assignedTrainerId}
                  onChange={(e) => setFormData({ ...formData, assignedTrainerId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                >
                  <option value="">None (General Floor)</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Height</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Weight</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Fitness Goal</label>
                <input
                  type="text"
                  value={formData.fitnessGoal}
                  onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs"
            >
              Update Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deactivateMemberId}
        onClose={() => setDeactivateMemberId(null)}
        onConfirm={handleDeactivateConfirm}
        title="Delete Member from Firebase"
        message="Are you sure you want to delete this member? This will permanently remove their record from your Firebase Cloud Firestore database."
        confirmText="Delete Member"
      />
    </div>
  );
};
