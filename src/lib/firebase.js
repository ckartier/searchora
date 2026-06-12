// Firebase configuration
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
  : undefined;

// App Hosting injects the Firebase web configuration for no-argument initialization.
const app = getApps().length === 0
  ? firebaseConfig
    ? initializeApp(firebaseConfig)
    : initializeApp()
  : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
