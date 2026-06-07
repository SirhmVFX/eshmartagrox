"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-[70vh] flex items-center justify-center py-20">
      <div className="w-350 max-w-md mx-auto border border-black/10 p-8">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <p className="text-sm uppercase tracking-[0.3em] text-green-700">Welcome back</p>
          <h1 className="text-3xl font-bold mt-2 text-gray-900">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mt-2">Access your saved orders, profile and export inquiries.</p>
        </div>
        <form onSubmit={handle} className="space-y-5">
          {error && <div className=" bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input className="w-full border border-gray-200  px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input className="w-full border border-gray-200  px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="flex items-center justify-between gap-4">
            <button className="w-full bg-green-900 text-white  px-4 py-3 text-base font-semibold hover:bg-green-800 transition" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <a href="/reset-password" className="text-green-700 hover:underline">Forgot password?</a>
            <a href="/register" className="text-green-700 hover:underline">Create account</a>
          </div>
        </form>
      </div>
    </div>
  );
}
