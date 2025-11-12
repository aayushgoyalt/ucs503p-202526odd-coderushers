import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import dayjs from "dayjs";
import { Toaster, toast } from "react-hot-toast";
import { Calendar, Target, Clock, Award } from "lucide-react";

export default function OADashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState({ recent: [], aggregate: {} });
  const [activeOA, setActiveOA] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [historyRes, statusRes] = await Promise.all([
          API.get("/oa/history-a"),
          API.get("/oa/status-a").catch(() => ({ status: 204 }))
        ]);

        const data = historyRes.data.data;
        setHistory(data);

        if (statusRes.status !== 204 && statusRes.data?.status === "ongoing") {
          setActiveOA(statusRes.data);
        }
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const startOA = async () => {
    try {
      toast.loading("Creating OA...");
      await API.post("/oa/create");
      toast.dismiss();
      toast.success("Starting OA...");
      navigate("/practice");
    } catch (err) {
      toast.dismiss();
      toast.error("Could not create OA");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const agg = history.aggregate;

  return (
    <div className="min-h-screen bg-[#0f0f1c] p-6 text-white">
      <Toaster />

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-[#1a1b2e] p-6 rounded-xl border border-[#2b2b3e]">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Online Assessment Dashboard</h1>
              <p className="text-[#a0aec0] mt-2">
                Track your DSA progress across assessments
              </p>
            </div>

            {activeOA ? (
              <button
                onClick={() => navigate("/practice")}
                className="px-5 py-3 bg-orange-500 rounded-lg hover:bg-orange-600 transition"
              >
                Continue OA
              </button>
            ) : (
              <button
                onClick={startOA}
                className="px-5 py-3 bg-orange-500 rounded-lg hover:bg-orange-600 transition"
              >
                Start New OA
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <StatCard
            icon={<Calendar className="h-6 w-6 text-[#a0aec0]" />}
            label="Total Sessions"
            value={agg.sessions}
          />

          <StatCard
            icon={<Target className="h-6 w-6 text-[#a0aec0]" />}
            label="Total Questions Solved"
            value={`${agg.totalCompleted}/${agg.totalQuestions}`}
          />

          <StatCard
            icon={<Clock className="h-6 w-6 text-[#a0aec0]" />}
            label="Avg Duration"
            value={`${agg.avgSessionDurationMinutes}m`}
          />
        </div>

        {/* Recent Sessions */}
        <div className="bg-[#1a1b2e] p-6 rounded-xl border border-[#2b2b3e]">
          <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>

          {history.recent.length === 0 ? (
            <div className="text-center text-[#a0aec0] py-10">
              <Award className="h-12 w-12 mx-auto opacity-50 mb-3" />
              No sessions yet. Start your first OA!
            </div>
          ) : (
            <div className="space-y-4">
              {history.recent.map((session) => (
                <SessionCard key={session.oaId} session={session} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-[#1a1b2e] p-5 rounded-xl border border-[#2b2b3e]">
      <div className="flex justify-between items-center mb-3">
        {icon}
        <span className="text-sm text-[#a0aec0]">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function SessionCard({ session }) {
  const colors = {
    completed: "text-green-400 border-green-500/50 bg-green-900/20",
    aborted: "text-red-400 border-red-500/50 bg-red-900/20"
  };

  const statusColor = colors[session.status] || colors.aborted;

  return (
    <div className="p-4 rounded-lg border border-[#2b2b3e] bg-[#23253b] hover:border-[#3b3c52] transition">
      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 text-xs rounded-full border ${statusColor}`}>
          {session.status}
        </span>

        <span className="text-sm text-[#a0aec0]">
          {dayjs(session.createdAt).format("MMM D, YYYY • h:mm A")}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm mt-4">
        <div>
          <p className="text-[#a0aec0]">DSA Solved</p>
          <p className="text-white font-semibold">
            {session.dsaCompletedCount}/{session.totalDsaQuestions}
          </p>
        </div>

        <div>
          <p className="text-[#a0aec0]">Completion</p>
          <p className="text-white font-semibold">{session.completionRatePercent}%</p>
        </div>

        <div>
          <p className="text-[#a0aec0]">Duration</p>
          <p className="text-white font-semibold">{session.durationMinutes} min</p>
        </div>
      </div>

      {/* DSA Questions */}
      <div className="mt-4">
        <p className="text-sm text-[#a0aec0] mb-2">Questions</p>

        <div className="space-y-2">
          {session.dsaQuestions.map((q) => (
            <a
              key={q.id}
              href={q.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-[#1e2033] rounded-lg border border-[#2b2b3e] hover:bg-[#292b3f] transition text-sm"
            >
              {q.title}
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}