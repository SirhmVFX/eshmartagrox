"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Enter your full name");
    if (!email.includes("@")) return setError("Enter a valid email");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await signup(email, password, name || undefined);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20">
      <div className="w-350 max-w-md mx-auto border border-black/10 p-8">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <p className="text-sm uppercase tracking-[0.3em] text-green-700">New account</p>
          <h1 className="text-3xl font-bold mt-2 text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-2">Register once to save your cart, track orders and manage profile details.</p>
        </div>
        <form onSubmit={handle} className="space-y-5">
          {error && <div className=" bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input className="w-full border border-gray-200  px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input className="w-full border border-gray-200  px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input className="w-full border border-gray-200  px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="w-full bg-green-900 text-white  px-4 py-3 text-base font-semibold hover:bg-green-800 transition" type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
          <div className="text-sm text-gray-500 text-center">Already have an account? <a href="/login" className="text-green-700 hover:underline">Sign in</a></div>
        </form>
      </div>
    </div>
  );
}
