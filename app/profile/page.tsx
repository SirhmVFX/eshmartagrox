"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import {
  getOrdersByEmail, getNotificationsForUser,
  markNotificationRead, markAllNotificationsRead,
  ClientOrder, OrderNotification,
} from "@/lib/firestore";
import { doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Package, Bell, User, Shield, ChevronRight, CheckCircle, Circle, Clock, Truck, Home, XCircle, AlertCircle } from "lucide-react";

// ── Status config ──────────────────────────────────────────────────────────

const ALL_STATUSES = ["received", "pending", "processing", "shipped", "out_for_delivery", "delivered"] as const;

const STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  received: { label: "Order Received", icon: CheckCircle, color: "text-blue-600" },
  pending: { label: "Pending", icon: Clock, color: "text-yellow-600" },
  processing: { label: "Processing", icon: AlertCircle, color: "text-orange-500" },
  shipped: { label: "Shipped", icon: Truck, color: "text-purple-600" },
  out_for_delivery: { label: "Out for Delivery", icon: Truck, color: "text-indigo-600" },
  delivered: { label: "Delivered", icon: Home, color: "text-green-600" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-500" },
};

function statusIndex(s: string): number {
  const idx = ALL_STATUSES.indexOf(s as any);
  return idx === -1 ? -1 : idx;
}

function fmtDate(val: any): string {
  if (!val) return "—";
  try {
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  } catch { return "—"; }
}

function fmtDatetime(val: any): string {
  if (!val) return "—";
  try {
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}

// ── Order status timeline ──────────────────────────────────────────────────

function OrderTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-500 text-xs mt-2">
        <XCircle size={14} /> Order cancelled
      </div>
    );
  }
  const current = statusIndex(status);
  return (
    <div className="flex items-center gap-0 mt-3 overflow-x-auto pb-1">
      {ALL_STATUSES.map((s, i) => {
        const done = i <= current;
        const active = i === current;
        const meta = STATUS_META[s];
        const Icon = meta.icon;
        return (
          <div key={s} className="flex items-center">
            <div className={`flex flex-col items-center gap-1 shrink-0 ${done ? "opacity-100" : "opacity-30"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${active ? "border-green-700 bg-green-700 text-white" : done ? "border-green-500 bg-green-50 text-green-600" : "border-gray-200 bg-white text-gray-400"}`}>
                <Icon size={13} />
              </div>
              <span className={`text-[9px] font-medium text-center leading-tight max-w-13 ${active ? "text-green-700" : done ? "text-gray-600" : "text-gray-400"}`}>
                {meta.label}
              </span>
            </div>
            {i < ALL_STATUSES.length - 1 && (
              <div className={`h-0.5 w-8 shrink-0 mb-4 ${i < current ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

type Tab = "profile" | "orders" | "notifications" | "security";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, updateProfileSimple, changePasswordSimple, logout } = useAuth();
  const { format } = useCurrency();

  const [tab, setTab] = useState<Tab>("profile");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);

  // Profile tab state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Security tab
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Orders tab
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Notifications tab
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // Redirect if not signed in
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  // Populate profile fields
  useEffect(() => {
    if (!user) return;
    setName(user.displayName ?? "");
    // Load extra fields from Firestore users doc
    import("firebase/firestore").then(({ getDoc, doc: fsDoc }) => {
      getDoc(fsDoc(db, "users", user.uid)).then(snap => {
        if (snap.exists()) {
          const d = snap.data();
          setPhone(d.phone ?? "");
          setAddress(d.address ?? "");
        }
      }).catch(() => { });
    });
  }, [user]);

  // Load orders when tab switches
  useEffect(() => {
    if (tab === "orders" && user && orders.length === 0) {
      setOrdersLoading(true);
      // Query by both email AND userId so guest orders and logged-in orders both show
      Promise.all([
        user.email ? getOrdersByEmail(user.email) : Promise.resolve([] as ClientOrder[]),
        getDocs(query(collection(db, "orders"), where("userId", "==", user.uid)))
          .then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() } as ClientOrder)))
          .catch(() => [] as ClientOrder[]),
      ])
        .then(([byEmail, byUid]) => {
          const seen = new Set<string>();
          const merged: ClientOrder[] = [];
          [...byEmail, ...byUid].forEach(o => {
            if (!seen.has(o.id)) { seen.add(o.id); merged.push(o); }
          });
          merged.sort((a, b) => {
            const ta = typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : a.createdAt?.toMillis?.() ?? 0;
            const tb = typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : b.createdAt?.toMillis?.() ?? 0;
            return tb - ta;
          });
          setOrders(merged);
        })
        .catch(() => { })
        .finally(() => setOrdersLoading(false));
    }
    if (tab === "notifications" && user?.uid && notifications.length === 0) {
      setNotifLoading(true);
      getNotificationsForUser(user.uid)
        .then(setNotifications)
        .catch(() => { })
        .finally(() => setNotifLoading(false));
    }
  }, [tab, user]);

  const flash = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileSimple(name);
      await setDoc(doc(db, "users", user!.uid), { name, phone, address }, { merge: true });
      flash("Profile saved successfully.");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to save.", "error");
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return flash("Password must be at least 6 characters.", "error");
    if (newPassword !== confirmPassword) return flash("Passwords do not match.", "error");
    setSaving(true);
    try {
      await changePasswordSimple(newPassword);
      setNewPassword(""); setConfirmPassword("");
      flash("Password changed successfully.");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to change password.", "error");
    } finally { setSaving(false); }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.uid);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleReadNotif = async (n: OrderNotification) => {
    if (!n.read && n.id) {
      await markNotificationRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
  };

  if (authLoading) {
    return <div className="w-[90%] mx-auto py-24 text-center text-gray-400 text-sm">Loading…</div>;
  }
  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 md:py-16">
      <div className="w-[90%] max-w-5xl mx-auto space-y-6">

        {/* Header card */}
        <div className="bg-white border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-green-900 text-white text-xl font-bold flex items-center justify-center shrink-0 uppercase">
            {(user.displayName ?? user.email ?? "U")[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{user.displayName || "Your Profile"}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.providerData?.[0]?.providerId === "google.com" && (
              <span className="text-xs text-blue-600 font-medium mt-1 inline-block">Signed in with Google</span>
            )}
          </div>
          <button
            onClick={async () => { await logout(); router.push("/"); }}
            className="text-sm text-red-600 border border-red-200 px-4 py-2 hover:bg-red-50 transition shrink-0"
          >
            Sign out
          </button>
        </div>

        {/* Flash message */}
        {message && (
          <div className={`border px-5 py-3 text-sm ${message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar nav — horizontal scrolling on mobile, vertical on desktop */}
          <aside className="md:w-52 shrink-0">
            <nav className="flex md:flex-col overflow-x-auto md:overflow-visible bg-white border border-gray-200">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2.5 px-4 py-3.5 text-sm font-medium transition-colors shrink-0 md:shrink md:w-full md:justify-between whitespace-nowrap border-b-2 md:border-b border-b-transparent md:border-gray-100 md:last:border-0 ${tab === t.id
                    ? "border-b-green-900 md:border-b-gray-100 md:bg-green-900 md:text-white text-green-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <t.icon size={15} />
                    {t.label}
                  </div>
                  <div className="flex items-center gap-1 ml-auto md:ml-0">
                    {t.badge && t.badge > 0 ? (
                      <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{t.badge}</span>
                    ) : (
                      <ChevronRight size={14} className="opacity-40 hidden md:block" />
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main panel */}
          <div className="flex-1 min-w-0">

            {/* ── PROFILE TAB ── */}
            {tab === "profile" && (
              <div className="bg-white border border-gray-200 p-6 space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Profile Details</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Update your name, phone number, and delivery address.</p>
                </div>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Full Name</label>
                    <input className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-green-700" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Email</label>
                    <input className="w-full border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-400 cursor-not-allowed" value={user.email ?? ""} disabled />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Phone</label>
                    <input className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-green-700" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Delivery Address</label>
                    <textarea className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-green-700 resize-none" rows={3} value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, city, state, country" />
                  </div>
                  <button type="submit" disabled={saving} className="bg-green-900 text-white px-6 py-3 text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60">
                    {saving ? "Saving…" : "Save Profile"}
                  </button>
                </form>
              </div>
            )}

            {/* ── ORDERS TAB ── */}
            {tab === "orders" && (
              <div className="bg-white border border-gray-200 p-6 space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">My Orders</h2>
                  <p className="text-xs text-gray-500 mt-0.5">All orders placed with your email address.</p>
                </div>
                {ordersLoading ? (
                  <div className="text-sm text-gray-400 text-center py-12">Loading orders…</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package size={36} className="text-gray-300 mx-auto" />
                    <p className="text-gray-500 text-sm">No orders yet.</p>
                    <Link href="/shop" className="inline-block border border-green-900 text-green-900 px-5 py-2 text-sm hover:bg-green-900 hover:text-white transition">Shop Now</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const meta = STATUS_META[order.status] ?? STATUS_META["pending"];
                      const Icon = meta.icon;
                      const isOpen = expandedOrder === order.id;
                      return (
                        <div key={order.id} className="border border-gray-200 overflow-hidden">
                          {/* Order header */}
                          <button
                            onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                            className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gray-50 transition"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                              <span className="font-mono font-bold text-sm text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                              <span className="text-xs text-gray-400">{fmtDate(order.createdAt)}</span>
                              <span className="text-sm font-semibold text-green-700">{format(order.totalAmount)}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`flex items-center gap-1 text-xs font-semibold ${meta.color}`}>
                                <Icon size={12} /> {meta.label}
                              </span>
                              <ChevronRight size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                            </div>
                          </button>

                          {/* Expanded detail */}
                          {isOpen && (
                            <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
                              {/* Timeline */}
                              <OrderTimeline status={order.status} />

                              {/* Items */}
                              <div>
                                <p className="text-xs font-semibold uppercase text-gray-500 mb-2">Items ({order.items?.length ?? 0})</p>
                                <div className="space-y-2">
                                  {(order.items ?? []).map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                      <span className="text-gray-700">{item.productName} × {item.quantity}</span>
                                      <span className="font-medium">{format(item.subtotal)}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-200 mt-2">
                                  <span>Total</span>
                                  <span className="text-green-700">{format(order.totalAmount)}</span>
                                </div>
                              </div>

                              {/* Meta */}
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                {order.paymentReference && <div><span className="text-gray-400">Ref: </span>{order.paymentReference}</div>}
                                <div><span className="text-gray-400">Payment: </span><span className={order.paymentStatus === "paid" ? "text-green-600 font-semibold" : ""}>{order.paymentStatus?.toUpperCase()}</span></div>
                              </div>

                              <Link href={`/track-my-order?ref=${order.paymentReference ?? order.id}`} className="text-xs text-green-700 hover:underline">
                                View full tracking →
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {tab === "notifications" && (
              <div className="bg-white border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Order updates and status changes.</p>
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-green-700 hover:underline font-medium">
                      Mark all read
                    </button>
                  )}
                </div>
                {notifLoading ? (
                  <div className="text-sm text-gray-400 text-center py-12">Loading…</div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <Bell size={36} className="text-gray-300 mx-auto" />
                    <p className="text-gray-500 text-sm">No notifications yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map(n => {
                      const meta = STATUS_META[n.status] ?? STATUS_META["pending"];
                      const Icon = meta.icon;
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleReadNotif(n)}
                          className={`flex items-start gap-3 py-4 cursor-pointer hover:bg-gray-50 transition px-1 ${!n.read ? "bg-green-50" : ""}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${!n.read ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{fmtDatetime(n.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-mono">Order #{n.orderRef}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-green-600 mt-2 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {tab === "security" && (
              <div className="bg-white border border-gray-200 p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Security</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Manage your password and account security.</p>
                </div>

                {/* Sign-in method */}
                <div className="border border-gray-100 p-4 space-y-1">
                  <p className="text-xs font-semibold uppercase text-gray-500">Sign-in Method</p>
                  <p className="text-sm text-gray-700">
                    {user.providerData?.[0]?.providerId === "google.com"
                      ? "Google Account"
                      : "Email & Password"}
                  </p>
                </div>

                {/* Change password — only for email/password accounts */}
                {user.providerData?.[0]?.providerId !== "google.com" ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <p className="text-sm font-semibold text-gray-800">Change Password</p>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">New Password</label>
                      <input
                        type="password"
                        className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-green-700"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-green-700"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                      />
                    </div>
                    <button type="submit" disabled={saving} className="bg-gray-900 text-white px-6 py-3 text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-60">
                      {saving ? "Updating…" : "Update Password"}
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-gray-500 border border-gray-100 p-4">
                    Your account uses Google Sign-In. Password management is handled through your Google account.
                  </p>
                )}

                {/* Delete / sign out */}
                <div className="border-t border-gray-100 pt-5 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Account Actions</p>
                  <button
                    onClick={async () => { await logout(); router.push("/"); }}
                    className="text-sm text-red-600 border border-red-200 px-4 py-2 hover:bg-red-50 transition"
                  >
                    Sign out of this device
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
