import React, { useState } from 'react';
import { WordItem } from '../types';
import { WordCard } from './WordCard';

interface FlashcardViewerProps {
  items: WordItem[];
  onClose: () => void;
  showEmoji: boolean;
  hideText: boolean;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ items, onClose, showEmoji, hideText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextCard = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const prevCard = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  // If no items, show message
  if (items.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>No words available to review.</p>
              <button onClick={onClose} className="mt-4 text-blue-400">Go Back</button>
          </div>
      );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto relative p-4">
      
      {/* Progress */}
      <div className="absolute top-0 left-0 right-0 p-4 text-center text-slate-500 font-mono text-xs tracking-widest">
        CARD {currentIndex + 1} / {items.length}
      </div>

      {/* Main Card */}
      <div className="w-full aspect-[3/4] max-h-[60vh] mb-8">
        <WordCard 
            item={currentItem} 
            isActive={false} 
            showEmoji={showEmoji} 
            hideText={hideText}
            isFlashcard={true}
            onClick={nextCard}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button 
            onClick={prevCard}
            className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-2xl transition-transform active:scale-95"
        >
            ←
        </button>
        
        <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm tracking-wider"
        >
            EXIT REVIEW
        </button>

        <button 
            onClick={nextCard}
            className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-2xl shadow-lg shadow-blue-900/30 transition-transform active:scale-95"
        >
            →
        </button>
      </div>

    </div>
  );
};