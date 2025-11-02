import dayjs from "dayjs";

export default function MobileContestCard({ contests, contest, formatDate, getDuration }) {
  if (contests) {
    return (
      <div className="sm:hidden">
        <table className="min-w-full text-sm rounded-md overflow-hidden border border-white/10 shadow-md">
          <thead className="bg-[#1a1b2e] text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Platform</th>
              <th className="px-2 py-2">Start</th>
              <th className="px-2 py-2">⏱</th>
            </tr>
          </thead>
          <tbody className="bg-[#11121c] divide-y divide-gray-800">
            {contests.length > 0 ? contests.map((c, i) => (
              <tr key={c.id || i} onClick={() => window.open(c.link, "_blank")} className="hover:bg-[#1f2233] transition cursor-pointer">
                <td className="px-2 py-2 text-center">{i + 1}</td>
                <td className="px-2 py-2">{c.platform}</td>
                <td className="px-2 py-2 text-xs whitespace-nowrap">{dayjs(c.startTime).format("MMM D, hh:mm A")}</td>
                <td className="px-2 py-2 font-semibold">{getDuration(c.startTime, c.endTime)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                  No upcoming contests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // For completed contests mobile view
  return (
    <div
      className="bg-[#1a1b2e] p-4 rounded-xl shadow-md border border-white/10 hover:shadow-lg transition"
      onClick={() => window.open(contest.link, "_blank")}
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-md font-semibold">
          {contest.name.length > 30 ? contest.name.slice(0, 28) + "..." : contest.name}
        </h3>
        <span className="text-xs text-gray-400">{contest.platform}</span>
      </div>
      <p className="text-xs text-gray-300">
        <span className="font-medium text-white">⏱</span>{" "}
        {dayjs(contest.startTime).format("MMM D, hh:mm A")} ・{" "}
        {getDuration(contest.startTime, contest.endTime)}
      </p>
    </div>
  );
}