import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { WordCard } from './components/WordCard';
import { CustomContentModal } from './components/CustomContentModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { FlashcardViewer } from './components/FlashcardViewer';
import { AudioEngine } from './services/audioEngine';
import { VOCAB_SETS } from './constants';
import { WordItem, SchedulerState, AppMode, GameSettings } from './types';

// Initialize Audio Engine outside component to persist across re-renders
const audioEngine = new AudioEngine();

export default function App() {
  // Game Settings State
  const [settings, setSettings] = useState<GameSettings>({
    bpm: 90,
    gridSize: 8,
    vocabCategory: 'animals',
    showEmojis: true,
    hideText: false,
    totalRounds: 5
  });

  // App UI State
  const [mode, setMode] = useState<AppMode>('game');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // Game Logic State
  const [isPlaying, setIsPlaying] = useState(false);
  const [schedulerState, setSchedulerState] = useState<SchedulerState>({
    currentRound: 1,
    currentLoop: 1,
    beatIndex: -1,
    isIntermission: false,
    isLoopTransition: false
  });

  // Data
  const [currentPool, setCurrentPool] = useState<WordItem[]>([]);
  const [gridItems, setGridItems] = useState<WordItem[]>([]);
  const [customItems, setCustomItems] = useState<WordItem[]>([]);

  // Ref to hold the fixed order of words for the current session AND preview
  // This ensures words don't change order/selection when hitting Play
  const stablePoolRef = useRef<WordItem[]>([]);

  // --- Initialization & Pool Management ---

  useEffect(() => {
    // Logic: If category is custom, try to load custom items. 
    // If not custom items exist, revert to animals.
    // If category is preset, load preset.
    
    if (settings.vocabCategory === 'custom') {
        if (customItems.length > 0) {
            setIsCustomMode(true);
            setCurrentPool(customItems);
        } else {
            // Safety fallback
            setSettings(s => ({ ...s, vocabCategory: 'animals' }));
        }
    } else {
        setIsCustomMode(false);
        const items = VOCAB_SETS[settings.vocabCategory] || VOCAB_SETS['animals'];
        const initializedItems = items.map(i => ({ ...i, enabled: true }));
        setCurrentPool(initializedItems);
    }
  }, [settings.vocabCategory, customItems]);

  // When currentPool changes (e.g. category switch or toggle enable), update stable shuffle
  useEffect(() => {
    const enabled = currentPool.filter(i => i.enabled !== false);
    if (enabled.length > 0) {
        stablePoolRef.current = [...enabled].sort(() => 0.5 - Math.random());
    } else {
        stablePoolRef.current = [];
    }
  }, [currentPool]);

  // Update Audio Engine
  useEffect(() => {
    audioEngine.setBpm(settings.bpm);
    audioEngine.setItemsInGrid(gridItems.length || settings.gridSize);
    audioEngine.setTotalRounds(settings.totalRounds);
  }, [settings.bpm, settings.gridSize, settings.totalRounds, gridItems.length]);

  // --- Grid Generation ---

  const generateGrid = useCallback((round: number) => {
    // 1. Identify Source Material from Stable Pool
    let sourceList: WordItem[] = stablePoolRef.current;
    
    if (sourceList.length === 0) {
        setGridItems([]);
        return;
    }

    // 2. Determine Variety Count (How many unique words to show)
    // Game Mode: Progressive (2, 4, 6...). 
    // Logic: If Playing, use progressive difficulty. If NOT playing (preview), use max variety allowed by grid size.
    let varietyCap = settings.gridSize;
    if (isPlaying) {
        varietyCap = 2 + (round - 1) * 2;
    }
    
    // We cannot show more unique words than we have slots, or than exist in the pool
    const uniqueCount = Math.min(sourceList.length, varietyCap, settings.gridSize);
    
    // 4. Select the unique words for this round
    // ALWAYS take from the top of stablePoolRef to maintain consistency
    const uniqueWords = sourceList.slice(0, uniqueCount);
    
    // 5. Fill the Grid to exact settings.gridSize
    // We repeat the unique words evenly to fill the grid.
    let filledGrid: WordItem[] = [];
    let i = 0;
    while (filledGrid.length < settings.gridSize) {
        filledGrid.push(uniqueWords[i % uniqueWords.length]);
        i++;
    }
    
    // Shuffle the positions in the grid so patterns aren't static/predictable
    // This shuffle is purely visual placement, not content selection.
    filledGrid = filledGrid.sort(() => 0.5 - Math.random());

    // 6. Assign unique keys (since we duplicated items)
    const finalGrid = filledGrid.map(item => ({
        ...item,
        id: item.id + Math.random() 
    }));

    setGridItems(finalGrid);
    audioEngine.setItemsInGrid(finalGrid.length);
  }, [settings.gridSize, isPlaying]); 

  // Initial load or config change refresh
  useEffect(() => {
    // When playing starts, we want to start with Round 1 difficulty (2 items).
    // When previewing (!isPlaying), we want to show maximum variety (capped by grid size).
    // We pass '1' as default round. If playing, generateGrid uses it to calc variety. 
    // If not playing, generateGrid ignores it and uses settings.gridSize.
    generateGrid(1);
  }, [currentPool, settings.gridSize, isPlaying, generateGrid]);

  // --- Audio Callbacks ---
  
  useEffect(() => {
    audioEngine.setCallbacks(
      (state) => setSchedulerState(state),
      (round) => generateGrid(round),
      () => {
        setIsPlaying(false);
        setSchedulerState(prev => ({ ...prev, beatIndex: -1 }));
      }
    );
  }, [generateGrid]);

  // --- Event Handlers ---

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      setSchedulerState({
        currentRound: 1,
        currentLoop: 1,
        beatIndex: -1,
        isIntermission: false,
        isLoopTransition: false
      });
      setIsPlaying(true);
      setMode('game');
      audioEngine.start();
    }
  };

  const handleReset = () => {
    const wasPlaying = isPlaying;
    audioEngine.stop();
    setIsPlaying(false);

    // Reshuffle the stable pool to get a fresh game order
    const enabled = currentPool.filter(i => i.enabled !== false);
    if (enabled.length > 0) {
        stablePoolRef.current = [...enabled].sort(() => 0.5 - Math.random());
    }

    setSchedulerState({
        currentRound: 1,
        currentLoop: 1,
        beatIndex: -1,
        isIntermission: false,
        isLoopTransition: false
    });

    if (!wasPlaying) {
        setTimeout(() => generateGrid(1), 0);
    }
  };

  const handleSettingsChange = (key: string, val: any) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleTogglePoolItem = (id: string) => {
    setCurrentPool(prev => prev.map(item => 
        item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const handleCustomUploadSave = (items: WordItem[]) => {
    // Stop game if playing
    audioEngine.stop();
    setIsPlaying(false);
    
    setCustomItems(items);
    setIsCustomMode(true);
    setCurrentPool(items);
    
    // Reset game state completely
    setSchedulerState({
        currentRound: 1,
        currentLoop: 1,
        beatIndex: -1,
        isIntermission: false,
        isLoopTransition: false
    });

    setSettings(s => ({ 
        ...s, 
        vocabCategory: 'custom',
        // Update default grid size to match items if small, but allow up to 8
        gridSize: Math.max(2, Math.min(8, items.length))
    }));

    // Trigger grid regeneration immediately for the preview
    // We need to use a timeout to let the state updates above propagate to 'currentPool' and 'stablePoolRef' via effects
    setTimeout(() => {
        // Need to manually re-seed stablePoolRef here because the effect that watches currentPool
        // might not have run yet or we want to guarantee a fresh shuffle for the new set.
        stablePoolRef.current = [...items].sort(() => 0.5 - Math.random());
        generateGrid(1);
    }, 50);
  };

  // Background color logic: 
  // Loop 1 (User Turn) -> Indigo (Deep Blue)
  // Loop 2 (User Turn) -> Fuchsia (Deep Purple/Pink)
  // Intermission -> Slate (Dark)
  let bgColorClass = 'bg-slate-900 duration-1000';
  if (isPlaying && !schedulerState.isIntermission) {
      bgColorClass = schedulerState.currentLoop === 1 
        ? 'bg-indigo-950 duration-700' 
        : 'bg-fuchsia-950 duration-700';
  }

  // Responsive Grid Class Logic
  // Mobile (>6 items): grid-cols-2 (2 columns, 4 rows)
  // Default (<=4): grid-cols-2.
  // 5-6: grid-cols-2 md:grid-cols-3.
  const getGridColsClass = () => {
    const n = gridItems.length;
    if (n <= 4) return 'grid-cols-2';
    if (n <= 6) return 'grid-cols-2 md:grid-cols-3';
    // For 7-8 items:
    // Mobile: grid-cols-2 (2 columns = 4 rows)
    // Desktop: grid-cols-4 (4 columns = 2 rows)
    return 'grid-cols-2 md:grid-cols-4';
  };

  return (
    <div className={`flex flex-col h-screen text-slate-100 overflow-hidden font-inter transition-colors ease-in-out ${bgColorClass}`}>
      
      {/* Top Bar */}
      <header className={`flex-none backdrop-blur-md border-b border-slate-800 z-30 shadow-xl p-2 px-4 transition-colors duration-700 ${isPlaying && !schedulerState.isIntermission ? 'bg-black/20' : 'bg-slate-900/90'}`}>
        <div className="max-w-4xl mx-auto">
          <ControlPanel 
            isPlaying={isPlaying} 
            onTogglePlay={handleTogglePlay}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-2 flex flex-col items-center justify-center">
        
        {/* Game Mode */}
        {mode === 'game' && (
             <div className="w-full max-w-4xl flex flex-col items-center">
            
             {/* Status Indicator */}
             <div className={`
             font-mono text-sm tracking-[0.2em] font-bold transition-opacity duration-300 mb-2
             ${isPlaying ? 'opacity-100' : 'opacity-0'}
             ${schedulerState.isIntermission ? 'text-yellow-400' : 'text-blue-400'}
             `}>
             {schedulerState.isIntermission ? "GET READY..." : `ROUND ${schedulerState.currentRound}/${settings.totalRounds}`}
             </div>
 
             {/* Dynamic Grid */}
             <div className={`
             grid gap-2 w-full transition-all duration-300
             ${getGridColsClass()}
             `}>
             {gridItems.map((item, index) => {
                 const isActive = !schedulerState.isIntermission && 
                                 !schedulerState.isLoopTransition && 
                                 schedulerState.beatIndex === index;
                 
                 return (
                 <WordCard 
                     key={`${item.id}-${index}`}
                     item={item}
                     isActive={isActive}
                     showEmoji={settings.showEmojis}
                     hideText={settings.hideText}
                 />
                 );
             })}
             </div>
         </div>
        )}

        {/* Flashcard Mode */}
        {mode === 'flashcards' && (
            <FlashcardViewer 
                items={currentPool.filter(i => i.enabled !== false)} 
                onClose={() => setMode('game')}
                showEmoji={settings.showEmojis}
                hideText={settings.hideText}
            />
        )}
       
      </main>

      {/* Modals & Drawers */}
      <SettingsDrawer 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={handleSettingsChange}
        currentPool={currentPool}
        onToggleItem={handleTogglePoolItem}
        isCustomMode={isCustomMode}
        hasCustomItems={customItems.length > 0}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onReset={handleReset}
        mode={mode}
        setMode={setMode}
      />

      <CustomContentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onSave={handleCustomUploadSave}
      />
    </div>
  );
}