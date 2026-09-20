"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Building2,
  QrCode,
  Star,
  Loader2,
  X,
  ExternalLink,
  User,
  Pencil,
  Trash2,
} from "lucide-react";
import { subIndustries, industriesList } from "@/lib/industries";

type Business = {
  id: string;
  name: string;
  industry?: string;
  subIndustry?: string;
  googleReviewUrl?: string;
  branches: Array<{ id: string; name: string }>;
  createdAt: string;
  userId?: string;
};

type Owner = {
  id: string;
  fullName: string;
  email: string;
};

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAgent, setIsAgent] = useState(false);

  // Agent owners list
  const [ownersList, setOwnersList] = useState<Owner[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");

  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    subIndustry: "",
    googleReviewUrl: "",
  });

  const currentSubIndustries = formData.industry ? (subIndustries[formData.industry] || []) : [];

  useEffect(() => {
    loadBusinesses();
    checkUserRole();
  }, []);

  async function checkUserRole() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        if (data.user.role === "admin") {
          setIsAdmin(true);
        } else if (data.user.role === "agent") {
          setIsAgent(true);
          fetchAgentOwners();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchAgentOwners() {
    try {
      const res = await fetch("/api/agents/owners");
      const data = await res.json();
      if (data.owners) {
        setOwnersList(data.owners);
        if (data.owners.length > 0) {
          setSelectedOwnerId(data.owners[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load agent's owners:", e);
    }
  }

  async function loadBusinesses() {
    try {
      const res = await fetch("/api/businesses");
      const data = await res.json();
      setBusinesses(data.businesses || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndustry = e.target.value;
    setFormData({
      ...formData,
      industry: selectedIndustry,
      subIndustry: "",
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        ownerId: isAgent ? selectedOwnerId : undefined,
      };

      const url = editingBusiness
        ? `/api/businesses/${editingBusiness.id}`
        : "/api/businesses";
      const method = editingBusiness ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await loadBusinesses();
        setShowModal(false);
        setEditingBusiness(null);
        setFormData({ name: "", industry: "", subIndustry: "", googleReviewUrl: "" });
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${editingBusiness ? "update" : "create"} business`);
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this business? All branches and reviews under this business will also be deleted!")) {
      return;
    }
    try {
      const res = await fetch(`/api/businesses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadBusinesses();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete business");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Get Owner Name for display helper (in Agent panel)
  const getOwnerDisplay = (business: Business) => {
    if (!isAgent) return null;
    const owner = ownersList.find((o) => o.id === business.userId);
    return owner ? owner.fullName : "Unknown Owner";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Businesses</h1>
          <p className="text-slate-600 mt-1">
            {isAgent
              ? "Manage businesses belonging to the store owners you created."
              : "Manage your businesses and add new ones."
            }
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => {
              if (isAgent && ownersList.length === 0) {
                alert("You need to create at least one Owner first under 'My Owners' to add a business!");
                return;
              }
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Business
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-12 w-12 bg-slate-200 rounded-lg mb-3" />
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No businesses yet</h3>
          <p className="text-slate-600 mb-6">
            {isAgent
              ? "None of your store owners have registered businesses yet."
              : "Create your first business to start collecting reviews"
            }
          </p>
          {!isAdmin && (
            <button
              onClick={() => {
                if (isAgent && ownersList.length === 0) {
                  alert("You need to create at least one Owner first under 'My Owners' to add a business!");
                  return;
                }
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              Create Business
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {!isAdmin && (
                      <div className="flex gap-1 mr-1">
                        <button
                          onClick={() => {
                            setEditingBusiness(biz);
                            setFormData({
                              name: biz.name,
                              industry: biz.industry || "",
                              subIndustry: biz.subIndustry || "",
                              googleReviewUrl: biz.googleReviewUrl || "",
                            });
                            if (isAgent && biz.userId) {
                              setSelectedOwnerId(biz.userId);
                            }
                            setShowModal(true);
                          }}
                          title="Edit Business"
                          className="p-1 text-slate-500 hover:text-purple-600 hover:bg-slate-50 rounded transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(biz.id)}
                          title="Delete Business"
                          className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-semibold">
                      {biz.branches.length} branch{biz.branches.length !== 1 && "es"}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">{biz.name}</h3>
                {biz.industry && (
                  <p className="text-sm text-slate-500 mb-3">
                    {biz.industry}{biz.subIndustry ? ` • ${biz.subIndustry}` : ""}
                  </p>
                )}

                {/* Show Owner Badge if Agent */}
                {isAgent && (
                  <div className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg mb-3 font-semibold w-fit">
                    <User className="w-3.5 h-3.5" />
                    <span>Owner: {getOwnerDisplay(biz)}</span>
                  </div>
                )}

                {biz.googleReviewUrl && (
                  <a
                    href={biz.googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline flex items-center gap-1 mb-3"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Google Review Link
                  </a>
                )}
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <QrCode className="w-4 h-4" />
                  <span>{biz.branches.length} QR</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Business Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingBusiness ? "Edit Business" : "Add New Business"}
              </h2>
              <button onClick={() => {
                setShowModal(false);
                setEditingBusiness(null);
                setFormData({ name: "", industry: "", subIndustry: "", googleReviewUrl: "" });
              }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Owner Select Dropdown for Agents */}
              {isAgent && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Assign to Owner *
                  </label>
                  <select
                    required
                    value={selectedOwnerId}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none bg-white text-sm"
                  >
                    {ownersList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.fullName} ({o.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                  placeholder="My Restaurant"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="industry">
                  Industry
                </label>
                <div className="relative">
                  <select
                    id="industry"
                    name="industry"
                    required
                    value={formData.industry}
                    onChange={handleIndustryChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none appearance-none bg-white text-sm"
                  >
                    <option value="" disabled selected={!formData.industry}>
                      Select an industry
                    </option>
                    {industriesList.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Sub Industry */}
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="subIndustry">
                  Sub Industry
                </label>
                <div className="relative">
                  <select
                    id="subIndustry"
                    name="subIndustry"
                    required
                    value={formData.subIndustry}
                    onChange={(e) =>
                      setFormData({ ...formData, subIndustry: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none appearance-none bg-white text-sm"
                  >
                    <option value="" disabled selected={!formData.subIndustry}>
                      Select a sub-industry
                    </option>
                    {currentSubIndustries.map((subInd) => (
                      <option key={subInd} value={subInd}>
                        {subInd}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Google Review URL
                </label>
                <input
                  type="url"
                  value={formData.googleReviewUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, googleReviewUrl: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
                  placeholder="https://g.page/r/..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  Optional. Customers with 4+ stars will be redirected here.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBusiness(null);
                    setFormData({ name: "", industry: "", subIndustry: "", googleReviewUrl: "" });
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingBusiness ? (
                    "Save"
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
