import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import API from '../api/axios';

// Practice page: fetch OA status and render accordingly
export default function PracticePage() {
  const [loading, setLoading] = useState(true);
  const [activeOA, setActiveOA] = useState(null); // null = no active OA
  const [error, setError] = useState(null);

  // Hardcoded timer placeholder for now
  const hardcodedTimer = '01:30:00';

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const loadStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get('/oa/status', { signal: controller.signal });
        if (res.status === 204) {
          if (mounted) setActiveOA(null);
          if (mounted) setLoading(false);
          return;
        }

        // Prefer `statusCode` (your wrapper contains the OA under statusCode).
        // If not present, fall back to `data` only when it's an object.
        let payload = null;
        if (res?.data?.statusCode && typeof res.data.statusCode === 'object') {
          payload = res.data.statusCode;
        } else if (res?.data?.data && typeof res.data.data === 'object') {
          payload = res.data.data;
        } else if (res?.data && typeof res.data === 'object' && res.data.oaId) {
          payload = res.data;
        } else {
          payload = null;
        }

        // If payload is null/undefined treat as no OA
        if (!payload) {
          if (mounted) setActiveOA(null);
        } else {
          // If server returned an object like { oaId, status, questions, endsAt }
          // normalize it into an oa object
          const oa = payload.oaId ? payload : payload.data ?? payload;
          if (oa.status === 'active' || oa.oaId) {
            if (mounted) setActiveOA(oa);
          } else {
            if (mounted) setActiveOA(null);
          }
        }
      } catch (err) {
        // If server returned HTML or 404, we fall back to no active OA
        console.warn('Failed to load /oa/status', err);
        if (mounted) {
          setActiveOA(null);
          setError(err?.message || 'Failed to fetch OA status');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStatus();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const [remaining, setRemaining] = React.useState(hardcodedTimer);

  React.useEffect(() => {
    let id = null;
    if (activeOA && activeOA.endsAt) {
      const update = () => {
        const diff = new Date(activeOA.endsAt) - new Date();
        if (diff <= 0) {
          setRemaining('00:00:00');
          clearInterval(id);
          return;
        }
        const total = Math.max(0, diff);
        const sec = Math.floor(total / 1000);
        const hh = String(Math.floor(sec / 3600)).padStart(2, '0');
        const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
        const ss = String(sec % 60).padStart(2, '0');
        setRemaining(`${hh}:${mm}:${ss}`);
      };
      update();
      id = setInterval(update, 1000);
    } else {
      setRemaining(hardcodedTimer);
    }
    return () => { if (id) clearInterval(id); };
  }, [activeOA]);

  // helper to get question url (from response q.url or slug)
  const getQuestionUrl = (q) => {
    if (!q) return '#';
    if (q.url) return q.url;
    if (q.slug) return `https://leetcode.com/problems/${q.slug}/`;
    return '#';
  };

  return (
    <div className="p-6 bg-[#0f0f1c] min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Banner */}
        <div className="rounded-2xl bg-[#181825] text-white p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Online Assessment</h2>
            <p className="mt-1 text-sm text-gray-300">
              {activeOA ? 'An OA is in progress — join to continue.' : 'Start a fresh OA — you will get 4 curated questions and 90 minutes.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* show pulsing join when active, otherwise Start button */}
            {activeOA ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse block" />
                  <div className="text-sm">OA in progress</div>
                </div>
                <button
                  onClick={() => alert('Joining OA (demo)')}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded font-semibold shadow-md"
                >
                  Join OA
                </button>
              </>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await API.post('/oa/create');
                    window.location.reload();
                  } catch (err) {
                    console.error('Failed to start OA', err);
                    alert('Failed to start OA. Please try again.');
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 rounded-lg text-white font-semibold shadow-md"
              >
                Start OA
              </button>
            )}
          </div>
        </div>

        {/* If loading or no active OA: show only banner + instructions */}
        {loading ? (
          <div className="p-6 text-gray-300">Loading status...</div>
        ) : activeOA ? (
          <>
            {/* Timer (hardcoded) */}
            <div className="p-4 bg-[#14141f] rounded-xl text-center">
              <div className="text-sm text-gray-400">Time Remaining</div>
              <div className="text-3xl font-mono text-emerald-400 mt-2">{remaining}</div>
            </div>

            {/* Questions list from response */}
            <div className="p-4 bg-[#14141f] rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3">Questions</h3>
              <div className="space-y-3">
                {(activeOA.questions || []).map((q, idx) => (
                  <div key={q.id ?? q.question ?? idx} className="flex items-center justify-between bg-[#1b1b29] p-3 rounded">
                    <div className="flex items-center gap-3">
                      {/* status tick */}
                      { (q.status === 'completed' || q.completedOn) ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.071 7.07a1 1 0 01-1.415 0l-3.536-3.536a1 1 0 111.415-1.415l2.828 2.828 6.364-6.364a1 1 0 011.415 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-transparent" />
                        </div>
                      )}

                      <div>
                        <div className="text-sm text-gray-400">Q{idx + 1}</div>
                        <a href={getQuestionUrl(q)} target="_blank" rel="noreferrer" className={`font-medium ${q.status === 'completed' || q.completedOn ? 'text-gray-400 line-through' : 'text-white hover:text-emerald-400'} transition-colors duration-200`}>
                          {q.title ?? q.slug ?? q.question?.title ?? `Question ${idx + 1}`}
                        </a>
                      </div>
                    </div>

                    <div>
                      <a href={getQuestionUrl(q)} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-[#181825] hover:bg-[#1f1f2e] text-white text-sm transition-colors duration-200">Open</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-[#14141f] rounded-xl">
              <h4 className="text-sm text-gray-400">Instructions</h4>
              <div className="mt-2 text-sm text-gray-300 border-t border-gray-700 pt-3">
                <ul className="list-disc pl-5 space-y-1">
                  <li>There are 4 questions: 1 Easy, 2 Medium, 1 Hard.</li>
                  <li>Total time: 90 minutes. Timer is shown above (demo hardcoded).</li>
                  <li>Click "Open" to view the problem on LeetCode. Mark completion in the OA dashboard when done.</li>
                  <li>Do not refresh the page during a live OA (demo behaviour may not persist state).</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          // No active OA: show only banner + instructions
          <div className="p-4 bg-[#14141f] rounded-xl">
            <h4 className="text-sm text-gray-400">Instructions</h4>
            <div className="mt-2 text-sm text-gray-300 border-t border-gray-700 pt-3">
              <ul className="list-disc pl-5 space-y-1">
                <li>There are 4 questions: 1 Easy, 2 Medium, 1 Hard.</li>
                <li>Total time: 90 minutes. Timer will appear when an OA is active.</li>
                <li>Start OA from the banner to receive fresh questions.</li>
                <li>If you had an OA in progress, use the Join button to resume (if available).</li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-400">{String(error)}</div>
        )}
      </div>
    </div>
  );
}