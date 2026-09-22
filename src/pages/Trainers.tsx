import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Phone,
  Mail,
  Award,
  Edit2,
  Trash2,
  Users,
} from 'lucide-react';

import { storageService } from '../services/storageService';
import type { Trainer, TrainerStatus, Member } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Toast } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';

export const Trainers: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: '',
    experience: '3 Years',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active' as TrainerStatus,
  });

  const loadData = () => {
    setTrainers(storageService.getTrainers());
    setMembers(storageService.getMembers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingTrainer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      specialization: 'General Fitness & Strength',
      experience: '3 Years',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Trainer) => {
    setEditingTrainer(t);
    setFormData({
      name: t.name,
      phone: t.phone,
      email: t.email,
      specialization: t.specialization,
      experience: t.experience,
      joiningDate: t.joiningDate,
      status: t.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrainer) {
      storageService.updateTrainer(editingTrainer.id, formData);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Trainer profile updated successfully.',
      });
    } else {
      storageService.addTrainer(formData);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Trainer added successfully.',
      });
    }
    loadData();
    setIsModalOpen(false);
  };

  const handleDeactivateConfirm = () => {
    if (deactivateId) {
      storageService.updateTrainer(deactivateId, { status: 'Inactive' });
      loadData();
      setDeactivateId(null);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: 'Trainer status set to Inactive.',
      });
    }
  };

  const getAssignedMemberCount = (trainerId: string) => {
    return members.filter((m) => m.assignedTrainerId === trainerId).length;
  };

  const filteredTrainers = trainers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gym Trainers</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage gym fitness instructors, specializations, and member assignments.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Trainer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search trainer by name, specialization or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Trainer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTrainers.map((t) => {
          const clientCount = getAssignedMemberCount(t.id);

          return (
            <div
              key={t.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-emerald-400 font-bold text-sm flex items-center justify-center">
                    {t.name.charAt(0)}
                  </div>
                  <Badge variant={t.status === 'Active' ? 'active' : 'inactive'}>
                    {t.status}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                <span className="text-[11px] font-mono font-semibold text-slate-400 block mb-2">
                  {t.id} &bull; Exp: {t.experience}
                </span>

                <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {t.specialization}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{t.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{clientCount} Clients</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(t)}
                    title="Edit Trainer"
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {t.status === 'Active' && (
                    <button
                      onClick={() => setDeactivateId(t.id)}
                      title="Deactivate Trainer"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add/Edit Trainer */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTrainer ? 'Edit Trainer Details' : 'Add New Gym Trainer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Trainer Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. Vikram Rathore"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                placeholder="trainer@fitflowgym.com"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Specialization *</label>
            <input
              type="text"
              required
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. Bodybuilding & Strength Training"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                placeholder="e.g. 5 Years"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as TrainerStatus })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs"
            >
              Save Trainer
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirm */}
      <ConfirmModal
        isOpen={!!deactivateId}
        onClose={() => setDeactivateId(null)}
        onConfirm={handleDeactivateConfirm}
        title="Deactivate Trainer"
        message="Are you sure you want to deactivate this trainer profile?"
        confirmText="Deactivate"
      />
    </div>
  );
};
