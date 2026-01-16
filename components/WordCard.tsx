import React from 'react';
import { WordItem } from '../types';
import { COLOR_MAP } from '../constants';

interface WordCardProps {
  item: WordItem;
  isActive: boolean;
  showEmoji: boolean;
  hideText: boolean;
  onClick?: () => void;
  isFlashcard?: boolean;
}

export const WordCard: React.FC<WordCardProps> = ({ item, isActive, showEmoji, hideText, onClick, isFlashcard = false }) => {
  // Determine text color based on word content (if it matches a known color)
  const lowerText = item.text.toLowerCase();
  const textColorClass = COLOR_MAP[lowerText] || 'text-white';
  
  // Dynamic classes for active state
  const activeClasses = isActive 
    ? 'border-blue-400 bg-slate-800 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.5)] z-10' 
    : 'border-slate-700 bg-slate-800/80';

  const baseClasses = isFlashcard
    ? 'w-full h-full max-w-sm aspect-[3/4] rounded-3xl border-4 bg-slate-800 border-slate-600 shadow-2xl'
    : `relative aspect-square rounded-2xl border-2 transition-all duration-100 ease-out overflow-hidden select-none p-1 ${activeClasses}`;

  // Responsive font sizing
  const textSize = isFlashcard
    ? 'text-4xl md:text-6xl'
    : (item.text.length > 10 ? 'text-lg md:text-2xl' : (item.text.length > 6 ? 'text-2xl md:text-4xl' : 'text-3xl md:text-5xl'));

  return (
    <div className={`${baseClasses} flex flex-col items-center justify-center cursor-pointer`} onClick={onClick}>
      {/* CASE 1: Custom Image Uploaded */}
      {item.imageSrc ? (
        <>
          <img 
            src={item.imageSrc} 
            alt={item.text} 
            className={`w-full h-full object-cover absolute inset-0 opacity-60 ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-200`}
          />
          {!hideText && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-8 flex items-end justify-center">
              <div className={`font-bold text-white text-center drop-shadow-md ${textSize}`}>
                {item.text}
              </div>
            </div>
          )}
        </>
      ) : (
        // CASE 2: Emoji or Text Only
        <>
          {showEmoji && item.emoji ? (
            <>
              <div className={`${isFlashcard ? 'text-9xl' : 'text-6xl md:text-8xl'} transition-transform duration-100 ${isActive ? 'scale-125' : 'scale-100'}`}>
                {item.emoji}
              </div>
              {!hideText && (
                <div className={`absolute bottom-4 font-bold text-slate-400 ${isFlashcard ? 'text-3xl' : 'text-sm md:text-lg'} uppercase tracking-wider`}>
                  {item.text}
                </div>
              )}
            </>
          ) : (
            <div className={`font-black ${textColorClass} text-center leading-none ${textSize} ${hideText ? 'opacity-0' : 'opacity-100'}`}>
              {item.text}
            </div>
          )}
        </>
      )}
    </div>
  );
};