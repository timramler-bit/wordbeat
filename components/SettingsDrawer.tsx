import React from 'react';
import { VOCAB_SETS } from '../constants';
import { WordItem, GameSettings, AppMode } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  setSettings: (key: string, val: any) => void;
  currentPool: WordItem[];
  onToggleItem: (id: string) => void;
  isCustomMode: boolean;
  hasCustomItems: boolean;
  onOpenUpload: () => void;
  onReset: () => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ 
  isOpen, onClose, settings, setSettings, currentPool, onToggleItem, isCustomMode, hasCustomItems,
  onOpenUpload, onReset, mode, setMode
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-slate-900 border-l border-slate-700 
        z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            ⚙️ Settings
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          
          {/* Section: Mode & Actions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Game Controls</h3>
            <div className="bg-slate-800/50 p-3 rounded-xl space-y-3">
               {/* Mode Switcher */}
               <div className="flex bg-slate-900 p-1 rounded-lg">
                  <button 
                    onClick={() => setMode('game')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${mode === 'game' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    GAME
                  </button>
                  <button 
                    onClick={() => setMode('flashcards')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${mode === 'flashcards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    CARDS
                  </button>
               </div>

               {/* Reset Button */}
               <button 
                 onClick={() => { onReset(); onClose(); }}
                 className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-bold rounded-lg flex items-center justify-center gap-2"
               >
                 🔄 Reshuffle Board
               </button>
            </div>
          </div>

          {/* Section: Game Config */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Configuration</h3>
            
            <div className="bg-slate-800/50 p-3 rounded-xl space-y-4">
              <div>
                <div className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                  <span>Speed (BPM)</span>
                  <span className="text-blue-400">{settings.bpm}</span>
                </div>
                <input 
                  type="range" min="40" max="160" step="5" 
                  value={settings.bpm} onChange={(e) => setSettings('bpm', Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                  <span>Grid Size</span>
                  <span className="text-blue-400">{settings.gridSize} Cards</span>
                </div>
                <input 
                  type="range" min="2" max="8" step="1" 
                  value={settings.gridSize} onChange={(e) => setSettings('gridSize', Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                  <span>Rounds</span>
                  <span className="text-blue-400">{settings.totalRounds}</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="1" 
                  value={settings.totalRounds} onChange={(e) => setSettings('totalRounds', Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Content */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Vocabulary Source</h3>
             
             <div className="space-y-3 bg-slate-800/50 p-3 rounded-xl">
               <div>
                  <label className="text-xs text-slate-400 mb-1 block">Category</label>
                  <select 
                    value={settings.vocabCategory}
                    onChange={(e) => setSettings('vocabCategory', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white text-sm rounded-lg p-2.5 focus:ring-blue-500"
                  >
                    {Object.keys(VOCAB_SETS).map(key => (
                      <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                    ))}
                    {(isCustomMode || hasCustomItems) && <option value="custom">Custom Set</option>}
                  </select>
               </div>
               
               <button 
                 onClick={() => { onClose(); onOpenUpload(); }}
                 className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/50 text-sm font-bold rounded-lg"
               >
                 + Create Custom Set
               </button>
             </div>
          </div>
          
           {/* Section: Display */}
           <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Display</h3>
            <div className="bg-slate-800/50 p-3 rounded-xl space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-slate-300">Show Emojis</span>
                <input 
                  type="checkbox" 
                  checked={settings.showEmojis} 
                  onChange={(e) => setSettings('showEmojis', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-slate-300">Hide Text</span>
                <input 
                  type="checkbox" 
                  checked={settings.hideText} 
                  onChange={(e) => setSettings('hideText', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Section: Subset Selection */}
          <div className="space-y-4 pb-12">
            <div className="flex justify-between items-end">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Active Vocabulary</h3>
                <span className="text-[10px] text-slate-500">{currentPool.filter(i => i.enabled !== false).length} Active</span>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-2 max-h-64 overflow-y-auto custom-scrollbar">
                {currentPool.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No items available.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-1">
                        {currentPool.map((item) => {
                            const isEnabled = item.enabled !== false;
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => onToggleItem(item.id)}
                                    className={`
                                        flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                                        ${isEnabled ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-transparent hover:bg-slate-800 opacity-50'}
                                    `}
                                >
                                    <div className={`
                                        w-5 h-5 rounded-full border flex items-center justify-center text-[10px]
                                        ${isEnabled ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-500'}
                                    `}>
                                        {isEnabled && '✓'}
                                    </div>
                                    <span className="text-xl w-8 text-center">{item.emoji || '📷'}</span>
                                    <span className={`text-sm font-medium ${isEnabled ? 'text-white' : 'text-slate-400'}`}>
                                        {item.text}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};