import { useState, useEffect } from "react";
import API from "../api/axios";
import { toast, Toaster } from "react-hot-toast";
import { 
  Users, BarChart3, Activity, Settings, 
  Search, Trash2, RefreshCw,
  TrendingUp, Award, Calendar, CheckCircle, Shield
} from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("analytics");
  
  return (
    <div className="min-h-screen bg-[#0f0f1c] text-white">
      <Toaster position="top-right" />
      
      <div className="bg-[#1a1b2e] border-b border-white/10 px-6 py-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">Manage users, view analytics, and control platform</p>
      </div>

      <div className="bg-[#1a1b2e] border-b border-white/10 px-6">
        <div className="flex gap-1">
          <TabButton
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
            icon={<BarChart3 className="h-4 w-4" />}
            label="Analytics"
          />
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            icon={<Users className="h-4 w-4" />}
            label="User Management"
          />
          <TabButton
            active={activeTab === "activity"}
            onClick={() => setActiveTab("activity")}
            icon={<Activity className="h-4 w-4" />}
            label="Activity"
          />
          <TabButton
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
          />
        </div>
      </div>

      <div className="p-6">
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "activity" && <ActivityTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
        active
          ? "text-orange-500 border-orange-500"
          : "text-gray-400 border-transparent hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}


function AnalyticsTab() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await API.get("/admin/analytics");
      setAnalytics(data.statusCode);
    } catch (err) {
      toast.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-12 text-gray-400">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={analytics.users.total}
          subtitle={`${analytics.users.newThisMonth} new this month`}
          icon={<Users className="h-6 w-6 text-slate-400" />}
        />
        <StatCard
          title="Active Users"
          value={analytics.users.recentlyActive}
          subtitle="Last 7 days"
          icon={<Activity className="h-6 w-6 text-slate-400" />}
        />
        <StatCard
          title="Total Questions"
          value={analytics.content.questions}
          subtitle={`${analytics.content.aptitudeQuestions} aptitude`}
          icon={<CheckCircle className="h-6 w-6 text-slate-400" />}
        />
        <StatCard
          title="OA Completed"
          value={analytics.oa.completed}
          subtitle={`${analytics.oa.ongoing} ongoing`}
          icon={<Award className="h-6 w-6 text-slate-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1b2e] rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-slate-400" />
            User Registration Trend (30 Days)
          </h3>
          <div className="space-y-2">
            {analytics.registrationTrend.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-24">{item._id}</span>
                <div className="flex-1 bg-[#23253b] rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-slate-500 h-full flex items-center justify-end pr-2"
                    style={{ width: `${(item.count / Math.max(...analytics.registrationTrend.map(i => i.count))) * 100}%` }}
                  >
                    <span className="text-xs font-semibold">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1b2e] rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-slate-400" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {analytics.topPerformers.slice(0, 8).map((user, idx) => (
              <div key={user._id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  idx === 0 ? "bg-orange-500 text-white" :
                  idx === 1 ? "bg-[#2b2b3e] text-orange-400 border border-orange-500/30" :
                  idx === 2 ? "bg-[#2b2b3e] text-orange-400 border border-orange-500/20" :
                  "bg-[#23253b] text-gray-400"
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{user.total}</p>
                  <p className="text-xs text-gray-400">
                    {user.easy}E {user.medium}M {user.hard}H
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1b2e] rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Admin Users</p>
              <p className="text-2xl font-bold">{analytics.users.admins}</p>
            </div>
            <Shield className="h-8 w-8 text-slate-400" />
          </div>
        </div>
        <div className="bg-[#1a1b2e] rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Contests</p>
              <p className="text-2xl font-bold">{analytics.content.activeContests}</p>
            </div>
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
        </div>
        <div className="bg-[#1a1b2e] rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total OAs</p>
              <p className="text-2xl font-bold">{analytics.oa.total}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-[#1a1b2e] rounded-lg p-6 border border-white/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}


function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/users", {
        params: { page, search, role: roleFilter, limit: 15 }
      });
      setUsers(data.statusCode.users);
      setPagination(data.statusCode.pagination);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success("Role updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const handleResetProgress = async (userId) => {
    if (!confirm("Are you sure you want to reset this user's progress?")) return;
    
    try {
      await API.post(`/admin/users/${userId}/reset`);
      toast.success("Progress reset successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to reset progress");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#1a1b2e] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="bg-[#1a1b2e] border border-white/10 rounded-lg px-4 py-2 text-white"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-[#1a1b2e] rounded-lg border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#23253b]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Username</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Progress</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-[#23253b] transition">
                    <td className="px-4 py-3">
                      <p className="font-medium">{user.fullName}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">@{user.username}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-xs">
                        <span className="text-slate-300">{user.easy}E</span>
                        <span className="text-slate-300">{user.medium}M</span>
                        <span className="text-slate-300">{user.hard}H</span>
                        <span className="text-gray-500">({user.total})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="bg-[#2b2b3e] border border-white/10 rounded px-2 py-1 text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleResetProgress(user._id)}
                          className="p-2 hover:bg-[#2b2b3e] rounded transition"
                          title="Reset Progress"
                        >
                          <RefreshCw className="h-4 w-4 text-slate-400 hover:text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 hover:bg-[#2b2b3e] rounded transition"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4 text-slate-400 hover:text-orange-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-[#1a1b2e] border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#23253b] transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-[#23253b] rounded-lg">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 bg-[#1a1b2e] border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#23253b] transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function ActivityTab() {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchActivity();
  }, [days]);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/analytics/activity", {
        params: { days }
      });
      setActivity(data.statusCode);
    } catch (err) {
      toast.error("Failed to fetch activity data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading activity data...</div>;
  }

  if (!activity) {
    return <div className="text-center py-12 text-gray-400">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[7, 14, 30, 60].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              days === d
                ? "bg-orange-500 text-white"
                : "bg-[#1a1b2e] text-gray-400 hover:text-white"
            }`}
          >
            {d} Days
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1b2e] rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Daily Active Users</h3>
          <div className="space-y-2">
            {activity.dailyActivity.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-24">{item._id}</span>
                <div className="flex-1 bg-[#23253b] rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-slate-500 h-full flex items-center justify-end pr-2"
                    style={{ width: `${(item.activeUsers / Math.max(...activity.dailyActivity.map(i => i.activeUsers))) * 100}%` }}
                  >
                    <span className="text-xs font-semibold">{item.activeUsers}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1b2e] rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Problems Solved Daily</h3>
          <div className="space-y-2">
            {activity.solvingTrend.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-24">{item._id}</span>
                <div className="flex-1 bg-[#23253b] rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-slate-600 h-full flex items-center justify-end pr-2"
                    style={{ width: `${(item.problemsSolved / Math.max(...activity.solvingTrend.map(i => i.problemsSolved))) * 100}%` }}
                  >
                    <span className="text-xs font-semibold">{item.problemsSolved}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [awaitedContests, setAwaitedContests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAwaitedContests();
  }, []);

  const fetchAwaitedContests = async () => {
    try {
      const { data } = await API.get("/contest/active");
      setAwaitedContests(data.statusCode.awaitedContests || []);
    } catch (err) {
      toast.error("Failed to fetch awaited contests");
    }
  };

  const toggleContest = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const archiveSelectedContests = async () => {
    if (selectedIds.length === 0) return toast.error("No contests selected.");
    if (!confirm(`Archive ${selectedIds.length} contest(s)?`)) return;

    setLoading(true);
    try {
      await API.post("/contest/archive", { contestIds: selectedIds });
      toast.success("Archived successfully!");
      setSelectedIds([]);
      fetchAwaitedContests();
    } catch (err) {
      toast.error("Failed to archive contests.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1b2e] rounded-lg p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-4">Contest Management</h2>
        <p className="text-gray-400 text-sm mb-4">
          Archive completed contests to keep the active list clean
        </p>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
          {awaitedContests.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No awaited contests available</p>
          ) : (
            awaitedContests.map((contest) => (
              <label
                key={contest._id}
                className="flex items-center gap-3 p-3 bg-[#23253b] rounded-lg cursor-pointer hover:bg-[#2b2d45] transition"
              >
                <input
                  type="checkbox"
                  className="accent-orange-500 w-4 h-4"
                  checked={selectedIds.includes(contest._id)}
                  onChange={() => toggleContest(contest._id)}
                />
                <div className="flex-1">
                  <p className="font-medium">{contest.name}</p>
                  <p className="text-sm text-gray-400">{contest.platform}</p>
                </div>
                <div className="text-right text-sm text-gray-400">
                  {new Date(contest.startTime).toLocaleDateString()}
                </div>
              </label>
            ))
          )}
        </div>

        <button
          onClick={archiveSelectedContests}
          disabled={selectedIds.length === 0 || loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {loading ? "Archiving..." : `Archive Selected (${selectedIds.length})`}
        </button>
      </div>

      <div className="bg-[#1a1b2e] rounded-lg p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-4">System Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Platform Version</span>
            <span className="font-medium">v1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Sync</span>
            <span className="font-medium">{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Database Status</span>
            <span className="text-slate-300 font-medium">● Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
