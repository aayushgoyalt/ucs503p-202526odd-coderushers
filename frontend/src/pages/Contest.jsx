import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import API from "../api/axios";
import ContestCard from "../components/Contest/contestCard";
import MobileContestCard from "../components/Contest/mobileContestCard";
import ContestTable from "../components/Contest/contestTable";
import ContestSkeleton from "../skeleton/ContestSkeleton";

dayjs.extend(duration);


const ContestPage = () => {
  const [contests, setContests] = useState({ upcoming: [], completed: [] });
  const [loading, setLoading] = useState(true);

  const fetchContests = useCallback( async () => {
    try {
      const res = await API.get("/contest/active");
      const data = {
        upcoming: res.data?.statusCode?.upcomingContests || [],
        completed: res.data?.statusCode?.awaitedContests || [],
      }
      setContests(data);
      sessionStorage.setItem('contest_cache', JSON.stringify(data));
    } catch (err) {
      console.error("Failed to fetch contests:", err);
    }finally {
      setLoading(false);
    }
  },[]);
      

  useEffect(() => {
    const cached = sessionStorage.getItem('contest_cache');

    if (cached) {
      try {
        setContests(JSON.parse(cached));
        setLoading(false);
        fetchContests();
      } catch (err) {
        console.error("Error parsing cached contest data:", err);
        sessionStorage.removeItem('contest_cache');
        fetchContests();
      }
    } else {
      fetchContests();
    }
  }, [fetchContests]);

  const { upcoming, completed } = contests;

  const formatDate = (iso) => dayjs(iso).format("MMM D, YYYY hh:mm A");
  const getDuration = (start, end) => {
    const dur = dayjs(end).diff(dayjs(start), "minute");
    const hrs = Math.floor(dur / 60);
    const mins = dur % 60;
    return `${hrs ? `${hrs}h ` : ""}${mins}m`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f1c] text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upcoming Contests</h1>

        {loading ? (
          <ContestSkeleton rows={4} />
        ) : (
          <>
            <ContestTable contests={upcoming} formatDate={formatDate} getDuration={getDuration} />
            <MobileContestCard contests={upcoming} formatDate={formatDate} getDuration={getDuration} />
          </>
        )}


        
        
        {completed.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-12 mb-4">Completed Contests</h2>
            <div className="hidden sm:grid grid-cols-2 gap-4">
              {completed.map((contest, idx) => (
                <ContestCard key={contest.id || idx} contest={contest} formatDate={formatDate} getDuration={getDuration} />
              ))}
            </div>
            <div className="sm:hidden flex flex-col gap-4">
              {completed.map((contest, idx) => (
                <MobileContestCard key={contest.id || idx} contest={contest} formatDate={formatDate} getDuration={getDuration} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ContestPage;