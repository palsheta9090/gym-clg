export type Gender = 'Male' | 'Female' | 'Other';
export type MemberStatus = 'Active' | 'Inactive' | 'Expired';
export type MembershipStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Frozen' | 'Cancelled';
export type AttendanceStatus = 'Present' | 'Checked In';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
export type PaymentStatus = 'Paid' | 'Pending';
export type PlanStatus = 'Active' | 'Inactive';
export type TrainerStatus = 'Active' | 'Inactive';

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  gymName: string;
  gymLogo?: string;
  address: string;
  currency: string;
}

export interface Member {
  id: string; // e.g. MEM-001
  fullName: string;
  photoUrl?: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;

  // Gym Info
  joiningDate: string;
  planId: string;
  membershipStartDate: string;
  membershipExpiryDate: string;
  assignedTrainerId?: string;
  status: MemberStatus;

  // Fitness Info
  height: string; // e.g. "175 cm"
  weight: string; // e.g. "72 kg"
  fitnessGoal: string; // e.g. "Weight Loss", "Muscle Gain"
}

export interface MembershipPlan {
  id: string;
  name: string; // Monthly, Quarterly, Half-Yearly, Yearly
  durationMonths: number;
  price: number;
  description: string;
  status: PlanStatus;
}

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  startDate: string;
  expiryDate: string;
  amount: number;
  status: MembershipStatus;
  daysRemaining?: number;
}

export interface Attendance {
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // e.g. "06:30 AM"
  checkOut?: string; // e.g. "08:00 AM"
  status: AttendanceStatus;
}

export interface Payment {
  id: string; // e.g. PAY-1001
  memberId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  paymentMethod: PaymentMethod;
  membershipPlanId?: string;
  reason: string;
  status: PaymentStatus;
  notes?: string;
}

export interface Invoice {
  invoiceNumber: string;
  paymentId: string;
  memberId: string;
  memberName: string;
  planName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  gymName: string;
  gymPhone: string;
  gymEmail: string;
  gymAddress: string;
}

export interface Trainer {
  id: string; // e.g. TRN-101
  name: string;
  phone: string;
  email: string;
  specialization: string;
  experience: string; // e.g. "4 Years"
  joiningDate: string;
  status: TrainerStatus;
}
