"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfileSimple, changePasswordSimple } = useAuth();
  const [name, setName] = useState(user?.displayName ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoadingState(true);
    try {
      await updateProfileSimple(name);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoadingState(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pw = (e.target as any).pw?.value;
    if (!pw || pw.length < 6) return setMessage("Password must be at least 6 characters");
    setLoadingState(true);
    try {
      await changePasswordSimple(pw);
      setMessage("Password changed successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoadingState(false);
    }
  };

  if (loading) {
    return <div className="w-[90%] max-w-md mx-auto py-24 text-center text-gray-500">Loading your profile...</div>;
  }

  if (!user) {
    return <div className="w-[90%] max-w-md mx-auto py-24 text-center text-gray-500">Please sign in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-green-50 py-20">
      <div className="w-[90%] max-w-3xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex flex-col gap-1">
            <p className="text-sm uppercase tracking-[0.3em] text-green-700">Account</p>
            <h1 className="text-3xl font-bold text-gray-900">Your profile</h1>
            <p className="text-sm text-gray-500 mt-2">Manage your account details, display name, and password.</p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 p-6 bg-green-50">
              <p className="text-sm text-gray-500 uppercase tracking-[0.2em] mb-3">Signed in as</p>
              <p className="text-lg font-semibold text-gray-900">{user.email}</p>
              <p className="text-sm text-gray-600 mt-2">Display name: {user.displayName || "Not set"}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 p-6 bg-white">
              <p className="text-sm text-gray-500 uppercase tracking-[0.2em] mb-3">Saved info</p>
              <p className="text-sm text-gray-600">Update your display name and keep your account current.</p>
            </div>
          </div>
        </div>

        {message && <div className="rounded-3xl bg-green-100 border border-green-200 px-5 py-4 text-green-900">{message}</div>}

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile details</h2>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full name</label>
                <input className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <button className="w-full bg-green-900 text-white rounded-2xl px-4 py-3 font-semibold hover:bg-green-800 transition" disabled={loadingState}>{loadingState ? "Saving..." : "Save profile"}</button>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Change password</h2>
            <form onSubmit={handlePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New password</label>
                <input name="pw" className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" type="password" />
              </div>
              <button className="w-full bg-gray-100 text-gray-900 rounded-2xl px-4 py-3 font-semibold hover:bg-gray-200 transition" disabled={loadingState}>{loadingState ? "Updating..." : "Change password"}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
