import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyANZAlzhgb9f4enweu9TcAo25JzgUcDkZs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'collage-d7daa.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'collage-d7daa',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'collage-d7daa.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1071634777244',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1071634777244:web:ddc262f31d056443c89959',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-590SBSTGXN',
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Safe Analytics initialization
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export const firebaseStatus = {
  projectId: firebaseConfig.projectId,
  isConfigured: true,
};
