import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student } from '../types/quiz';

let app: any = null;
let authInstance: any = null;
let providerInstance: GoogleAuthProvider | null = null;

try {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  providerInstance = new GoogleAuthProvider();
  providerInstance.addScope('https://www.googleapis.com/auth/spreadsheets');
  providerInstance.addScope('https://www.googleapis.com/auth/drive.file');
} catch (e) {
  console.warn('Firebase initialization warning:', e);
}

export const auth = authInstance;
export const provider = providerInstance;

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth || !provider) {
    throw new Error('Firebase Auth is not available in this environment');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google sign in');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  if (auth) {
    await auth.signOut();
  }
  cachedAccessToken = null;
};

export const verifyStudentCredentials = (
  students: Student[],
  identifier: string,
  pass: string
): Student | null => {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();
  return (
    students.find(
      s =>
        (s.id.toLowerCase() === cleanId || s.username.toLowerCase() === cleanId) &&
        s.password === cleanPass
    ) || null
  );
};
