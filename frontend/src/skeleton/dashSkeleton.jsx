import React from 'react';

export default function DashSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0f0f1c] text-white p-6 space-y-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl text-white font-bold tracking-tight">Analytics Dashboard</h1>
        {/* <div className="flex items-center gap-4 text-sm text-gray-400">
          <p>Last refreshed: {lastSyncedRelative}</p>
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className={`text-blue-400 hover:underline hover:text-blue-300 transition ${syncing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {syncing ? "Syncing..." : "Sync now"}
          </button>
        </div> */}
      </div>
      {/* Top Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-gradient-to-r from-[#1a1b2e] via-[#2b2b3e] to-[#1a1b2e] animate-[pulse_1.5s_ease-in-out_infinite]"
          ></div>
        ))}
      </div>

      {/* Progress + Difficulty Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Skeleton (Progress + Activity) */}
        <div className="bg-[#1a1b2e] border border-[#2b2b3e] rounded-xl p-6 space-y-8">
          <div className="flex gap-8">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#2b2b3e] via-[#3b3b4e] to-[#2b2b3e] animate-pulse"></div>
            <div className="flex flex-col gap-4 justify-center">
              <div className="h-6 w-40 bg-[#2b2b3e] rounded animate-pulse" />
              <div className="h-8 w-36 bg-[#2b2b3e] rounded animate-pulse" />
              <div className="h-4 w-48 bg-[#2b2b3e] rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-48 bg-[#2b2b3e] rounded animate-pulse" />
            <div className="flex space-x-6">
              {Array(7).fill(0).map((_, idx) => (
                <div key={idx} className="w-10 h-10 rounded-md bg-[#2b2b3e] animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Skeleton (Difficulty Cards) */}
        <div className="flex flex-col gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gradient-to-r from-[#1a1b2e] via-[#2b2b3e] to-[#1a1b2e] animate-[pulse_1.5s_ease-in-out_infinite]"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}