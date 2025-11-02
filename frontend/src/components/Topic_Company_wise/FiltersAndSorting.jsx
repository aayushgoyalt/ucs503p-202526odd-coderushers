import React, { useEffect } from 'react';
import { Filter, List, ArrowUpDown, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';



export default function FiltersAndSorting({
  statusFilter,
  setStatusFilter,
  difficultyFilter,
  setDifficultyFilter,
  onSelect
}) {
  
  const [searchParams, setSearchParams] = useSearchParams();
  const handleReset = () => {
    onSelect(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('topic');
    newParams.delete('status');
    newParams.delete('difficulty');
    setSearchParams(newParams);
  };

  // Styles applied to all filter buttons
  const baseButton =
    'px-3 py-1.5 rounded-md text-sm border border-gray-700 font-medium transition-all  duration-200 ease-in-out hover:scale-105';
  const activeButton =
    'bg-blue-600 text-white border-gray-800 shadow shadow-blue-600/30 ';
  const inactiveButton =
    'bg-transparent text-gray-300 border- hover:bg-gray-800 hover:border-gray-500';

  return (
    <div className="bg-[#0f0f1c] rounded-xl p-4 flex flex-wrap md:flex-nowrap gap-6 items-center mt-4 shadow-inner ">
      
      {/* Filters Label */}
      <div className="min-w-fit mt-3.5">
        <h2 className="text-base font-semibold  text-white flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters & Sorting
        </h2>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-1 min-w-fit ">
        <label className="flex items-center pl-1 gap-2 text-sm text-gray-300">
          Status
        </label>
        <div className="flex gap-2">
          {['solved', 'unsolved'].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() =>
                  setStatusFilter(isActive ? null : status)
                }
                className={`${baseButton} ${isActive ? activeButton : inactiveButton}`}
              >
                {status[0].toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="flex flex-col gap-1 min-w-fit">
        <label className="flex items-center pl-1 gap-2 text-sm text-gray-300">
          Difficulty
        </label>
        <div className="flex gap-2">
          {['Easy', 'Medium', 'Hard'].map((level) => {
            const isActive = difficultyFilter === level;
            return (
              <button
                key={level}
                onClick={() =>
                  setDifficultyFilter(isActive ? null : level)
                }
                className={`${baseButton} ${isActive ? activeButton : inactiveButton}`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex flex-col gap-1 min-w-fit">
        <label className="text-sm text-gray-300">Reset</label>
        <button
          onClick={handleReset}
          title="Reset all filters"
          className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all duration-200 ease-in-out hover:scale-110"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}