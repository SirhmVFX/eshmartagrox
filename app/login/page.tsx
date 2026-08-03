"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
      <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
      <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.316 0-9.828-3.328-11.537-7.975l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
      <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C39.712 39.129 44 32 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
    </svg>
  );
}

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Enter a valid email");
    if (!password) return setError("Enter your password");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 md:py-20 px-4">
      <div className="w-full max-w-md mx-auto border border-black/10 p-6 sm:p-8">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <p className="text-sm uppercase tracking-[0.3em] text-green-700">Welcome back</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mt-2">Access your saved orders, profile and export inquiries.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-4">{error}</div>}

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60 mb-5"
        >
          <GoogleIcon />
          {googleLoading ? "Signing in…" : "Continue with Google"}
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handle} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="w-full bg-green-900 text-white px-4 py-3 text-base font-semibold hover:bg-green-800 transition disabled:opacity-60" type="submit" disabled={loading || googleLoading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <div className="flex justify-between text-sm text-gray-500">
            <a href="/reset-password" className="text-green-700 hover:underline">Forgot password?</a>
            <a href="/register" className="text-green-700 hover:underline">Create account</a>
          </div>
        </form>
      </div>
    </div>
  );
}
