"use client";

import { useEffect, useState } from "react";
import { Plus, X, Trash2, CheckCircle2, Bot } from "lucide-react";

type AIModel = {
  id: string;
  provider: string;
  modelName: string;
  apiKey: string;
  isActive: number;
  statusError?: string | null;
  createdAt: string;
};

export default function AdminAIModelsPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [provider, setProvider] = useState("OpenAI");
  const [modelName, setModelName] = useState("gpt-3.5-turbo");
  const [apiKey, setApiKey] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch("/api/admin/ai-models");
      const data = await res.json();
      if (res.ok) {
        setModels(data.models || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    if (newProvider === "OpenAI") setModelName("gpt-3.5-turbo");
    else if (newProvider === "Gemini") setModelName("gemini-1.5-flash");
    else if (newProvider === "ZLM") setModelName("zlm-v1");
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/ai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, modelName, apiKey }),
      });
      if (res.ok) {
        await fetchModels();
        setShowModal(false);
        setApiKey("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ai-models/${id}/activate`, { method: "PUT" });
      if (res.ok) {
        await fetchModels();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this AI model?")) return;
    try {
      const res = await fetch(`/api/admin/ai-models/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchModels();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const maskApiKey = (key: string) => {
    if (!key || key.length < 8) return "••••••••";
    return key.substring(0, 4) + "••••••••" + key.substring(key.length - 4);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage AI Models</h1>
          <p className="mt-2 text-gray-600">Configure LLMs for generating automated reviews. Only one model is active at a time.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add AI Model
        </button>
      </div>

      {/* Alert banner if active model has error */}
      {models.find(m => m.isActive && m.statusError) && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
          <div className="font-bold shrink-0">⚠️ Active AI Model Status Error:</div>
          <div className="flex-1">
            {models.find(m => m.isActive && m.statusError)?.statusError}
            <div className="mt-1 text-xs text-rose-600 font-semibold">
              The AI-generation fallback templates are currently being used because the model API key returned this error. Please check your billing, rate limits, or API key configuration.
            </div>
          </div>
        </div>
      )}

      {models.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Models Configured</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't configured any AI models yet. The system is currently using the default template fallback.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Model
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <th className="p-4">Provider</th>
                <th className="p-4">Model Name</th>
                <th className="p-4">API Key</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {models.map((m) => (
                <tr key={m.id} className={`hover:bg-gray-50 ${m.isActive ? 'bg-indigo-50/30' : ''}`}>
                  <td className="p-4 font-medium text-gray-900">{m.provider}</td>
                  <td className="p-4 text-gray-600">{m.modelName}</td>
                  <td className="p-4 font-mono text-gray-500">{maskApiKey(m.apiKey)}</td>
                  <td className="p-4">
                    {m.isActive ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Active
                        </span>
                        {m.statusError && (
                          <span className="text-[11px] text-rose-600 font-medium leading-tight">
                            Error: {m.statusError.length > 60 ? m.statusError.substring(0, 60) + "..." : m.statusError}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    {!m.isActive && (
                      <button
                        onClick={() => handleActivate(m.id)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Add AI Model</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddModel}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="OpenAI">OpenAI (ChatGPT)</option>
                    <option value="Gemini">Google Gemini</option>
                    <option value="ZLM">ZLM API</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. gpt-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="password"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="sk-..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Add Model"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
