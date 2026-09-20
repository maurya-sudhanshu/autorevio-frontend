"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Edit2, X, Check, XCircle, Upload, Plus, Trash2, ChevronRight, MessageSquare, Clock, ImageIcon, ShieldCheck, Send, AlertCircle, Loader2 } from "lucide-react";

type UserWithSub = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  businessesCount: number;
  subscription: {
    plan: string;
    aiTokensUsed?: number;
    aiTokensLimit: number;
    maxBranches: number;
    maxStoreOwners?: number;
    createdAt?: string;
    expiresAt?: string | null;
    isExpired?: boolean;
    reason?: string | null;
  } | null;
  createdByAgentId?: string | null;
};

type Verification = {
  id: string;
  user_id: string;
  fullName: string;
  email: string;
  plan: string;
  utr_number: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type DbPlan = {
  id: string;
  name: string;
  plan_key: string;
  price: number;
  ai_tokens_limit: number;
  max_branches: number;
  max_store_owners: number;
  type: "user" | "agent";
  features: string;
};

function AdminUsersContent() {
  const [users, setUsers] = useState<UserWithSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithSub | null>(null);

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"owner" | "agent" | "admin" | "utr" | "plans" | "settings" | "support">("owner");

  // Modal states
  const [editRole, setEditRole] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState<string>("never");
  const [saving, setSaving] = useState(false);

  const openEditModal = (user: UserWithSub) => {
    setEditingUser(user);
    setEditRole(user.role);
    const matchedPlan = dbPlans.find(p => p.plan_key === user.subscription?.plan);
    setEditPlan(matchedPlan?.plan_key || (user.role === "agent" ? "agent_basic" : "silver"));
    if (user.subscription?.expiresAt) {
      const d = new Date(user.subscription.expiresAt);
      if (!isNaN(d.getTime())) {
        setEditExpiresAt(d.toISOString().split("T")[0]);
      } else {
        setEditExpiresAt("never");
      }
    } else {
      setEditExpiresAt("never");
    }
  };

  const handleRoleChange = (newRole: string) => {
    setEditRole(newRole);
    if (newRole === "owner") {
      setEditPlan("silver");
    } else if (newRole === "agent") {
      setEditPlan("agent_basic");
    } else {
      setEditPlan("none");
    }
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editRole,
          plan: editPlan,
          expiresAt: editExpiresAt === "never" || editExpiresAt === "" ? null : editExpiresAt
        }),
      });
      if (res.ok) {
        await fetchUsers();
        setEditingUser(null);
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  // UTR states
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loadingVer, setLoadingVer] = useState(false);
  const [processingVerId, setProcessingVerId] = useState<string | null>(null);

  // Payment settings state
  const [upiId, setUpiId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Dynamic Plans state
  const [dbPlans, setDbPlans] = useState<DbPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DbPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: "",
    plan_key: "",
    price: 0,
    ai_tokens_limit: 10000,
    max_branches: 2,
    max_store_owners: 5,
    type: "user" as "user" | "agent",
    features: ""
  });

  // Support Messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [msgId: string]: string }>({});
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [replyImages, setReplyImages] = useState<{ [msgId: string]: string }>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam as any);
    } else {
      setActiveTab("owner");
    }
  }, [tabParam]);

  useEffect(() => {
    fetchUsers();
    fetchPaymentSettings();
    fetchVerifications();
    fetchPlans();
    fetchMessages();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch("/api/admin/payment-settings");
      const data = await res.json();
      setUpiId(data.upi_id || "");
      setQrCode(data.qr_code || "");
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVerifications = async () => {
    setLoadingVer(true);
    try {
      const res = await fetch("/api/admin/payment-verifications");
      const data = await res.json();
      if (data.verifications) {
        setVerifications(data.verifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVer(false);
    }
  };

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      if (data.plans) {
        setDbPlans(data.plans);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch("/api/admin/contact-messages");
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        if (data.messages.length > 0 && !selectedMsgId) {
          setSelectedMsgId(data.messages[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleReplyMsgSubmit = async (msgId: string) => {
    const text = replyTexts[msgId];
    if (!text || !text.trim()) return;

    setSubmittingReplyId(msgId);
    try {
      const res = await fetch(`/api/admin/contact-messages/${msgId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply: text.trim(),
          image: replyImages[msgId] || null
        }),
      });
      if (res.ok) {
        await fetchMessages();
        setReplyTexts({ ...replyTexts, [msgId]: "" });
        const updatedImages = { ...replyImages };
        delete updatedImages[msgId];
        setReplyImages(updatedImages);
      } else {
        alert("Failed to submit reply");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting reply");
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setQrCode(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upi_id: upiId, qr_code: qrCode }),
      });
      if (res.ok) {
        alert("Payment settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleVerifyUTR = async (id: string, status: "approved" | "rejected") => {
    setProcessingVerId(id);
    try {
      const res = await fetch(`/api/admin/payment-verifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchVerifications();
        await fetchUsers(); // Refresh limits in users tab
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert("Error verifying UTR");
    } finally {
      setProcessingVerId(null);
    }
  };



  // Plan actions
  const openPlanModal = (plan?: DbPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        plan_key: plan.plan_key,
        price: plan.price,
        ai_tokens_limit: plan.ai_tokens_limit,
        max_branches: plan.max_branches,
        max_store_owners: plan.max_store_owners,
        type: plan.type,
        features: plan.features
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        name: "",
        plan_key: "",
        price: 0,
        ai_tokens_limit: 10000,
        max_branches: 2,
        max_store_owners: 5,
        type: "user",
        features: ""
      });
    }
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPlan ? `/api/admin/plans/${editingPlan.id}` : "/api/admin/plans";
      const method = editingPlan ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planForm)
      });
      if (res.ok) {
        await fetchPlans();
        setShowPlanModal(false);
      } else {
        alert("Failed to save plan");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving plan");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      const res = await fetch(`/api/admin/plans/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchPlans();
      } else {
        alert("Failed to delete plan");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting plan");
    }
  };

  if (loading) return <div className="p-6">Loading Users Dashboard...</div>;

  const filteredUsers = users.filter(u => u.role === activeTab);

  const pageHeader = (() => {
    switch (activeTab) {
      case "utr":
        return {
          title: "UTR Verifications",
          desc: "Verify manual payment transaction records and approve premium plans."
        };
      case "plans":
        return {
          title: "Manage Plans",
          desc: "Configure subscriptions, limits, pricing and feature plans."
        };
      case "settings":
        return {
          title: "Payment QR Settings",
          desc: "Configure your checkout UPI ID and upload the payment QR code."
        };
      case "support":
        return {
          title: "Support Messages",
          desc: "Review and respond to client support tickets and conversations."
        };
      default:
        return {
          title: "Users & Businesses",
          desc: "Configure user roles, override limits and manage store owners."
        };
    }
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{pageHeader.title}</h1>
        <p className="text-slate-500 mt-1">{pageHeader.desc}</p>
      </div>

      {/* Tabs - Only shown if not on a sub-page */}
      {!tabParam && (
        <div className="flex border-b border-gray-200 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("owner")}
            className={`pb-3 capitalize transition-colors ${
              activeTab === "owner"
                ? "border-b-2 border-indigo-600 text-indigo-600 font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Owners (Users)
          </button>
          <button
            onClick={() => setActiveTab("agent")}
            className={`pb-3 capitalize transition-colors ${
              activeTab === "agent"
                ? "border-b-2 border-indigo-600 text-indigo-600 font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Agents
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`pb-3 capitalize transition-colors ${
              activeTab === "admin"
                ? "border-b-2 border-indigo-600 text-indigo-600 font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Admins
          </button>
        </div>
      )}

      {/* Main Tab Renderings */}
      {activeTab === "support" ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-12 overflow-hidden h-[600px] shadow-sm">
          {/* Left Panel: Inbox List */}
          <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-white">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-700">Support Inbox ({messages.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loadingMessages ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading inbox...</div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No tickets received.</div>
              ) : (
                messages.map((msg) => {
                  const isActive = msg.id === selectedMsgId;
                  return (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedMsgId(msg.id)}
                      className={`w-full text-left p-4 transition flex flex-col gap-1.5 hover:bg-slate-50/85 ${
                        isActive ? "bg-indigo-50/40 border-l-4 border-indigo-600 pl-3" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                          {msg.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate w-full">
                        {msg.message}
                      </p>
                      <div className="flex items-center justify-between w-full mt-1">
                        <div className="flex gap-1.5 items-center">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                            msg.status === "open"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}>
                            {msg.status}
                          </span>
                          {msg.plan && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                              {msg.plan}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Chat Thread Window */}
          <div className="md:col-span-8 flex flex-col bg-slate-50/50">
            {(() => {
              const activeMsg = messages.find((m) => m.id === selectedMsgId);
              if (!activeMsg) {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 space-y-2">
                    <MessageSquare className="w-12 h-12 text-slate-300" />
                    <p className="text-xs font-semibold">Select a customer thread to read/reply.</p>
                  </div>
                );
              }

              return (
                <div className="flex flex-col h-full bg-white">
                  {/* Chat Window Header */}
                  <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-full font-bold">
                        {activeMsg.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{activeMsg.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{activeMsg.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                        activeMsg.status === "open"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}>
                        {activeMsg.status}
                      </span>
                      <button
                        onClick={async () => {
                          const nextStatus = activeMsg.status === "open" ? "closed" : "open";
                          if (nextStatus === "closed" && !confirm("Mark this ticket as resolved?")) return;
                          try {
                            const res = await fetch(`/api/admin/contact-messages/${activeMsg.id}/status`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: nextStatus }),
                            });
                            if (res.ok) fetchMessages();
                          } catch (e) { console.error(e); }
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition underline"
                      >
                        {activeMsg.status === "open" ? "Close Ticket" : "Reopen Ticket"}
                      </button>
                    </div>
                  </div>

                  {/* Chat Message Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {/* User initial ticket details */}
                    <div className="flex gap-2.5 max-w-[80%] mr-auto">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        U
                      </div>
                      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none shadow-sm space-y-2 text-left">
                        <div className="flex justify-between items-center gap-8 mb-1">
                          <span className="text-xs font-bold text-slate-900">{activeMsg.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(activeMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap">{activeMsg.message}</p>
                        {activeMsg.image && (
                          <div className="border border-slate-200 rounded-lg p-1.5 max-w-[200px] bg-slate-50 mt-2 cursor-zoom-in">
                            <button onClick={() => setLightboxImage(activeMsg.image)}>
                              <img src={activeMsg.image} alt="Attachment" className="max-h-32 rounded w-auto object-contain hover:opacity-90 transition" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Back-and-forth replies logs */}
                    {activeMsg.replies && activeMsg.replies.map((reply: any) => {
                      const isAdmin = reply.sender_role === "admin";
                      return (
                        <div
                          key={reply.id}
                          className={`flex gap-2.5 max-w-[80%] ${
                            isAdmin ? "ml-auto flex-row-reverse" : "mr-auto"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isAdmin ? "bg-indigo-600 text-white" : "bg-blue-600 text-white"
                          }`}>
                            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : "U"}
                          </div>

                          <div className={`p-3.5 rounded-2xl shadow-xs space-y-1.5 text-left ${
                            isAdmin 
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none" 
                              : "bg-white border border-slate-200 rounded-tl-none text-slate-800"
                          }`}>
                            <div className="flex justify-between items-center gap-8 mb-1">
                              <span className="text-xs font-bold">{reply.sender_name}</span>
                              <span className={`text-[9px] font-mono ${isAdmin ? "text-indigo-200" : "text-slate-400"}`}>
                                {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">{reply.message}</p>

                            {reply.image && (
                              <div className={`border rounded-lg p-1 max-w-[200px] mt-2 cursor-zoom-in ${
                                isAdmin ? "border-indigo-400 bg-white/10" : "border-slate-200 bg-slate-50"
                              }`}>
                                <button onClick={() => setLightboxImage(reply.image)}>
                                  <img src={reply.image} alt="Attachment" className="max-h-32 rounded w-auto object-contain hover:opacity-90 transition" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat Window Footer Input */}
                  <div className="p-4 bg-white border-t border-slate-200">
                    {activeMsg.status === "open" ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {replyImages[activeMsg.id] && (
                            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg text-[10px] text-indigo-700 font-semibold w-fit">
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Image Attached</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextImages = { ...replyImages };
                                  delete nextImages[activeMsg.id];
                                  setReplyImages(nextImages);
                                }}
                                className="text-indigo-400 hover:text-red-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Image upload button */}
                          <label className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-500 flex-shrink-0 transition">
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setReplyImages({ ...replyImages, [activeMsg.id]: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          <input
                            type="text"
                            required
                            value={replyTexts[activeMsg.id] || ""}
                            onChange={(e) =>
                              setReplyTexts({ ...replyTexts, [activeMsg.id]: e.target.value })
                            }
                            placeholder="Type support reply here..."
                            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                          />

                          <button
                            onClick={() => handleReplyMsgSubmit(activeMsg.id)}
                            disabled={submittingReplyId === activeMsg.id || !(replyTexts[activeMsg.id] || "").trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition disabled:opacity-50 flex-shrink-0 shadow-sm"
                          >
                            {submittingReplyId === activeMsg.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-100 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          <span>This ticket has been marked resolved. Reopen to reply.</span>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/admin/contact-messages/${activeMsg.id}/status`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "open" }),
                              });
                              if (res.ok) fetchMessages();
                            } catch (e) { console.error(e); }
                          }}
                          className="bg-white border border-red-200 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold hover:bg-red-50 transition"
                        >
                          Reopen Ticket
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : activeTab === "settings" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-xl">
          <h2 className="text-xl font-bold mb-4">Payment QR & UPI Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="paytoautorevio@ybl"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">QR Code Image</label>
              <div className="flex items-start gap-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition w-40 h-40">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500 text-center">Click to upload QR code</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleQRUpload} />
                </label>
                {qrCode && (
                  <div className="border border-slate-200 rounded-xl p-2 bg-white flex flex-col items-center">
                    <img src={qrCode} alt="Uploaded QR" className="w-32 h-32 object-contain" />
                    <button onClick={() => setQrCode("")} className="text-xs text-red-500 mt-1 font-semibold hover:underline">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {savingSettings ? "Saving..." : "Save Payment Settings"}
            </button>
          </div>
        </div>
      ) : activeTab === "plans" ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Subscription Plans</h2>
            <button
              onClick={() => openPlanModal()}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Plan
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Plan Name</th>
                    <th className="p-4">Key</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Price (₹ INR)</th>
                    <th className="p-4">Limits (Branches / Tokens / Owners)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {dbPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-900">{plan.name}</td>
                      <td className="p-4 font-mono text-xs">{plan.plan_key}</td>
                      <td className="p-4 capitalize">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          plan.type === "user" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {plan.type === "user" ? "user/owner" : "agent"}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">
                        {plan.price == 0 ? "Free" : `₹${Number(plan.price).toLocaleString("en-IN")}`}
                      </td>
                      <td className="p-4 text-slate-500">
                        Branches: {plan.max_branches} | Tokens: {plan.ai_tokens_limit.toLocaleString()} | Owners: {plan.max_store_owners}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2.5 justify-end">
                          <button
                            onClick={() => openPlanModal(plan)}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs inline-flex items-center gap-0.5"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="text-red-600 hover:text-red-900 font-semibold text-xs inline-flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === "utr" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loadingVer ? (
              <div className="p-8 text-center text-gray-500">Loading requests...</div>
            ) : verifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No UTR requests submitted yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <th className="p-4">User</th>
                    <th className="p-4">Plan Request</th>
                    <th className="p-4">UTR Number</th>
                    <th className="p-4">Amount Paid</th>
                    <th className="p-4">Submitted At</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {verifications.map((ver) => (
                    <tr key={ver.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{ver.fullName}</div>
                        <div className="text-gray-500 text-xs">{ver.email}</div>
                      </td>
                      <td className="p-4 capitalize">
                        <span className="bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded text-xs">
                          {ver.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-gray-700 select-all">{ver.utr_number}</span>
                      </td>
                      <td className="p-4 font-bold text-gray-900">${ver.amount}</td>
                      <td className="p-4 text-slate-500">
                        {new Date(ver.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          ver.status === "approved" ? "bg-green-100 text-green-800" :
                          ver.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {ver.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {ver.status === "pending" ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleVerifyUTR(ver.id, "approved")}
                              disabled={processingVerId !== null}
                              className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded text-xs font-bold transition disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleVerifyUTR(ver.id, "rejected")}
                              disabled={processingVerId !== null}
                              className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-bold transition disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 capitalize">Handled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No {activeTab}s found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="p-4">User</th>
                    <th className="p-4">Role / Managed</th>
                    <th className="p-4">Current Plan</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Subscription Status</th>
                    <th className="p-4">Limits & Usage</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {filteredUsers.map((user) => {
                    const sub = user.subscription;
                    const startDate = sub?.createdAt
                      ? new Date(sub.createdAt).toLocaleDateString()
                      : new Date(user.createdAt).toLocaleDateString();
                    const expiryDate = sub?.expiresAt
                      ? new Date(sub.expiresAt).toLocaleDateString()
                      : "Unlimited / Lifetime";

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-gray-500 text-xs font-mono">{user.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize w-fit
                              ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                user.role === 'agent' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {user.role}
                            </span>
                            {user.role === 'owner' && (
                              <span className="text-[10px] text-gray-500">
                                {user.createdByAgentId ? "Via Agent" : "Admin Direct"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                            ${sub?.plan === 'platinum' || sub?.plan === 'agent_enterprise' ? 'bg-slate-800 text-slate-100' : 
                              sub?.plan === 'gold' || sub?.plan === 'agent_pro' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-indigo-50 text-indigo-700'}`}>
                            {sub?.plan === 'free' || sub?.plan === 'trial' ? "free trial" : (sub?.plan || "none")}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                          {startDate}
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                          {expiryDate}
                        </td>
                        <td className="p-4">
                          {sub ? (
                            sub.isExpired ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                Active
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4 text-xs text-gray-600 whitespace-nowrap">
                          <div>Branches: {sub?.maxBranches || 0}</div>
                          <div>AI: {sub?.aiTokensUsed || 0} / {sub?.aiTokensLimit?.toLocaleString() || 0}</div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs inline-flex items-center justify-end w-full"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Edit User & Plan</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  {dbPlans
                    .filter((p) => p.type === (editRole === "owner" ? "user" : "agent"))
                    .map((p) => (
                      <option key={p.id} value={p.plan_key}>
                        {p.name} ({p.price == 0 ? "Free" : `₹${Number(p.price).toLocaleString("en-IN")}`})
                      </option>
                    ))}
                  {editRole === "admin" && (
                    <option value="none">None</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Set Expiration Date</label>
                <input
                  type="date"
                  value={editExpiresAt === "never" ? "" : editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value || "never")}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-sm mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 14);
                      setEditExpiresAt(d.toISOString().split("T")[0]);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium"
                  >
                    +14 Days Trial
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 30);
                      setEditExpiresAt(d.toISOString().split("T")[0]);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium"
                  >
                    +30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 1);
                      setEditExpiresAt(d.toISOString().split("T")[0]);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium"
                  >
                    +1 Year
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditExpiresAt("never")}
                    className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium"
                  >
                    Unlimited / Never
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSavePlan} className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">{editingPlan ? "Edit Plan" : "Add Custom Plan"}</h3>
              <button type="button" onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="Diamond Plan"
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Unique Key *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPlan}
                    value={planForm.plan_key}
                    onChange={(e) => setPlanForm({ ...planForm, plan_key: e.target.value })}
                    placeholder="diamond"
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
                  <select
                    value={planForm.type}
                    onChange={(e) => setPlanForm({ ...planForm, type: e.target.value as "user" | "agent" })}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm"
                  >
                    <option value="user">User/Owner</option>
                    <option value="agent">Agent/Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                    placeholder="999"
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">AI Tokens Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={planForm.ai_tokens_limit}
                    onChange={(e) => setPlanForm({ ...planForm, ai_tokens_limit: Number(e.target.value) })}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Branches</label>
                  <input
                    type="number"
                    min="0"
                    value={planForm.max_branches}
                    onChange={(e) => setPlanForm({ ...planForm, max_branches: Number(e.target.value) })}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Owners</label>
                  <input
                    type="number"
                    min="0"
                    value={planForm.max_store_owners}
                    onChange={(e) => setPlanForm({ ...planForm, max_store_owners: Number(e.target.value) })}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Features (Comma-separated)</label>
                <textarea
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  placeholder="Up to 100 Branches, Unlimited AI Responses, Priority 24/7 Support"
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Save Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-slate-200 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Enlarged Attachment" 
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Loading console...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
