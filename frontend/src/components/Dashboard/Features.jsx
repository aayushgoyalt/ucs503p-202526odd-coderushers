function Card({ title, value, icon }) {
  return (
    <div className="bg-[#1a1b2e] border border-[#2b2b3e] rounded-xl p-5 shadow-sm flex flex-col gap-2">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-sm text-[#a0aec0] mb-1">{title}</p>
      <p className="text-xl font-semibold text-white leading-snug mb-1">{value}</p>
    </div>
  );
}

function CircularProgress({ value, total }) {
  const radius = 70;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const percent = (value / total) * 100;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-36 h-36">
      <svg height="100%" width="100%">
        <circle
          stroke="#25263d"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="50%"
          cy="50%"
        />
        <circle
          stroke="#3b82f6"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx="50%"
          cy="50%"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

function DifficultyCard({ label, solved, total, color, percent }) {
  const colorMap = {
    green: "from-green-400 to-green-600",
    orange: "from-orange-400 to-orange-600",
    red: "from-red-400 to-red-600",
  };
  const textColor = {
    green: "text-green-300",
    orange: "text-orange-300",
    red: "text-red-300",
  };
  const badgeBg = {
    green: "bg-green-900",
    orange: "bg-orange-900",
    red: "bg-red-900",
  };

  return (
    <div className="bg-[#1a1b2e] border border-[#2b2b3e] rounded-xl p-4 shadow-sm text-sm">
      <div className="flex justify-between items-center mb-1">
        <p className={`text-base font-semibold ${textColor[color]}`}>{label}</p>
        <span className={`text-sm px-2 py-0.5 rounded-full ${badgeBg[color]} ${textColor[color]}`}>{percent}%</span>
      </div>
      <p className="text-sm text-[#a0aec0] mb-1">Solved</p>
      <ProgressBar value={solved} total={total} color={colorMap[color]} />
      <p className="text-base text-[#718096] mt-1">{solved} / {total}</p>
    </div>
  );
}

function ProgressBar({ value, total, color = "from-blue-400 to-blue-600" }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="w-full h-2.5 bg-[#2b2b3e] rounded-full">
      <div
        className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export { Card, CircularProgress, DifficultyCard, ProgressBar };