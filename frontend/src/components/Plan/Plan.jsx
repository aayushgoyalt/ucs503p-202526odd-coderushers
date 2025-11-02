import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import QuestionCard from './QuesCard';

const ProgressBar = ({ percent }) => (
  <div className="mt-2 w-full bg-gray-900 rounded-full h-2">
    <div
      className="bg-gradient-to-r from-cyan-600 to-blue-600 h-2 rounded-full"
      style={{ width: `${percent}%` }}
    />
  </div>
);

const Plan = ({ title, questions }) => {
  const [open, setOpen] = useState(false);

  const completed = questions.filter((q) => q.solved).length;
  const total = questions.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mb-6 w-full max-w-6xl mx-auto bg-[#1a1b2e] border rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div
        className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4 px-6 py-5 text-white cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="h-5 w-5 shrink-0 text-white transition-transform rotate-180" />
          ) : (
            <ChevronRight className="h-5 w-5 shrink-0 text-white transition-transform" />
          )}
          <span className="text-xl font-semibold">{title}</span>
        </div>

        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 w-full xs:w-auto">
          <div className="text-sm text-gray-400 text-left xs:text-right">
            {completed} / {total} completed
          </div>
          <div className="w-full xs:w-32">
            <ProgressBar percent={percent} />
          </div>
        </div>
      </div>

      {/* Collapsible Question List */}
      <div
        className={`px-6 transition-all duration-[400ms] ease-in-out ${
          open ? 'opacity-100 max-h-[1000px] mt-4' : 'opacity-0 max-h-0 overflow-hidden'
        }`}
      >
        <div className="space-y-3 pb-6">
          {questions.map((q) => (
            <QuestionCard
              key={q.Qid}
              Qid={q.Qid}
              title={q.title}
              slug={q.slug}
              difficulty={q.difficulty}
              solved={q.solved}
              topics={q.topics || []}
              companyTags={q.companyTags || []}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Plan;