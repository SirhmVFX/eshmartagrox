"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "./firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  updateProfileSimple: (name: string) => Promise<void>;
  changePasswordSimple: (next: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    await sendEmailVerification(cred.user);
    // Write to Firestore users collection so admin can see signups
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      name: name ?? "",
      phone: "",
      address: "",
      orders: [],
      createdAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    // Create or update the Firestore users doc so admin can see Google sign-ins
    const userDoc = doc(db, "users", cred.user.uid);
    const existing = await getDoc(userDoc);
    if (!existing.exists()) {
      await setDoc(userDoc, {
        email: cred.user.email ?? "",
        name: cred.user.displayName ?? "",
        phone: "",
        address: "",
        orders: [],
        createdAt: serverTimestamp(),
      });
    }
  };

  const updateUserProfile = async (name: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
      setUser({ ...auth.currentUser });
    }
  };

  const changePassword = async (current: string, next: string) => {
    if (!auth.currentUser?.email) throw new Error("No user");
    const cred = EmailAuthProvider.credential(auth.currentUser.email, current);
    await reauthenticateWithCredential(auth.currentUser, cred);
    await updatePassword(auth.currentUser, next);
  };

  const updateProfileSimple = async (name: string) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
      // Sync name to Firestore users doc
      try {
        await setDoc(doc(db, "users", auth.currentUser.uid), { name }, { merge: true });
      } catch {
        // Ignore if doc doesn't exist (e.g., anonymous user)
      }
      setUser({ ...auth.currentUser });
    }
  };

  const changePasswordSimple = async (next: string) => {
    if (!auth.currentUser) throw new Error("No user");
    await updatePassword(auth.currentUser, next);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, resetPassword, loginWithGoogle, updateUserProfile, changePassword, updateProfileSimple, changePasswordSimple }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
