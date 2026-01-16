import React from 'react';

interface ControlPanelProps {
  onTogglePlay: () => void;
  isPlaying: boolean;
  onOpenSettings: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onTogglePlay, isPlaying, onOpenSettings
}) => {
  return (
    <div className="flex items-center justify-between w-full h-10">
      {/* Play Button */}
      <button 
        onClick={onTogglePlay}
        className={`
           w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg border border-white/10 transition-all active:scale-95 shrink-0
           ${isPlaying ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-blue-500'}
        `}
      >
        {isPlaying ? '⏹' : '▶'}
      </button>

      {/* Title */}
      <div className="flex flex-col items-center justify-center flex-1 mx-2 overflow-hidden">
        <h1 className="font-poppins font-medium text-blue-500 text-base md:text-lg tracking-tight leading-none whitespace-nowrap truncate">
          Tim the Teacher
        </h1>
      </div>

      {/* Settings */}
      <button 
        onClick={onOpenSettings}
        className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center justify-center transition-colors shrink-0"
      >
        ⚙️
      </button>
    </div>
  );
};