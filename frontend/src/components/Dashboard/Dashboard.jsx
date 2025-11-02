import { useEffect, useState, useCallback, useRef,useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {ProgressBar, CircularProgress, DifficultyCard } from "./Features";
import DashSkeleton from "../../skeleton/dashSkeleton";
import { FaSpinner } from "react-icons/fa";

dayjs.extend(relativeTime);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const syncLock = useRef(false);
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get("/users/stats");
      const data = res.data.statusCode.stats;
      setStats(data);
      console.log("Fetched stats:", data);
      
      sessionStorage.setItem("dashboardStats", JSON.stringify(data));
      sessionStorage.setItem("dashboardStatsTime", new Date().toISOString());
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = sessionStorage.getItem("dashboardStats");
    const cachedTime = sessionStorage.getItem("dashboardStatsTime");
    const isFresh = cachedTime && dayjs().diff(dayjs(cachedTime), "minute") < 1;

    if (cached) {
      try {
        setStats(JSON.parse(cached));
        setLoading(false);

        if (!isFresh) {
          fetchStats();
        }
      } catch (error) {
        console.error("Error parsing cached stats:", error);
        sessionStorage.removeItem("dashboardStats");
        sessionStorage.removeItem("dashboardStatsTime");
        fetchStats(); 
      }
    } else {
      fetchStats(); 
    }
  }, [fetchStats]);

  const handleSyncNow = async () => {
    if (syncLock.current) return;
    syncLock.current = true;

    try {
      setSyncing(true);
      await API.post("/users/sync_daily");
      await fetchStats();
    } catch (err) {
      console.error("Failed to sync:", err);
      alert("Failed to sync. Please try again.");
    } finally {
      setSyncing(false);
      syncLock.current = false;
    }
  };

  
  const totalSolved = stats?.totalSolved || 0;
  const totalQuestions = 3611;
  
  const difficulties = useMemo(() => [
    {
      label: "Easy",
      solved: stats?.easySolved || 0,
      total: 885,
      color: "green",
      percent: Math.round((stats?.easySolved / 885) * 100),
    },
    {
      label: "Medium",
      solved: stats?.mediumSolved || 0,
      total: 1878,
      color: "orange",
      percent: Math.round((stats?.mediumSolved / 1878) * 100),
    },
    {
      label: "Hard",
      solved: stats?.hardSolved || 0,
      total: 848,
      color: "red",
      percent: Math.round((stats?.hardSolved / 848) * 100),
    },
  ], [stats]);
  
  const colorPalette = [
    "bg-slate-800 text-white",
    "bg-emerald-300 text-gray-900",
    "bg-emerald-400 text-gray-900",
    "bg-emerald-500 text-gray-900",
    "bg-emerald-600 text-white",
    "bg-emerald-700 text-white",
    "bg-emerald-800 text-white",
    "bg-emerald-900 text-white",
    "bg-green-800 text-white",
    "bg-green-900 text-white",
    "bg-lime-950 text-white",
    "bg-violet-500 text-white",
  ];
  
  const getColorClass = (count) => {
    if (count === 0) return colorPalette[0];
    if (count === 1) return colorPalette[1];
    if (count === 2) return colorPalette[2];
    if (count === 3) return colorPalette[3];
    if (count === 4) return colorPalette[4];
    if (count === 5) return colorPalette[5];
    if (count <= 7) return colorPalette[6];
    if (count <= 9) return colorPalette[7];
    if (count <= 14) return colorPalette[8];
    if (count <= 19) return colorPalette[9];
    if (count <= 24) return colorPalette[10];
    return colorPalette[11];
  };
  
  const getDuration = (start, end) => {
    const dur = dayjs(end).diff(dayjs(start), "minute");
    const hrs = Math.floor(dur / 60);
    const mins = dur % 60;
    return `${hrs ? `${hrs}h ` : ""}${mins}m`;
  };
  
  const activity = Object.values(stats?.dailySolved || {});
  const lastSyncedRelative = dayjs(stats?.lastSynced).fromNow();
  
  if (loading) return (
    <>
      <DashSkeleton />
    </>
  );
  if (!stats) return <div className="text-white">Failed to load dashboard.</div>;
  
  return (
    <div className="bg-[#0f0f1c] text-white p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl text-white font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <p>Last refreshed: {lastSyncedRelative}</p>
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className={`text-blue-400 hover:underline hover:text-blue-300 transition flex items-center gap-2 ${syncing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {syncing ? (
              <>
                <FaSpinner className="animate-spin" /> Syncing...
              </>
            ) : (
              "Sync now"
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* <Card title="This Week" value={`${stats.weekCount} problems solved`} icon="🗓️" /> */}
        <div className="bg-[#1a1b2e] border border-[#2b2b3e] rounded-xl p-5 shadow-sm flex flex-col gap-2">
          <div className="text-2xl mb-2">🗓️</div>
          <p className="text-sm text-[#a0aec0] mb-1">This Week</p>
          <p className="text-xl font-semibold text-white leading-snug mb-1">{`${stats.weekCount} problems solved`}</p>
        </div>

        {/* <Card title="Current Streak" value={`${stats.streak} days in a row`} icon="🔥" /> */}
        <div
          onClick={() => {
            if (stats.dailyQuestion.slug) {
              window.open(`https://leetcode.com${stats.dailyQuestion.slug}`, "_blank");
            }
          }}
          className="bg-[#1a1b2e] hover:bg-[#23253b] transition border border-[#2b2b3e] rounded-xl p-5 shadow-sm cursor-pointer w-full">
          <div className="text-2xl mb-2">🔥</div>
          <p className="text-sm text-[#a0aec0] mb-1">Current Streak</p>
          <p className="text-xl font-semibold text-white leading-snug mb-1">{`${stats.streak} days in a row`}</p>
        </div>
        
        {stats.nextContest ? (
        <div
          onClick={() => {
            if (stats.nextContest.link) {
              window.open(stats.nextContest.link, "_blank");
            } else {
              navigate("/contest");
            }
          }}
          className="bg-[#1a1b2e] hover:bg-[#23253b] transition border border-[#2b2b3e] rounded-xl p-5 shadow-sm cursor-pointer w-full"
        >
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-sm text-[#a0aec0] mb-1">Next Contest</p>

          <div className="flex justify-between items-start gap-3 mb-2">
            <h2
              className="text-white text-base font-semibold leading-snug max-w-[60%] truncate"
              title={stats.nextContest.name}
            >
              {stats.nextContest.name}
            </h2>
            <p className="text-xs text-gray-400 whitespace-nowrap">
              {dayjs(stats.nextContest.startTime).format("ddd, MMM D, hh:mm A")}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-white font-medium">{stats.nextContest.platform}</p>
              <p className="text-[11px] text-gray-400">{stats.nextContest.type}</p>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              {getDuration(stats.nextContest.startTime, stats.nextContest.endTime)}
            </p>
          </div>
        </div>
      ) : (
        <div
          className="bg-[#1a1b2e] hover:bg-[#23253b] transition border border-[#2b2b3e] rounded-xl p-5 shadow-sm cursor-pointer w-full"
          onClick={() => navigate("/contest")}
        >
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-sm text-[#a0aec0] mb-1">Next Contest</p>
          <p className="text-base font-semibold text-white leading-snug">No Contests</p>
        </div>
      )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#1a1b2e] p-6 shadow-sm border border-[#2b2b3e] flex flex-col justify-between">
          <div className="flex items-center gap-8">
            <CircularProgress value={totalSolved} total={totalQuestions} />
            <div>
              <p className="text-2xl text-[#a0aec0]">Questions Solved</p>
              <p className="text-3xl font-bold">{totalSolved} / {totalQuestions}</p>
              <p className="text-md text-[#718096] mt-1">
                {totalQuestions - totalSolved} problems remaining
              </p>
            </div>
          </div>

          <div className="">
            <h2 className="font-semibold text-4xl text-[#cbd5e1] mb-7">Recent Activity</h2>
            <div className="flex space-x-6 mx-auto">
              {activity.map((count, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-10 flex items-center justify-center rounded-md text-[12px] font-bold shadow transition-all duration-300 ease-in-out scale-100 hover:scale-105 ${getColorClass(count)} animate-fade-in`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {count}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {difficulties.map((item) => (
            <DifficultyCard key={item.label} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}