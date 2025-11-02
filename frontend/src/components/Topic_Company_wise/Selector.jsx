import React, { useState, useRef, useEffect } from 'react';
import { List, X } from 'lucide-react';

export default function Selector({ topics, selectedTopic, onSelect }) {
  const [search, setSearch] = useState("");
  const topicRefs = useRef({});

  const filteredTopics = topics.filter((topic) =>
    topic.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (selectedTopic && topicRefs.current[selectedTopic]) {
      topicRefs.current[selectedTopic].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedTopic]);

  const handleReset = () => {
    onSelect(null);
    setSearch("");
  };

  return (
    <div className="bg-[#0f0f1c] h-[63vw] rounded-xl px-4 w-[270px] text-white shadow-md flex flex-col">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <List className="w-4 h-4 text-gray-400" />
        Topics
      </h2>

      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 pr-8 rounded-md bg-[#1a1b2e] text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 mt-3 overflow-y-auto pr-1 custom-scrollbar-hide">
        <div className="space-y-2 pb-4">
          {filteredTopics.map((topic) => {
            const isSelected = selectedTopic === topic;
            return (
              <div
                key={topic}
                ref={(el) => (topicRefs.current[topic] = el)}
                title={topic}
                onClick={() => onSelect(topic)}
                className={`truncate text-base px-4 py-3 rounded-lg cursor-pointer transition flex items-center ${
                  isSelected
                    ? 'bg-[#1d263b] border-l-4 border-blue-500 text-white font-semibold'
                    : 'text-gray-300 hover:bg-[#1a1b2e] border border-[#2b2b3e]'
                }`}
              >
                {topic}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}