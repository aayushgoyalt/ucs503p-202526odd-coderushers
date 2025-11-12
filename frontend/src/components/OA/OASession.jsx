import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import API from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function OASession({ activeOA, onEnd }) {
  const [remaining, setRemaining] = useState("00:00:00");

  // Timer for OA (90 minutes)
  useEffect(() => {
    if (!activeOA?.endsAt) return;

    const updateTimer = () => {
      const diff = new Date(activeOA.endsAt) - new Date();
      if (diff <= 0) {
        setRemaining("00:00:00");
        return;
      }
      const sec = Math.floor(diff / 1000);
      const hh = String(Math.floor(sec / 3600)).padStart(2, "0");
      const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");
      setRemaining(`${hh}:${mm}:${ss}`);
    };

    updateTimer();
    const id = setInterval(updateTimer, 1000);
    return () => clearInterval(id);
  }, [activeOA]);

  // Submit DSA Section
  const handleSubmitDsaSection = async () => {
    if (!window.confirm("Are you sure you want to submit and complete the OA?")) {
      return;
    }

    try {
      toast.loading("Submitting OA...");
      await API.post("/oa/submit-dsa-section");
      toast.dismiss();
      toast.success("OA completed successfully!");
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error("Failed to submit OA:", err);
      toast.dismiss();
      toast.error("Failed to submit OA. Please try again.");
    }
  };

  // === FINAL CLEAN VERSION — ONLY DSA SECTION ===
  return (
    <div className="space-y-4">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Section Header */}
      <div className="bg-[#181825] rounded-xl p-4 border border-[#2b2b3e]">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-xl font-bold text-white">💻 DSA Section</h2>
            <p className="text-sm text-gray-400">4 questions • 90 minutes</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Time Remaining</div>
            <div className="text-2xl font-mono text-emerald-400">{remaining}</div>
          </div>
        </div>

        <button
          onClick={handleSubmitDsaSection}
          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition"
        >
          Submit DSA Section & Complete OA
        </button>
      </div>

      {/* Progress */}
      <div className="bg-[#181825] rounded-xl p-4 border border-[#2b2b3e]">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-white font-semibold">
            {activeOA.stats.dsaCompleted} / {activeOA.stats.dsaTotal}
          </span>
        </div>

        <div className="w-full bg-[#2b2b3e] rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(activeOA.stats.dsaCompleted / activeOA.stats.dsaTotal) * 100}%` }}
          />
        </div>

        <div className="mt-2 text-xs text-gray-400">
          {activeOA.stats.dsaTotal - activeOA.stats.dsaCompleted} questions remaining
        </div>
      </div>

      {/* DSA Questions */}
      <div className="bg-[#181825] rounded-xl p-4 border border-[#2b2b3e]">
        <h3 className="text-lg font-semibold text-white mb-3">Questions</h3>
        <div className="space-y-3">
          {activeOA.dsaQuestions.map((q, idx) => {
            return (
              <div
                key={q.id}
                className="flex items-center justify-between bg-[#1b1b29] p-3 rounded-lg border border-[#2b2b3e]"
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Completion state */}
                  {q.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-500 flex-shrink-0" />
                  )}

                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">Q{idx + 1}</div>

                    {/* Question Link */}
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`font-medium ${
                        q.status === "completed"
                          ? "text-gray-400 line-through"
                          : "text-white hover:text-emerald-400"
                      } transition`}
                    >
                      {q.title}
                    </a>
                  </div>
                </div>

                <a
                  href={q.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition flex-shrink-0"
                >
                  Solve
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-[#181825] rounded-xl p-4 border border-[#2b2b3e]">
        <h4 className="text-sm font-semibold text-white mb-2">📋 Instructions</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
          <li>Click "Solve" to open the problem on LeetCode</li>
          <li>Your browser extension tracks your submissions</li>
          <li>Complete all questions within the time limit</li>
          <li>Click "Submit DSA Section" to finish the OA</li>
        </ul>
      </div>
    </div>
  );
}