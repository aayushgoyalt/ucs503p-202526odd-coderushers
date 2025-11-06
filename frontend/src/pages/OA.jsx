// src/pages/OADashboardSophisticated.jsx
import React, { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

// ---------- Helpers ----------
const safe = (v, fallback = "") => {
  if (v === undefined || v === null) return fallback;
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  try { return String(v); } catch (e) { return fallback; }
};

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Number(n) || 0));
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

// ---------- Fallback demo (used only if fetch fails) ----------
const FALLBACK_RECENT = [
  {
    oaId: "oa_demo",
    status: "completed",
    createdAt: dayjs().subtract(3, 'day').toISOString(),
    endedAt: dayjs().subtract(3, 'day').add(70, 'minute').toISOString(),
    totalQuestions: 4,
    completedCount: 4,
    completionRatePercent: 100,
    durationMinutes: 70,
    difficultyCounts: { Easy: 1, Medium: 2, Hard: 1 },
    questions: [
      { id: 'dq1', slug: 'two-sum', url: 'https://leetcode.com/problems/two-sum/' }
    ]
  }
];

/* 
const DEMO_RECENT = [
  {
    oaId: "oa_1",
    status: "completed",
    createdAt: dayjs().subtract(2, "day").toISOString(),
    startedAt: dayjs().subtract(2, "day").toISOString(),
    endedAt: dayjs().subtract(2, "day").add(70, "minute").toISOString(),
    totalQuestions: 4,
    completedCount: 4,
    completionRatePercent: 100,
    durationMinutes: 70,
    difficultyCounts: { Easy: 1, Medium: 2, Hard: 1 },
    questions: [
      { id: "q1", slug: "two-sum", url: "https://leetcode.com/problems/two-sum/" },
      { id: "q2", slug: "add-two-numbers", url: "https://leetcode.com/problems/add-two-numbers/" },
      { id: "q3", slug: "longest-substring", url: "https://leetcode.com/problems/longest-substring/" },
      { id: "q4", slug: "median-of-two-sorted", url: "https://leetcode.com/problems/median-of-two-sorted/" }
    ]
  },
  {
    oaId: "oa_2",
    status: "expired",
    createdAt: dayjs().subtract(5, "day").toISOString(),
    startedAt: dayjs().subtract(5, "day").toISOString(),
    endedAt: dayjs().subtract(5, "day").add(90, "minute").toISOString(),
    totalQuestions: 4,
    completedCount: 2,
    completionRatePercent: 50,
    durationMinutes: 90,
    difficultyCounts: { Easy: 1, Medium: 1, Hard: 2 },
    questions: [
      { id: "q5", slug: "valid-parentheses", url: "https://leetcode.com/problems/valid-parentheses/" },
      { id: "q6", slug: "merge-intervals", url: "https://leetcode.com/problems/merge-intervals/" },
      { id: "q7", slug: "hard-q", url: "https://leetcode.com/problems/" },
      { id: "q8", slug: "hard-q-2", url: "https://leetcode.com/problems/" }
    ]
  },
  {
    oaId: "oa_3",
    status: "completed",
    createdAt: dayjs().subtract(8, "day").toISOString(),
    startedAt: dayjs().subtract(8, "day").toISOString(),
    endedAt: dayjs().subtract(8, "day").add(60, "minute").toISOString(),
    totalQuestions: 4,
    completedCount: 4,
    completionRatePercent: 100,
    durationMinutes: 60,
    difficultyCounts: { Easy: 2, Medium: 1, Hard: 1 },
    questions: [
      { id: "q9", slug: "binary-tree-level-order", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
      { id: "q10", slug: "climbing-stairs", url: "https://leetcode.com/problems/climbing-stairs/" },
      { id: "q11", slug: "search-in-rotated-sorted", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
      { id: "q12", slug: "hard-q-3", url: "https://leetcode.com/problems/" }
    ]
  },
  {
    oaId: "oa_4",
    status: "expired",
    createdAt: dayjs().subtract(12, "day").toISOString(),
    startedAt: dayjs().subtract(12, "day").toISOString(),
    endedAt: dayjs().subtract(12, "day").add(30, "minute").toISOString(),
    totalQuestions: 4,
    completedCount: 1,
    completionRatePercent: 25,
    durationMinutes: 30,
    difficultyCounts: { Easy: 1, Medium: 0, Hard: 3 },
    questions: [
      { id: "q13", slug: "easy-q", url: "https://leetcode.com/problems/" },
      { id: "q14", slug: "hard-q-4", url: "https://leetcode.com/problems/" },
      { id: "q15", slug: "hard-q-5", url: "https://leetcode.com/problems/" },
      { id: "q16", slug: "hard-q-6", url: "https://leetcode.com/problems/" }
    ]
  },
  {
    oaId: "oa_5",
    status: "completed",
    createdAt: dayjs().subtract(20, "day").toISOString(),
    startedAt: dayjs().subtract(20, "day").toISOString(),
    endedAt: dayjs().subtract(20, "day").add(80, "minute").toISOString(),
    totalQuestions: 4,
    completedCount: 3,
    completionRatePercent: 75,
    durationMinutes: 80,
    difficultyCounts: { Easy: 1, Medium: 2, Hard: 1 },
    questions: [
      { id: "q17", slug: "two-sum-unique", url: "https://leetcode.com/problems/" },
      { id: "q18", slug: "array-q", url: "https://leetcode.com/problems/" },
      { id: "q19", slug: "string-q", url: "https://leetcode.com/problems/" },
      { id: "q20", slug: "hard-q-7", url: "https://leetcode.com/problems/" }
    ]
  }
];
*/

// ---------- Subcomponents ----------
function Banner({ activeOA, onStart, onJoin }) {
  // activeOA: object or null. If activeOA present, show join action.
  const isActive = !!activeOA;
  return (
    <div className="rounded-2xl bg-[#0b0b12] text-white p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold">Ready to ace your OA?</h2>
        <p className="mt-1 text-sm opacity-90 max-w-xl">
          {isActive
            ? "An OA is currently in progress. Join back to continue the test before it ends."
            : "Start a fresh OA — you'll get 4 curated questions (1 Easy, 2 Medium, 1 Hard) and 90 minutes."}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isActive ? (
          <>
            <div className="text-sm bg-white/10 px-3 py-2 rounded">{`Ends ${activeOA?.endedAt ? dayjs(activeOA.endedAt).fromNow() : ""}`}</div>
            <button
              onClick={() => onJoin && onJoin(activeOA)}
              className="px-4 py-2 bg-white text-indigo-700 rounded font-semibold shadow"
            >
              Join OA
            </button>
          </>
        ) : (
          <button
            onClick={onStart}
            className="px-6 py-3 bg-black/10 hover:bg-white/10 rounded-lg border border-white/20 text-white font-semibold"
          >
            Start New OA
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle }) {
  return (
    <div className="p-4 bg-[#0b0b12] rounded-xl border border-white/6">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{safe(value, "—")}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}

function SessionCard({ session, onView }) {
  const oaId = safe(session?.oaId ?? session?.id, "unknown");
  const status = safe(session?.status ?? "unknown");
  const createdAt = session?.createdAt ? dayjs(session.createdAt).fromNow() : "";
  const totalQs = Number(session?.totalQuestions ?? (Array.isArray(session?.questions) ? session.questions.length : 0));
  const completed = Number(session?.completedCount ?? 0);
  const percent = clamp(session?.completionRatePercent ?? (totalQs ? Math.round((completed / totalQs) * 100) : 0), 0, 100);
  const dur = session?.durationMinutes ?? "—";
  const diffCounts = session?.difficultyCounts ?? {};

  return (
    <div className="p-4 bg-[#0b0b12] rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-white/5">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">Session</div>
          <div className={`text-xs px-2 py-0.5 rounded ${status === "completed" ? "bg-green-700/30 text-green-300" : "bg-yellow-700/20 text-yellow-300"}`}>
            {status}
          </div>
          <div className="text-xs text-gray-400">• {createdAt}</div>
        </div>

        <div className="mt-3 text-sm text-gray-300 grid grid-cols-2 gap-2 md:grid-cols-4">
          <div>Questions: <span className="font-medium text-white ml-1">{totalQs}</span></div>
          <div>Completed: <span className="font-medium text-white ml-1">{completed}</span></div>
          <div>Completion: <span className="font-medium text-white ml-1">{percent}%</span></div>
          <div>Duration: <span className="font-medium text-white ml-1">{dur === "—" ? "—" : `${dur}m`}</span></div>
        </div>

        <div className="mt-3 text-sm text-gray-300 flex flex-wrap gap-3">
          {Object.entries(diffCounts).map(([k, v]) => (
            <div key={k} className="text-xs text-gray-300">
              <span className={k === "Easy" ? "text-green-400" : k === "Medium" ? "text-yellow-300" : "text-red-400"}>{k}</span>: <span className="font-medium text-white ml-1">{safe(v, 0)}</span>
            </div>
          ))}
        </div>

        <div className="mt-3">
          {(session?.questions || []).slice(0, 4).map((q) => (
            <a key={safe(q?.id, q?.slug)} href={safe(q?.url, "#")} target="_blank" rel="noreferrer" className="mr-3 text-sm underline text-blue-400">
              {safe(q?.slug, q?.id)}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end gap-2">
        <div className="text-xs text-gray-400">Ended {session?.endedAt ? dayjs(session.endedAt).fromNow() : "—"}</div>
        <div className="flex gap-2">
          <button onClick={() => onView && onView(session)} className="px-3 py-1 rounded-md bg-[#111217] text-white text-sm border border-white/6">View</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Dashboard ----------
/**
 * Props:
 *  - data: optional object { recent: [], aggregate: {}, activeOA: object | null }
 *  - onStart: handler when user clicks Start (demo or to call your API)
 *  - onJoin: handler when user clicks Join (activeOA passed)
 */
export default function OADashboardSophisticated({ data = null, onStart = null, onJoin = null }) {
  // If no data prop supplied, use demo
  const navigate = useNavigate();
  const [recent, setRecent] = useState(Array.isArray(data?.recent) ? data.recent : []);

  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = 'oa_history_recent';
    const cacheTimeKey = `${cacheKey}_time`;

    const cached = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(cacheTimeKey);
    const isFresh = cachedTime && dayjs().diff(dayjs(cachedTime), 'minute') < 1; // 1 minute cache

    if (cached && isFresh) {
      try {
        const parsed = JSON.parse(cached);
        setRecent(parsed);
        return;
      } catch (err) {
        console.error('Failed to parse OA history cache', err);
        sessionStorage.removeItem(cacheKey);
        sessionStorage.removeItem(cacheTimeKey);
      }
    }

    const fetchHistory = async () => {
      try {
        const res = await API.get('/oa/history', { signal: controller.signal });
        // support multiple envelope shapes
        const payload = res?.data?.data ?? res?.data?.statusCode ?? res?.data ?? null;
        const recentList = Array.isArray(payload?.recent) ? payload.recent : Array.isArray(payload) ? payload : [];

        if (Array.isArray(recentList) && recentList.length > 0) {
          setRecent(recentList);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(recentList));
            sessionStorage.setItem(cacheTimeKey, dayjs().toISOString());
          } catch (e) {
            console.warn('Failed to write OA history cache', e);
          }
        } else {
          // fallback: leave recent as-is (could be empty or prepopulated)
          console.warn('OA history endpoint returned no recent sessions', payload);
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          // ignore abort
        } else {
          console.warn('Failed to fetch /oa/history/recent, falling back to demo or empty', err);
        }
      }
    };

    fetchHistory();
    return () => controller.abort();
  }, [data]);

  const aggregate = useMemo(() => {
    // if API provided aggregate, prefer it
    if (data?.aggregate && typeof data.aggregate === "object") return data.aggregate;

    const agg = {
      sessions: recent.length,
      totalQuestions: 0,
      totalCompleted: 0,
      completionRatePercent: 0,
      totalTimeMinutes: 0,
      avgSessionDurationMinutes: 0,
      difficultyBreakdown: {}
    };

    for (const s of recent) {
      agg.totalQuestions += Number(s.totalQuestions ?? (Array.isArray(s.questions) ? s.questions.length : 0));
      agg.totalCompleted += Number(s.completedCount ?? 0);
      agg.totalTimeMinutes += Number(s.durationMinutes ?? 0);

      const db = s.difficultyCounts ?? {};
      for (const k of Object.keys(db)) {
        agg.difficultyBreakdown[k] = (agg.difficultyBreakdown[k] || 0) + Number(db[k] ?? 0);
      }
    }

    agg.completionRatePercent = agg.totalQuestions > 0 ? Math.round((agg.totalCompleted / agg.totalQuestions) * 100) : 0;
    agg.avgSessionDurationMinutes = agg.sessions > 0 ? Math.round(agg.totalTimeMinutes / agg.sessions) : 0;
    return agg;
  }, [data, recent]);

  // active OA (if present in data) - fallback: null
  const activeOA = data?.activeOA ?? null;

  // UI state
  const [toast, setToast] = useState(null);

  const handleStart = () => {
    navigate('/practice');
  };
  const handleJoin = (oa) => {
    if (onJoin) return onJoin(oa);
    setToast(`Join OA clicked (demo). OA id: ${safe(oa?.oaId)}`);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="p-6 bg-[#0f0f1c] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <Banner activeOA={activeOA} onStart={handleStart} onJoin={handleJoin} />

        {/* Stat row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Sessions" value={aggregate.sessions} />
          <StatCard label="Total Questions" value={aggregate.totalQuestions} />
          <StatCard label="Solved" value={aggregate.totalCompleted} />
          <StatCard label="Completion %" value={`${aggregate.completionRatePercent}%`} subtitle={`Avg ${aggregate.avgSessionDurationMinutes}m/session`} />
        </div>

        {/* Sessions */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Recent Sessions</h3>
          <div className="space-y-4">
            {recent.length === 0 ? (
              <div className="p-4 bg-[#0b0b12] rounded">No sessions yet</div>
            ) : (
              recent.map((s) => <SessionCard key={safe(s.oaId)} session={s} onView={(sess) => alert(`View session ${safe(sess?.oaId)}`)} />)
            )}
          </div>
        </div>


      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white text-black px-4 py-2 rounded shadow">
          {safe(toast)}
        </div>
      )}
    </div>
  );
}