export default function ContestTable({ contests, formatDate, getDuration }) {
  return (
    <div className="hidden sm:block overflow-x-auto rounded-lg border border-white/10 shadow-md">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#1a1b2e] text-gray-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Platform</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Start Time</th>
            <th className="px-4 py-3">End Time</th>
            <th className="px-4 py-3">Duration</th>
          </tr>
        </thead>
        <tbody className="bg-[#11121c] divide-y divide-gray-800">
          {contests.length > 0 ? contests.map((c, i) => (
            <tr key={c.id || i} className="hover:bg-[#1f2233] transition">
              <td className="px-4 py-3">{i + 1}</td>
              <td className="px-4 py-3">
                <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {c.name}
                </a>
              </td>
              <td className="px-4 py-3">{c.platform}</td>
              <td className="px-4 py-3">{c.type}</td>
              <td className="px-4 py-3">{formatDate(c.startTime)}</td>
              <td className="px-4 py-3">{formatDate(c.endTime)}</td>
              <td className="px-4 py-3 font-semibold">{getDuration(c.startTime, c.endTime)}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan={7} className="px-4 py-4 text-center text-gray-400">
                No upcoming contests.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}