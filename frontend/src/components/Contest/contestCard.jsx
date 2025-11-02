export default function ContestCard({ contest, formatDate, getDuration }) {
  return (
    <div className="bg-[#1a1b2e] p-4 rounded-xl shadow-md border border-white/10 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{contest.name}</h3>
        <span className="text-sm text-gray-400">{contest.platform}</span>
      </div>
      <p className="text-sm text-gray-300 mb-1">
        <span className="font-semibold text-white">Type:</span> {contest.type}
      </p>
      <p className="text-sm text-gray-300 mb-1">
        <span className="font-semibold text-white">Start:</span> {formatDate(contest.startTime)}
      </p>
      <p className="text-sm text-gray-300 mb-2">
        <span className="font-semibold text-white">Duration:</span> {getDuration(contest.startTime, contest.endTime)}
      </p>
      <a
        href={contest.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-blue-400 hover:underline"
      >
        View Contest →
      </a>
    </div>
  );
}