"use client";

import { useEffect, useState } from "react";
import { Plus, X, Users as UsersIcon, ShieldAlert, ShieldCheck, Loader2, Edit2, Eye, EyeOff } from "lucide-react";

type Owner = {
  id: string;
  email: string;
  fullName: string;
  status: "active" | "suspended";
  createdAt: string;
  subscription?: {
    plan: string;
    createdAt?: string;
    expiresAt?: string | null;
    isExpired?: boolean;
  } | null;
};

export default function AgentOwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [maxStoreOwners, setMaxStoreOwners] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  // Form State for Add
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form State for Edit
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const res = await fetch("/api/agents/owners");
      const data = await res.json();
      if (res.ok) {
        setOwners(data.owners || []);
        setMaxStoreOwners(data.maxStoreOwners || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: "active" | "suspended") => {
    setTogglingStatusId(id);
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/agents/owners/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchOwners();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/agents/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchOwners();
        setShowModal(false);
        // Reset form
        setFullName("");
        setEmail("");
        setPassword("");
      } else {
        setError(data.error || "Failed to add owner");
      }
    } catch (error) {
      console.error(error);
      setError("Error submitting owner");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (owner: Owner) => {
    setEditingOwner(owner);
    setEditFullName(owner.fullName);
    setEditEmail(owner.email);
    setEditPassword("");
    setEditError("");
  };

  const handleEditOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOwner) return;
    setEditSubmitting(true);
    setEditError("");
    try {
      const res = await fetch(`/api/agents/owners/${editingOwner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editFullName,
          email: editEmail,
          password: editPassword || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchOwners();
        setEditingOwner(null);
      } else {
        setEditError(data.error || "Failed to update owner");
      }
    } catch (error) {
      console.error(error);
      setEditError("Error updating owner");
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const slotsLeft = Math.max(0, maxStoreOwners - owners.length);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Owners</h1>
          <p className="mt-1 text-slate-500">Create store owners who can manage businesses. You have {slotsLeft} slot(s) remaining on your current plan.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={slotsLeft === 0}
          className="flex items-center px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Owner
        </button>
      </div>

      {owners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No store owners yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't added any store owners. Add your first owner to let them manage their own businesses.
          </p>
          <button
            onClick={() => setShowModal(true)}
            disabled={slotsLeft === 0}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Owner
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Owner Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Current Plan</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Plan Status</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {owners.map((owner) => {
                  const sub = owner.subscription;
                  const startDate = sub?.createdAt
                    ? new Date(sub.createdAt).toLocaleDateString()
                    : new Date(owner.createdAt).toLocaleDateString();
                  const expiryDate = sub?.expiresAt
                    ? new Date(sub.expiresAt).toLocaleDateString()
                    : "Unlimited / Lifetime";

                  return (
                    <tr key={owner.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{owner.fullName}</td>
                      <td className="p-4 text-gray-500 font-mono text-xs">{owner.email}</td>
                      <td className="p-4">
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded text-xs capitalize">
                          {sub?.plan || "free"}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-700 whitespace-nowrap">{startDate}</td>
                      <td className="p-4 text-xs font-medium text-slate-700 whitespace-nowrap">{expiryDate}</td>
                      <td className="p-4">
                        {sub ? (
                          sub.isExpired ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                              Expired
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              Active
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          owner.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {owner.status || "active"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <button
                            onClick={() => openEditModal(owner)}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs inline-flex items-center gap-0.5"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(owner.id, owner.status || "active")}
                            disabled={togglingStatusId === owner.id}
                            className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1.5 rounded-lg border transition ${
                              (owner.status || "active") === "active"
                                ? "border-red-200 text-red-600 hover:bg-red-50 bg-white"
                                : "border-green-200 text-green-600 hover:bg-green-50 bg-white"
                            } disabled:opacity-50`}
                          >
                            {togglingStatusId === owner.id ? (
                              "Updating..."
                            ) : (owner.status || "active") === "active" ? (
                              <>
                                <ShieldAlert className="w-3 h-3" /> Suspend
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3 h-3" /> Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Owner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Create New Store Owner</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddOwner}>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Vikram Patel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="owner@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm p-2 pr-10 border focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="SecretPass123!"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">The owner will use this to log in initially.</p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Owner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Owner Modal */}
      {editingOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Edit Store Owner Details</h3>
              <button onClick={() => setEditingOwner(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditOwner}>
              <div className="p-6 space-y-4">
                {editError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                    {editError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm p-2 pr-10 border focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Leave blank to keep current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setEditingOwner(null)}
                  className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
