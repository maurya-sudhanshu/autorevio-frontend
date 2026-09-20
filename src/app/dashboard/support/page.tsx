"use client";

import { useEffect, useState } from "react";
import {
  HelpCircle,
  Send,
  Loader2,
  CheckCircle2,
  CornerDownRight,
  MessageSquare,
  Clock,
  Upload,
  ImageIcon,
  X,
  AlertCircle,
  ChevronRight,
  User,
  ShieldCheck,
  Plus
} from "lucide-react";

type SupportReply = {
  id: string;
  ticket_id: string;
  sender_role: "admin" | "agent" | "user";
  sender_name: string;
  message: string;
  image: string | null;
  created_at: string;
};

type SupportMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  plan: string | null;
  reply: string | null;
  image: string | null;
  status: "open" | "closed";
  created_at: string;
  replies?: SupportReply[];
};

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<{ fullName: string; email: string; role: string } | null>(null);
  const [tickets, setTickets] = useState<SupportMessage[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Lightbox Modal for screenshots
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Agent inbox toggle: 'personal' (queries to admin) vs 'managed' (queries from owners)
  const [supportTab, setSupportTab] = useState<"personal" | "managed">("personal");

  // New ticket form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    planContext: "general",
  });
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);

  // Chat window state for the selected ticket
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setFormData({
          name: data.user.fullName || "",
          email: data.user.email || "",
          message: "",
          planContext: "general",
        });
        await fetchTickets(true, "personal");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTickets(selectFirst = false, tabOverride?: "personal" | "managed") {
    try {
      const activeTab = tabOverride || supportTab;
      const url = activeTab === "managed" ? "/api/auth/support/managed" : "/api/auth/support";
      const res = await fetch(url);
      const data = await res.json();
      if (data.messages) {
        setTickets(data.messages);
        if (selectFirst && data.messages.length > 0) {
          setSelectedTicketId(data.messages[0].id);
        } else if (data.messages.length === 0 || !data.messages.some((m: any) => m.id === selectedTicketId)) {
          setSelectedTicketId(data.messages[0]?.id || null);
        }
      }
    } catch (e) {
      console.error("Failed to load tickets:", e);
    }
  }

  const handleTabChange = async (newTab: "personal" | "managed") => {
    setSupportTab(newTab);
    await fetchTickets(true, newTab);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReplyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          plan: formData.planContext === "general" ? null : formData.planContext,
          image: base64Image,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ ...formData, message: "" });
        setBase64Image(null);
        setShowNewTicketModal(false);
        await fetchTickets();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit support ticket");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting support request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/auth/support/${selectedTicketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText.trim(),
          image: replyImage,
        }),
      });

      if (res.ok) {
        setReplyText("");
        setReplyImage(null);
        await fetchTickets();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send reply");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending message");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to close this support ticket?")) return;
    try {
      const res = await fetch(`/api/auth/support/${ticketId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (res.ok) {
        await fetchTickets();
      } else {
        alert("Failed to close ticket");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReopenTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/auth/support/${ticketId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "open" }),
      });
      if (res.ok) {
        await fetchTickets();
      } else {
        alert("Failed to reopen ticket");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeTicket = tickets.find((t) => t.id === selectedTicketId);

  if (loading) {
    return <div className="p-6 text-slate-500">Loading Support Module...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top bar info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            Help & Support
          </h1>
          <p className="text-slate-600 mt-1">
            Need assistance? Chat directly with support and attach images.
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setShowNewTicketModal(true);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-md shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          Create Support Ticket
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-12 overflow-hidden h-[600px] shadow-sm">
        {/* Left Side: Tickets Inbox List */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-white">
          {/* Support Tab Selector for Agents */}
          {user?.role === "agent" ? (
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1.5 text-xs font-semibold">
              <button
                onClick={() => handleTabChange("personal")}
                className={`flex-1 text-center py-2 rounded-lg transition ${
                  supportTab === "personal"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                My Queries
              </button>
              <button
                onClick={() => handleTabChange("managed")}
                className={`flex-1 text-center py-2 rounded-lg transition ${
                  supportTab === "managed"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Owner Queries
              </button>
            </div>
          ) : (
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-700">Support Inbox</h3>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No tickets in this folder.
              </div>
            ) : (
              tickets.map((t) => {
                const isActive = t.id === selectedTicketId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-4 transition flex flex-col gap-1.5 hover:bg-slate-50/85 ${
                      isActive ? "bg-blue-50/40 border-l-4 border-blue-600 pl-3" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-xs font-bold text-slate-800 capitalize truncate max-w-[150px]">
                        {t.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate w-full">
                      {t.message}
                    </p>
                    <div className="flex items-center justify-between w-full mt-1">
                      <div className="flex gap-1.5 items-center">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                            t.status === "open"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          {t.status === "open" ? "Active" : "Closed"}
                        </span>
                        {t.plan && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded uppercase">
                            {t.plan}
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

        {/* Right Side: Chat Conversation Window */}
        <div className="md:col-span-8 flex flex-col bg-slate-50/50">
          {activeTicket ? (
            <div className="flex flex-col h-full">
              {/* Chat Window Header */}
              <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-bold">
                    {activeTicket.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{activeTicket.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{activeTicket.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                      activeTicket.status === "open"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-red-50 text-red-700 border-red-100"
                    }`}
                  >
                    {activeTicket.status === "open" ? "Open" : "Closed"}
                  </span>
                  {activeTicket.status === "open" ? (
                    <button
                      onClick={() => handleCloseTicket(activeTicket.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-bold transition underline"
                    >
                      Close Ticket
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReopenTicket(activeTicket.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold transition underline"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Starting Ticket Request Message */}
                <div className="flex gap-2.5 max-w-[80%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    U
                  </div>
                  <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none shadow-sm space-y-2 text-left">
                    <div className="flex justify-between items-center gap-8 mb-1">
                      <span className="text-xs font-bold text-slate-900">{activeTicket.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(activeTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{activeTicket.message}</p>
                    
                    {activeTicket.image && (
                      <div className="border border-slate-200 rounded-lg p-1.5 max-w-[200px] bg-slate-50 mt-2 cursor-zoom-in">
                        <button onClick={() => setLightboxImage(activeTicket.image)}>
                          <img src={activeTicket.image} alt="Attachment" className="max-h-32 rounded w-auto object-contain hover:opacity-90 transition" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back and forth thread list */}
                {activeTicket.replies && activeTicket.replies.map((reply) => {
                  const isIncomingMessage = supportTab === "managed" 
                    ? (reply.sender_role === "user" || reply.sender_role === "admin")
                    : (reply.sender_role === "admin" || reply.sender_role === "agent");

                  const isPlatformAdmin = reply.sender_role === "admin";

                  return (
                    <div
                      key={reply.id}
                      className={`flex gap-2.5 max-w-[80%] ${
                        isIncomingMessage ? "mr-auto" : "ml-auto flex-row-reverse"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isIncomingMessage 
                          ? (isPlatformAdmin ? "bg-indigo-600 text-white" : "bg-blue-600 text-white") 
                          : "bg-blue-600 text-white"
                      }`}>
                        {isPlatformAdmin ? <ShieldCheck className="w-4 h-4" /> : "U"}
                      </div>
                      
                      <div className={`p-3.5 rounded-2xl shadow-xs space-y-1.5 text-left ${
                        isIncomingMessage 
                          ? "bg-white border border-slate-200 rounded-tl-none text-slate-800" 
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none"
                      }`}>
                        <div className="flex justify-between items-center gap-8 mb-1">
                          <span className="text-xs font-bold">{reply.sender_name}</span>
                          <span className={`text-[9px] font-mono ${isIncomingMessage ? "text-slate-400" : "text-blue-200"}`}>
                            {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                        
                        {reply.image && (
                          <div className={`border rounded-lg p-1 max-w-[200px] mt-2 cursor-zoom-in ${
                            isIncomingMessage ? "border-slate-200 bg-slate-50" : "border-blue-400 bg-white/10"
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
                {activeTicket.status === "open" ? (
                  <form onSubmit={handleReplySubmit} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {/* Optional attached reply image preview */}
                      {replyImage && (
                        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg text-[10px] text-blue-700 font-semibold w-fit">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Image Attached</span>
                          <button type="button" onClick={() => setReplyImage(null)} className="text-blue-400 hover:text-red-500">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-500 flex-shrink-0 transition">
                        <Upload className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={handleReplyImageChange} className="hidden" />
                      </label>

                      <input
                        type="text"
                        required
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                      />

                      <button
                        type="submit"
                        disabled={submittingReply || !replyText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition disabled:opacity-50 flex-shrink-0 shadow-sm"
                      >
                        {submittingReply ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-100 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>This support ticket has been closed. Reopen it to chat.</span>
                    </div>
                    <button
                      onClick={() => handleReopenTicket(activeTicket.id)}
                      className="bg-white border border-red-200 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold hover:bg-red-50 transition"
                    >
                      Reopen Ticket
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 space-y-2">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <p className="text-xs">Select a support conversation from the inbox list to read/reply.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900">Create New Support Ticket</h2>
              <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@example.in"
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Topic
                </label>
                <select
                  value={formData.planContext}
                  onChange={(e) => setFormData({ ...formData, planContext: e.target.value })}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                >
                  <option value="general">General Support</option>
                  <option value="billing">Billing & Pricing</option>
                  <option value="technical">Technical Bug</option>
                  <option value="feature">Feature Idea</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail your question..."
                  className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Attach Screenshot (Optional)
                </label>
                {!base64Image ? (
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500">Upload Image File</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                ) : (
                  <div className="relative border border-slate-200 rounded-lg p-2 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-500" />
                      <span className="text-xs font-semibold text-slate-700 max-w-[150px] truncate">Image Attached</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBase64Image(null)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 text-sm shadow-md"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
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
