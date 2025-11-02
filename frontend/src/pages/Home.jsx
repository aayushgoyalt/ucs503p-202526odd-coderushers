import { useEffect, useState } from "react";
import authService from "../services/Auth";
import Loader from "../components/Loader";
import Dashboard from "../components/Dashboard/Dashboard";
import StudyPlans from "../components/StudyPlans/StudyPlans";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    authService.getCurrentUser()
      .then((res) => {
        if (isMounted) setUser(res);
      })
      .catch((err) => {
        console.error("❌ Auth error:", err?.response?.data?.message || err.message || err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false };
  }, []);

  if (loading) return (
    <>
      <Loader />
    </>
  );

  if (!user) {
    return (
      <div className="text-white text-center p-6">
        Failed to load user. Please{" "}
        <a href="/login" className="text-blue-400 underline">log in</a> again.
      </div>
    );
  }

  return (
    <>
      <Dashboard />
      <StudyPlans />
    </>
  );
}