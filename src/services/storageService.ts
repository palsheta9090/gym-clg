import type { Admin, Member, MembershipPlan, Attendance, Payment, Trainer } from '../types';
import { initialAdmin, initialMembers, initialPlans, initialAttendance, initialPayments, initialTrainers } from '../data/mockData';
import { getTodayISO, getCurrentTimeFormatted } from '../utils/formatters';
import { firebaseService } from './firebaseService';

const STORAGE_KEYS = {
  ADMIN: 'fitflow_admin',
  MEMBERS: 'fitflow_members',
  PLANS: 'fitflow_plans',
  ATTENDANCE: 'fitflow_attendance',
  PAYMENTS: 'fitflow_payments',
  TRAINERS: 'fitflow_trainers',
};

// Initialize LocalStorage & Firestore sync
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(initialAdmin));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initialMembers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(initialPlans));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initialAttendance));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(initialPayments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRAINERS)) {
    localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(initialTrainers));
  }

  // Seed Firestore if empty
  firebaseService.seedFirestoreIfEmpty();

  // Setup real-time listeners to keep LocalStorage in sync with Cloud Firestore
  firebaseService.subscribeCollection<Member>('members', (data) => {
    if (data && data.length > 0) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data));
    }
  });

  firebaseService.subscribeCollection<MembershipPlan>('plans', (data) => {
    if (data && data.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(data));
    }
  });

  firebaseService.subscribeCollection<Attendance>('attendance', (data) => {
    if (data && data.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data));
    }
  });

  firebaseService.subscribeCollection<Payment>('payments', (data) => {
    if (data && data.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(data));
    }
  });

  firebaseService.subscribeCollection<Trainer>('trainers', (data) => {
    if (data && data.length > 0) {
      localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(data));
    }
  });
};

initStorage();

export const storageService = {
  // --- ADMIN ---
  getAdmin: (): Admin => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN) || JSON.stringify(initialAdmin));
  },
  updateAdmin: (updated: Partial<Admin>): Admin => {
    const current = storageService.getAdmin();
    const newAdmin = { ...current, ...updated };
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(newAdmin));
    firebaseService.saveDocument('admin', newAdmin.id, newAdmin);
    return newAdmin;
  },

  // --- MEMBERS ---
  getMembers: (): Member[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || JSON.stringify(initialMembers));
  },
  getMemberById: (id: string): Member | undefined => {
    return storageService.getMembers().find(m => m.id === id);
  },
  addMember: (memberData: Omit<Member, 'id'>): Member => {
    const members = storageService.getMembers();
    const nextIdNum = members.length > 0
      ? Math.max(...members.map(m => parseInt(m.id.replace('MEM-', '') || '0'))) + 1
      : 1;
    const newId = `MEM-${String(nextIdNum).padStart(3, '0')}`;
    const newMember: Member = { ...memberData, id: newId };
    const updatedList = [newMember, ...members];
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updatedList));

    // Save to Firebase Firestore
    firebaseService.saveDocument('members', newMember.id, newMember);
    return newMember;
  },
  updateMember: (id: string, updatedData: Partial<Member>): Member => {
    const members = storageService.getMembers();
    let updatedMember!: Member;
    const updatedList = members.map(m => {
      if (m.id === id) {
        updatedMember = { ...m, ...updatedData };
        return updatedMember;
      }
      return m;
    });
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updatedList));

    // Save to Firebase Firestore
    if (updatedMember) {
      firebaseService.saveDocument('members', updatedMember.id, updatedMember);
    }
    return updatedMember;
  },

  // Permanent Delete Member from LocalStorage & Firebase Firestore
  deleteMember: (id: string): void => {
    const members = storageService.getMembers();
    const updatedList = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updatedList));

    // Permanently remove document from Firebase Firestore
    firebaseService.removeDocument('members', id);
  },

  // --- PLANS ---
  getPlans: (): MembershipPlan[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS) || JSON.stringify(initialPlans));
  },
  addPlan: (planData: Omit<MembershipPlan, 'id'>): MembershipPlan => {
    const plans = storageService.getPlans();
    const nextId = `PLAN-0${plans.length + 1}`;
    const newPlan: MembershipPlan = { ...planData, id: nextId };
    const updatedList = [...plans, newPlan];
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(updatedList));

    firebaseService.saveDocument('plans', newPlan.id, newPlan);
    return newPlan;
  },
  updatePlan: (id: string, updatedData: Partial<MembershipPlan>): MembershipPlan => {
    const plans = storageService.getPlans();
    let updatedPlan!: MembershipPlan;
    const updatedList = plans.map(p => {
      if (p.id === id) {
        updatedPlan = { ...p, ...updatedData };
        return updatedPlan;
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(updatedList));

    if (updatedPlan) {
      firebaseService.saveDocument('plans', updatedPlan.id, updatedPlan);
    }
    return updatedPlan;
  },
  deletePlan: (id: string): void => {
    const plans = storageService.getPlans();
    const updatedList = plans.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(updatedList));

    firebaseService.removeDocument('plans', id);
  },

  // --- ATTENDANCE ---
  getAttendance: (): Attendance[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || JSON.stringify(initialAttendance));
  },
  checkInMember: (memberId: string): Attendance => {
    const records = storageService.getAttendance();
    const today = getTodayISO();
    const currentTime = getCurrentTimeFormatted();

    const existing = records.find(r => r.memberId === memberId && r.date === today && r.status === 'Checked In');
    if (existing) return existing;

    const newRecord: Attendance = {
      id: `ATT-${Date.now().toString().slice(-5)}`,
      memberId,
      date: today,
      checkIn: currentTime,
      status: 'Checked In',
    };
    const updatedList = [newRecord, ...records];
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updatedList));

    firebaseService.saveDocument('attendance', newRecord.id, newRecord);
    return newRecord;
  },
  checkOutMember: (attendanceId: string): Attendance => {
    const records = storageService.getAttendance();
    const currentTime = getCurrentTimeFormatted();
    let updatedRecord!: Attendance;
    const updatedList = records.map(r => {
      if (r.id === attendanceId) {
        updatedRecord = {
          ...r,
          checkOut: currentTime,
          status: 'Present' as const,
        };
        return updatedRecord;
      }
      return r;
    });
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updatedList));

    if (updatedRecord) {
      firebaseService.saveDocument('attendance', updatedRecord.id, updatedRecord);
    }
    return updatedRecord;
  },

  // --- PAYMENTS ---
  getPayments: (): Payment[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || JSON.stringify(initialPayments));
  },
  addPayment: (paymentData: Omit<Payment, 'id'>): Payment => {
    const payments = storageService.getPayments();
    const nextIdNum = payments.length > 0
      ? Math.max(...payments.map(p => parseInt(p.id.replace('PAY-', '') || '1000'))) + 1
      : 1001;
    const newId = `PAY-${nextIdNum}`;
    const newPayment: Payment = { ...paymentData, id: newId };
    const updatedList = [newPayment, ...payments];
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updatedList));

    firebaseService.saveDocument('payments', newPayment.id, newPayment);
    return newPayment;
  },
  updatePayment: (id: string, updatedData: Partial<Payment>): Payment => {
    const payments = storageService.getPayments();
    let updatedPayment!: Payment;
    const updatedList = payments.map(p => {
      if (p.id === id) {
        updatedPayment = { ...p, ...updatedData };
        return updatedPayment;
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updatedList));

    if (updatedPayment) {
      firebaseService.saveDocument('payments', updatedPayment.id, updatedPayment);
    }
    return updatedPayment;
  },
  deletePayment: (id: string): void => {
    const payments = storageService.getPayments();
    const updatedList = payments.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updatedList));

    firebaseService.removeDocument('payments', id);
  },

  // --- TRAINERS ---
  getTrainers: (): Trainer[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRAINERS) || JSON.stringify(initialTrainers));
  },
  addTrainer: (trainerData: Omit<Trainer, 'id'>): Trainer => {
    const trainers = storageService.getTrainers();
    const nextId = `TRN-10${trainers.length + 1}`;
    const newTrainer: Trainer = { ...trainerData, id: nextId };
    const updatedList = [...trainers, newTrainer];
    localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(updatedList));

    firebaseService.saveDocument('trainers', newTrainer.id, newTrainer);
    return newTrainer;
  },
  updateTrainer: (id: string, updatedData: Partial<Trainer>): Trainer => {
    const trainers = storageService.getTrainers();
    let updatedTrainer!: Trainer;
    const updatedList = trainers.map(t => {
      if (t.id === id) {
        updatedTrainer = { ...t, ...updatedData };
        return updatedTrainer;
      }
      return t;
    });
    localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(updatedList));

    if (updatedTrainer) {
      firebaseService.saveDocument('trainers', updatedTrainer.id, updatedTrainer);
    }
    return updatedTrainer;
  },

  deleteTrainer: (id: string): void => {
    const trainers = storageService.getTrainers();
    const updatedList = trainers.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(updatedList));

    firebaseService.removeDocument('trainers', id);
  },

  resetAll: () => {
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(initialAdmin));
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initialMembers));
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(initialPlans));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initialAttendance));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(initialPayments));
    localStorage.setItem(STORAGE_KEYS.TRAINERS, JSON.stringify(initialTrainers));

    firebaseService.seedFirestoreIfEmpty();
  }
};
