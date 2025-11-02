import React from 'react';

export default function TcSkeleton() {
  return (
    <div className="p-6 bg-[#0f0f1c] min-h-screen min-w-[calc(100%-20rem)] flex gap-6">
      {/* Always show real Sidebar outside this skeleton */}
        <div className=" shrink-0">
                
        </div>
      {/* Main Content Skeleton */}
      <div className="flex-1 mt-8 animate-pulse]">
        {/* Topic Title */}
        <div className="h-10 w-1/3 bg-[#1f1f2e] rounded mb-6" />

        {/* Progress Bar */}
        <div className="h-4 w-full bg-[#1f1f2e] rounded mb-8" />

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="h-8 w-32 bg-[#1f1f2e] rounded" />
          <div className="h-8 w-32 bg-[#1f1f2e] rounded" />
          <div className="h-8 w-32 bg-[#1f1f2e] rounded" />
        </div>

        {/* Question Cards Skeleton */}
        <div className="flex flex-col gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-md bg-[#1f1f2e] space-y-2">
              <div className="h-4 w-2/3 bg-[#2a2a3c] rounded" />
              <div className="h-3 w-1/4 bg-[#2a2a3c] rounded" />
              <div className="h-3 w-1/2 bg-[#2a2a3c] rounded" />
              <div className="h-3 w-1/3 bg-[#2a2a3c] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}