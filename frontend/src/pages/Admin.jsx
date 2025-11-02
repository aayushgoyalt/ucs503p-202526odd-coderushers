import { useState, useEffect, useMemo, useRef } from "react";
import API from "../api/axios";
import { toast, Toaster } from "react-hot-toast";
import ConfirmModal from "../components/Confirmation/confirm.jsx";

export default function Admin() {
  const [fetchedPlan, setFetchedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    user: "",
    action: "view",
    title: "",
    newName: "",
    questions: "",
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [confirmMessage, setConfirmMessage] = useState("");

  const submitLock = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const parsedQuestions = useMemo(() => {
    return (form.questions || "")
      .split("\n")
      .map((q) => q.trim())
      .filter(Boolean);
  }, [form.questions]);

  const jsonOutput = useMemo(() => {
    return {
      action: form.action,
      ...(form.action === "rename" && form.newName && { newName: form.newName }),
      topics: [
        {
          title: form.title,
          ...(form.action !== "rename" && form.action !== "view" && {
            questions: parsedQuestions,
          }),
        },
      ],
    };
  }, [form, parsedQuestions]);

  const userIdMap = {
    cutiee: "6874b10307fc6f3183997881",
    babygirl: "6873fa0943fbf04d5631aec8",
  };

  const handleSubmit = () => {
    setConfirmAction(() => handleSubmitConfirmed);
    setConfirmMessage("Are you sure you want to perform this action?");
    setShowConfirm(true);
  };

  const handleSubmitConfirmed = async () => {
    if (submitLock.current) return;
    submitLock.current = true;

    const userId = userIdMap[form.user.toLowerCase()];
    if (!userId) {
      toast.error("Please select a valid user.");
      submitLock.current = false;
      return;
    }

    setLoading(true);
    try {
      if (form.action === "view") {
        const { data } = await API.get(`/studyplan/${userId}`);
        toast.success("Fetched successfully!");
        setFetchedPlan(data.statusCode.topics || []);
      } else {
        await API.patch(`/studyplan/${userId}`, jsonOutput);
        toast.success("Action completed successfully!");
        setFetchedPlan(null);
      }
    } catch (err) {
      toast.error("Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      submitLock.current = false;
    }
  };

  const handleDelete = () => {
    setConfirmAction(() => handleDeleteConfirmed);
    setConfirmMessage("Are you sure you want to delete this study plan?");
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    const userId = userIdMap[form.user.toLowerCase()];
    if (!userId) return toast.error("Please select a valid user.");

    setLoading(true);
    try {
      await API.delete(`/studyplan/${userId}`);
      toast.success("Study plan deleted successfully!");
      setFetchedPlan(null);
    } catch (err) {
      toast.error("Failed to delete: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const [awaitedContests, setAwaitedContests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchAwaitedContests = async () => {
    try {
      const { data } = await API.get("/contest/active");
      setAwaitedContests(data.statusCode.awaitedContests || []);
    } catch (err) {
      toast.error("Failed to fetch awaited contests");
    }
  };

  const toggleContest = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const confirmArchiveSelectedContests = async () => {
    try {
      await API.post("/contest/archive", { contestIds: selectedIds });
      toast.success("Archived successfully!");
      setSelectedIds([]);
      fetchAwaitedContests();
    } catch (err) {
      toast.error("Failed to archive contests.");
    }
  };

  const archiveSelectedContests = () => {
    if (selectedIds.length === 0) return toast.error("No contests selected.");
    setConfirmMessage(`Are you sure you want to archive ${selectedIds.length} contest(s)?`);
    setConfirmAction(() => confirmArchiveSelectedContests);
    setShowConfirm(true);
  };

  useEffect(() => {
    fetchAwaitedContests();
  }, []);
  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 bg-[#0f0f1c] min-h-screen text-white">
      <Toaster position="top-right" />
      {/* ===== Left: Form ===== */}
      <div className="w-full lg:w-1/2 space-y-6">
        <h1 className="text-2xl font-bold">Configure Action</h1>

        {/* User */}
        <div>
          <label className="block mb-1 text-sm text-gray-300">User</label>
          <select
            name="user"
            value={form.user}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2"
          >
            <option value="">Select a user</option>
            <option value="babygirl">Babygirl</option>
            <option value="cutiee">Cutiee</option>
          </select>
        </div>

        {/* Action Type */}
        <div>
          <label className="block mb-1 text-sm text-gray-300">Action Type</label>
          <select
            name="action"
            value={form.action}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2"
          >
            <option value="view">View</option>
            <option value="add">Add</option>
            <option value="remove">Remove</option>
            <option value="delete">Delete</option>
            <option value="replace">Replace</option>
            <option value="rename">Rename</option>
          </select>
        </div>

        {/* Title (hidden for view) */}
        {form.action !== "view" && (
          <div>
            <label className="block mb-1 text-sm text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter topic title"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2"
            />
          </div>
        )}

        {/* New Name (only for rename) */}
        {form.action === "rename" && (
          <div>
            <label className="block mb-1 text-sm text-gray-300">New Name</label>
            <input
              type="text"
              name="newName"
              value={form.newName}
              onChange={handleChange}
              placeholder="Enter new topic name"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2"
            />
          </div>
        )}

        {/* Questions (hidden for rename & view) */}
        {form.action !== "rename" && form.action !== "view" && (
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Questions (one per line)
            </label>
            <textarea
              name="questions"
              value={form.questions}
              onChange={handleChange}
              placeholder="Enter questions here..."
              rows={6}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-white text-black py-2 rounded-md hover:bg-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Submit"}
        </button>

        {/* Delete Button for 'view' */}
        {form.action === "view" && (
            <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full mt-2 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Processing..." : "Delete"}
          </button>
        )}
      </div>

      {/* ===== Right: JSON Output ===== */}
        <div id="outputPanel" className="w-full lg:w-1/2">
            <h2 className="text-xl font-semibold mb-2">
                {form.action === "view" ? "Fetched Study Plan" : "JSON Output"}
            </h2>
            <textarea
                readOnly
                className="w-full min-h-[400px] bg-black text-green-500 font-mono rounded-md p-4 border border-gray-800"
                value={
                form.action === "view"
                    ? JSON.stringify(fetchedPlan, null, 2)
                    : JSON.stringify(jsonOutput, null, 2)
                }
            />
            {form.action === "view" && fetchedPlan && (
              <div className="mt-6 bg-gray-800 p-4 rounded-md">
                {fetchedPlan.map((topic, idx) => (
                  <div key={idx} className="mb-4">
                    <h3 className="text-orange-400 font-semibold text-lg mb-1">{topic.title}</h3>
                    <ul className="list-disc list-inside text-green-300 text-sm">
                      {topic.questions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
         </div>
         <ConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={confirmAction}
          message={confirmMessage}
        />
         <div className="w-full lg:w-1/2 mt-10">
      <h2 className="text-2xl font-bold mb-4">📦 Archive Completed Contests</h2>
      <div className="bg-[#1a1b2e] p-4 rounded-lg border border-white/10 space-y-3 max-h-[400px] overflow-y-auto">
        {awaitedContests.length === 0 ? (
          <p className="text-gray-400">No awaited contests available.</p>
        ) : (
          awaitedContests.map((contest) => (
            <label
              key={contest._id}
              className="flex items-center gap-3 text-sm cursor-pointer text-white"
            >
              <input
                type="checkbox"
                className="accent-blue-500"
                checked={selectedIds.includes(contest._id)}
                onChange={() => toggleContest(contest._id)}
              />
              <span>
                <strong>{contest.platform}</strong> — {contest.name}
              </span>
            </label>
          ))
        )}
      </div>

      <button
        onClick={archiveSelectedContests}
        disabled={selectedIds.length === 0}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
      >
        Archive Selected Contests
      </button>
    </div>
    </div>
    
  );
}
