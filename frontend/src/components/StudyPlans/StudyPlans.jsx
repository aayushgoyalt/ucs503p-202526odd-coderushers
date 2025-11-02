import React, { useState, useEffect, useCallback } from 'react';
import Plan from '../Plan/Plan';
import API from '../../api/axios';
import dayjs from 'dayjs';

export default function StudyPlans() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudyPlans = useCallback(async () => {
    try {
      const res = await API.get('/studyplan/');
      const data = res.data.statusCode.topics;
      setTopics(data);
      sessionStorage.setItem("studyPlanData", JSON.stringify(data));
    } catch (error) {
      console.error('Failed to fetch study plans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = sessionStorage.getItem("studyPlanData");

    if (cached) {
      try {
        setTopics(JSON.parse(cached));
        setLoading(false);
        fetchStudyPlans();
      } catch (err) {
        console.error("Error parsing cached study plans:", err);
        sessionStorage.removeItem("studyPlanData");
        fetchStudyPlans(); 
      }
    } else {
      fetchStudyPlans(); 
    }
  }, [fetchStudyPlans]);

  return (
    <div className="px-6 bg-[#0f0f1c] pb-25 pt-10">
      <div className="text-5xl text-white font-bold mb-16">Study Plan</div>

      {loading ? (
        <div className="text-white">Loading...</div>
      ) : topics.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-white text-lg bg-[#1a1b2e] p-10 rounded-xl shadow-md">
          <p className="text-2xl mb-2">📚 Nothing here yet!</p>
          <p className="text-sm text-gray-400">Study plans will appear here once available.</p>
        </div>
      ) : (
        topics.map((topic, index) => (
          <div key={topic.id || index} className="mb-5">
            <Plan title={topic.title} questions={topic.questions} />
          </div>
        ))
      )}
    </div>
  );
}