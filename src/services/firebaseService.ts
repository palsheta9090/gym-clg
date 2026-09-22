import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '../config/firebase';
import { initialAdmin, initialMembers, initialPlans, initialAttendance, initialPayments, initialTrainers } from '../data/mockData';

export const firebaseService = {
  // Real-time listener for any Firestore collection
  subscribeCollection: <T>(collectionName: string, onUpdate: (data: T[]) => void): Unsubscribe => {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((docSnap) => docSnap.data() as T);
          onUpdate(items);
        }
      },
      (error) => {
        console.warn(`Firestore listener error on [${collectionName}]:`, error);
      }
    );
  },

  // Seed Firestore if empty
  seedFirestoreIfEmpty: async (): Promise<boolean> => {
    try {
      const membersRef = collection(db, 'members');
      const snapshot = await getDocs(membersRef);
      if (snapshot.empty) {
        console.log('Firestore is empty. Initializing collections with demo seed data...');
        const batch = writeBatch(db);

        batch.set(doc(db, 'admin', initialAdmin.id), initialAdmin);

        initialPlans.forEach((plan) => {
          batch.set(doc(db, 'plans', plan.id), plan);
        });

        initialTrainers.forEach((trainer) => {
          batch.set(doc(db, 'trainers', trainer.id), trainer);
        });

        initialMembers.forEach((member) => {
          batch.set(doc(db, 'members', member.id), member);
        });

        initialAttendance.forEach((att) => {
          batch.set(doc(db, 'attendance', att.id), att);
        });

        initialPayments.forEach((pay) => {
          batch.set(doc(db, 'payments', pay.id), pay);
        });

        await batch.commit();
        console.log('Firebase Firestore successfully populated!');
      }
      return true;
    } catch (err) {
      console.warn('Firebase Firestore seeding fallback:', err);
      return false;
    }
  },

  // Save or update document in Firestore
  saveDocument: async (collectionName: string, docId: string, data: any): Promise<boolean> => {
    try {
      await setDoc(doc(db, collectionName, docId), data, { merge: true });
      console.log(`Firestore document saved: ${collectionName}/${docId}`);
      return true;
    } catch (err) {
      console.error(`Firestore save error on ${collectionName}/${docId}:`, err);
      return false;
    }
  },

  // Permanently delete document from Firestore
  removeDocument: async (collectionName: string, docId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      console.log(`Firestore document DELETED: ${collectionName}/${docId}`);
      return true;
    } catch (err) {
      console.error(`Firestore delete error on ${collectionName}/${docId}:`, err);
      return false;
    }
  },

  // Fetch all documents from collection
  getCollection: async <T>(collectionName: string): Promise<T[]> => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      if (snapshot.empty) return [];
      return snapshot.docs.map((docSnap) => docSnap.data() as T);
    } catch (err) {
      console.warn(`Firestore fetch error on ${collectionName}:`, err);
      return [];
    }
  },
};
