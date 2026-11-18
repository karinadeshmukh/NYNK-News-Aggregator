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
    <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
      {availableTopics.map((topic) => {
        const isSelected = selectedTopic.toLowerCase() === topic.toLowerCase();
        return (
          <button
            key={topic}
            onClick={() => onSelectTopic(topic)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
              isSelected
                ? 'bg-slate-900 text-white shadow-retro-sm'
                : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-cream-200 border border-slate-300'
            }`}
          >
            {topic}
          </button>
        );
      })}
    </div>
  );
};
