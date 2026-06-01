"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
+    setLoading(true);
    try {
      await resetPassword(email);
      setStatus("If an account exists, a reset email was sent.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to send reset");
    } finally {
+      setLoading(false);
    }
  };

  return (
    <div className="w-[90%] max-w-md mx-auto py-24">
      <h1 className="text-2xl font-bold mb-4">Reset password</h1>
      <form onSubmit={handle} className="space-y-4">
        {status && <p className="text-sm text-green-600">{status}</p>}
        <div>
          <label className="block text-sm">Email</label>
          <input className="w-full" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button className="bg-green-900 text-white px-4 py-2 rounded" type="submit" disabled={loading}>{loading ? "Sending..." : "Send reset email"}</button>
      </form>
    </div>
  );
}
