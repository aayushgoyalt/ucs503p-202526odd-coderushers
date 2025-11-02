function ProgressBar({ topic, completed, total }) {
  const percent = total === 0 ? 0 : (completed / total) * 100;
  const roundedPercent = Math.round(percent);

  return (
    <div className="bg-[#15162c] p-4 mt-8 rounded-3xl border border-gray-800 shadow-inner w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-semibold text-lg tracking-wide">{topic}</h3>
        <span className="text-sm text-gray-400">
          {completed} / {total} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative mt-3">
        <div className="w-full h-2 bg-[#20253d] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Optional Percent Label at End */}
        <div className="text-right text-xs text-gray-400 mt-2">
          {roundedPercent}% complete
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;