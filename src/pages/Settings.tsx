import React, { useState } from 'react';
import { Save, Building, ShieldCheck } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Toast } from '../components/ui/Toast';
import type { ToastMessage } from '../components/ui/Toast';

export const Settings: React.FC = () => {
  const currentAdmin = storageService.getAdmin();

  const [formData, setFormData] = useState({
    gymName: currentAdmin.gymName,
    phone: currentAdmin.phone,
    email: currentAdmin.email,
    address: currentAdmin.address,
    currency: 'INR',
    adminId: currentAdmin.id,
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateAdmin({
      gymName: formData.gymName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      currency: formData.currency,
    });

    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'Gym settings updated successfully.',
    });
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all mock demo data?')) {
      storageService.resetAll();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure gym business details, admin account info, and currency display.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gym Information Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Gym Information</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Gym Name *</label>
              <input
                type="text"
                required
                value={formData.gymName}
                onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Address *</label>
              <textarea
                rows={3}
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Admin & System Preferences */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Admin, Firebase & System Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Admin ID</label>
              <input
                type="text"
                readOnly
                value={formData.adminId}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Single owner account credential
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Database Engine</label>
              <input
                type="text"
                readOnly
                value="Firebase Cloud Firestore"
                className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 cursor-not-allowed"
              />
              <span className="text-[10px] text-amber-600 mt-1 block font-medium">
                Cloud Firestore Synced
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Default Currency</label>
              <input
                type="text"
                readOnly
                value="INR (₹)"
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                College project standard currency
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs rounded-lg border border-rose-200 transition-colors"
          >
            Reset Demo Data
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
