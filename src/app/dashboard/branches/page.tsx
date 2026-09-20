"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  QrCode,
  Download,
  Loader2,
  X,
  Copy,
  Check,
  Link2,
  Star,
} from "lucide-react";

type Business = { id: string; name: string };
type Branch = {
  id: string;
  name: string;
  publicSlug: string;
  address?: string;
  qrCode?: string;
  lowRatingThreshold: number;
  keywords?: string;
  reviews: Array<{ id: string }>;
};

export default function BranchesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    lowRatingThreshold: 3,
    keywords: "",
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  useEffect(() => {
    loadBusinesses();
    checkUserRole();
  }, []);

  async function checkUserRole() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user && data.user.role === "admin") {
        setIsAdmin(true);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (selectedBusiness) {
      loadBranches();
    }
  }, [selectedBusiness]);

  async function loadBusinesses() {
    try {
      const res = await fetch("/api/businesses");
      const data = await res.json();
      const list: Business[] = data.businesses || [];
      setBusinesses(list);
      if (list.length > 0 && !selectedBusiness) {
        setSelectedBusiness(list[0].id);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function loadBranches() {
    try {
      const res = await fetch(
        `/api/branches?businessId=${selectedBusiness}`
      );
      const data = await res.json();
      setBranches(data.branches || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingBranch
        ? `/api/branches/${editingBranch.id}`
        : "/api/branches";
      const method = editingBranch ? "PUT" : "POST";
      const body = editingBranch
        ? formData
        : { businessId: selectedBusiness, ...formData };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await loadBranches();
        setShowModal(false);
        setEditingBranch(null);
        setFormData({ name: "", address: "", lowRatingThreshold: 3, keywords: "" });
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${editingBranch ? "update" : "create"} branch`);
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  }

  function copyReviewLink(slug: string) {
    const url = `${window.location.origin}/review/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadQR(qrDataUrl: string, name: string) {
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qr-${name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.click();
  }

  const selectedBiz = businesses.find((b) => b.id === selectedBusiness);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Branches & QR Codes
          </h1>
          <p className="text-slate-600 mt-1">
            Create QR codes for each location to collect reviews.
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => {
              setEditingBranch(null);
              setFormData({ name: "", address: "", lowRatingThreshold: 3, keywords: "" });
              setShowModal(true);
            }}
            disabled={!selectedBusiness}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Branch
          </button>
        )}
      </div>

      {businesses.length > 1 && (
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <label className="block text-sm font-medium mb-2">
            Select Business
          </label>
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-40 bg-slate-200 rounded mb-4" />
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
            </div>
          ))}
        </div>
      ) : !selectedBusiness ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No businesses yet</h3>
          <p className="text-slate-600">
            Create a business first, then add branches here.
          </p>
        </div>
      ) : branches.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No branches yet</h3>
          <p className="text-slate-600 mb-6">
            Add your first branch for {selectedBiz?.name} to generate a QR code
          </p>
          {!isAdmin && (
            <button
              onClick={() => {
                setEditingBranch(null);
                setFormData({ name: "", address: "", lowRatingThreshold: 3, keywords: "" });
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Branch
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => {
            const reviewUrl = `${window.location.origin}/review/${branch.publicSlug}`;
            return (
              <div
                key={branch.id}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="bg-slate-50 rounded-xl p-4 mb-4 flex items-center justify-center">
                    {branch.qrCode ? (
                      <img
                        src={branch.qrCode}
                        alt={`QR for ${branch.name}`}
                        className="w-40 h-40"
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-sm">
                        QR generating...
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold mb-1">{branch.name}</h3>
                  {branch.address && (
                    <p className="text-xs text-slate-500 mb-2">
                      {branch.address}
                    </p>
                  )}
                  {branch.keywords && (
                    <p className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md mb-2 font-medium">
                      Keywords: {branch.keywords}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <Star className="w-3 h-3" />
                    <span>
                      {branch.reviews.length} review
                      {branch.reviews.length !== 1 && "s"}
                    </span>
                    <span className="mx-1">•</span>
                    <span>Threshold: {branch.lowRatingThreshold}+</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-3 py-2 mb-3">
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                      <Link2 className="w-3 h-3" />
                      Review link
                    </div>
                    <div className="text-xs font-mono text-slate-700 truncate">
                      {reviewUrl}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyReviewLink(branch.publicSlug)}
                      className="flex-1 inline-flex items-center justify-center gap-1 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition"
                    >
                      {copied === branch.publicSlug ? (
                        <>
                          <Check className="w-4 h-4" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy Link
                        </>
                      )}
                    </button>
                    {branch.qrCode && (
                      <button
                        onClick={() => downloadQR(branch.qrCode!, branch.name)}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                    )}
                  </div>
                  {!isAdmin && (
                    <button
                      onClick={() => {
                        setEditingBranch(branch);
                        setFormData({
                          name: branch.name,
                          address: branch.address || "",
                          lowRatingThreshold: branch.lowRatingThreshold,
                          keywords: branch.keywords || "",
                        });
                        setShowModal(true);
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Edit Branch Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingBranch ? "Edit Branch" : "Add New Branch"}
              </h2>
              <button onClick={() => {
                setShowModal(false);
                setEditingBranch(null);
              }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                  placeholder="Main Street Location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                  placeholder="123 Main St, City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Keywords (comma-separated, optional)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                  placeholder="e.g. food, staff, service"
                />
                <p className="text-xs text-slate-500 mt-1">
                  AI review generation will emphasize these keywords.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Low Rating Threshold
                </label>
                <select
                  value={formData.lowRatingThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowRatingThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                >
                  <option value={3}>3+ stars → Public (Default)</option>
                  <option value={4}>4+ stars → Public</option>
                  <option value={5}>Only 5 stars → Public</option>
                  <option value={2}>2+ stars → Public</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Ratings below this go to private feedback form.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBranch(null);
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingBranch ? (
                    "Save Changes"
                  ) : (
                    "Create Branch"
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
