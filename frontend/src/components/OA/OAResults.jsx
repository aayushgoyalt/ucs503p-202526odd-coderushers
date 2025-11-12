import React from "react";
import { CheckCircle, XCircle, Award, Clock } from "lucide-react";

export default function OAResults({ activeOA }) {
  // DSA Stats Only (backend already returns these)
  const dsaScore = activeOA.stats?.dsaCompleted || 0;
  const dsaTotal = activeOA.stats?.dsaTotal || activeOA.dsaQuestions?.length || 4;
  const dsaPercentage = dsaTotal > 0 ? Math.round((dsaScore / dsaTotal) * 100) : 0;

  // Overall = only DSA now
  const overallScore = dsaScore;
  const overallTotal = dsaTotal;
  const overallPercentage = dsaPercentage;

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", color: "text-green-400", bg: "bg-green-900/30" };
    if (percentage >= 80) return { grade: "A", color: "text-green-400", bg: "bg-green-900/30" };
    if (percentage >= 70) return { grade: "B", color: "text-blue-400", bg: "bg-blue-900/30" };
    if (percentage >= 60) return { grade: "C", color: "text-yellow-400", bg: "bg-yellow-900/30" };
    return { grade: "D", color: "text-red-400", bg: "bg-red-900/30" };
  };

  const overallGrade = getGrade(overallPercentage);

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-gradient-to-br from-[#181825] to-[#1a1b2e] rounded-2xl p-6 border border-[#2b2b3e] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Award
              className={`h-8 w-8 ${
                activeOA.status === "completed" ? "text-orange-400" : "text-red-400"
              }`}
            />
            <div>
              <h2 className="text-2xl font-bold text-white">
                {activeOA.status === "completed" ? "OA Completed!" : "OA Aborted"}
              </h2>
              <p className="text-sm text-gray-400">
                {activeOA.status === "completed"
                  ? "Here's your performance summary"
                  : "OA was ended before completion"}
              </p>
            </div>
          </div>

          {activeOA.status === "completed" && (
            <div
              className={`px-6 py-3 rounded-xl ${overallGrade.bg} border border-${overallGrade.color.replace(
                "text-",
                ""
              )}`}
            >
              <div className={`text-4xl font-bold ${overallGrade.color}`}>
                {overallGrade.grade}
              </div>
            </div>
          )}
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{overallPercentage}%</div>
            <div className="text-sm text-gray-400 mt-1">Overall Score</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{overallScore}</div>
            <div className="text-sm text-gray-400 mt-1">Questions Solved</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">{overallTotal}</div>
            <div className="text-sm text-gray-400 mt-1">Total Questions</div>
          </div>
        </div>
      </div>

      {/* DSA Score Only */}
      <div className="bg-[#181825] rounded-xl p-5 border border-[#2b2b3e]">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">DSA Section</h3>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-3xl font-bold text-emerald-400">{dsaPercentage}%</div>
            <div className="text-sm text-gray-400">
              {dsaScore} / {dsaTotal} completed
            </div>
          </div>

          <div className="relative w-20 h-20">
            <svg className="transform -rotate-90 w-20 h-20">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#2b2b3e"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#10b981"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - dsaPercentage / 100)}`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* DSA Questions Review */}
      <div className="bg-[#181825] rounded-xl p-5 border border-[#2b2b3e]">
        <h3 className="text-lg font-semibold text-white mb-4">💻 DSA Questions Review</h3>
        <div className="space-y-3">
          {activeOA.dsaQuestions.map((q, idx) => {
            return (
              <div
                key={q.id}
                className="bg-[#1b1b29] rounded-lg p-4 border border-[#2b2b3e] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {q.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-500" />
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">Q{idx + 1}</span>
                    </div>
                    <p className="text-white font-medium">{q.title}</p>
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    q.status === "completed"
                      ? "bg-green-900/30 text-green-400"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {q.status === "completed" ? "Solved" : "Not Attempted"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}