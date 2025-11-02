import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function QuestionCard({ Qid, title, slug, difficulty, solved, topics = [], companyTags = [] }) {
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  const difficultyClass =
    difficulty === 'Easy'
      ? 'bg-green-800/30 text-green-300'
      : difficulty === 'Medium'
      ? 'bg-yellow-700/30 text-yellow-300'
      : 'bg-red-800/30 text-red-400';

  const displayedTopics = showAllTopics ? topics : topics.slice(0, 7);
  const displayedCompanies = showAllCompanies ? companyTags : companyTags.slice(0, 8);

  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  return (
    <a
      href={`https://leetcode.com/problems/${slug}/description/`}
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 rounded-2xl transition duration-200 bg-[#1a1b2e] flex flex-col gap-3 shadow-md border border-white/10 hover:shadow-xl hover:bg-[#1c1d2f]"
    >
      {/* Top row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {solved ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <div className="h-5 w-5 rounded-full border border-gray-500" />
          )}
          <span className="text-base font-medium text-white">{Qid}. </span>
          <span className="text-base font-medium text-white truncate max-w-[200px] md:max-w-[400px]">
            {title}
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${difficultyClass}`}>
          {difficulty}
        </div>
      </div>

      {/* Topics */}
      {topics.length > 0 && (
        <div className="flex flex-col gap-2">
          {(showAllTopics ? chunkArray(topics, 10) : [displayedTopics]).map((row, rowIdx, arr) => (
            <div key={`topic-row-${rowIdx}`} className="flex flex-wrap gap-2 items-center">
              {row.map((topic, idx) => (
                <span
                  key={`topic-${rowIdx}-${idx}`}
                  className="bg-[#2b2c3c] text-gray-300 text-xs px-2 py-1 rounded-full"
                >
                  {topic}
                </span>
              ))}
              {topics.length > 7 && rowIdx === arr.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAllTopics(!showAllTopics);
                  }}
                  className="text-gray-300 text-xs underline"
                >
                  {showAllTopics ? 'Show less' : `+${topics.length - 7} more`}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Company Tags */}
      {companyTags.length > 0 && (
        <div className="flex flex-col gap-2">
          {(showAllCompanies ? chunkArray(companyTags, 10) : [displayedCompanies]).map((row, rowIdx, arr) => (
            <div key={`company-row-${rowIdx}`} className="flex flex-wrap gap-2 items-center">
              {row.map((company, idx) => (
                <span
                  key={`company-${rowIdx}-${idx}`}
                  className="bg-[#3c2a4d] text-purple-300 text-xs px-2 py-1 rounded-full"
                >
                  {company}
                </span>
              ))}
              {companyTags.length > 8 && rowIdx === arr.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAllCompanies(!showAllCompanies);
                  }}
                  className="text-gray-300 text-xs underline"
                >
                  {showAllCompanies ? 'Show less' : `+${companyTags.length - 8} more`}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </a>
  );
}