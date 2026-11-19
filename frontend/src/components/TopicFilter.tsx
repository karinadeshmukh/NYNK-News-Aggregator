import React from 'react';

interface TopicFilterProps {
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
  availableTopics: string[];
}

export const TopicFilter: React.FC<TopicFilterProps> = ({
  selectedTopic,
  onSelectTopic,
  availableTopics
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
      {availableTopics.map((topic) => {
        const isSelected = selectedTopic.toLowerCase() === topic.toLowerCase();
        return (
          <button
            key={topic}
            onClick={() => onSelectTopic(topic)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              isSelected
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {topic}
          </button>
        );
      })}
    </div>
  );
};
