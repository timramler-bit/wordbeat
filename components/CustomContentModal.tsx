import React, { useState, useRef } from 'react';
import { WordItem } from '../types';
import { getEmojiForWord } from '../constants';

interface CustomContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: WordItem[]) => void;
}

export const CustomContentModal: React.FC<CustomContentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'words' | 'images'>('words');
  const [items, setItems] = useState<WordItem[]>([]);
  
  // Word Entry State
  const [wordInput, setWordInput] = useState('');
  const [emojiInput, setEmojiInput] = useState('');

  // Image Upload State
  const [imageLabelInput, setImageLabelInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // --- Handlers ---

  const handleWordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWordInput(val);

    // 1. Check if input itself is a single emoji character
    const isEmoji = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+$/.test(val);
    
    if (isEmoji) {
        setEmojiInput(val);
        return;
    }

    // 2. Check dictionary for known word mapping
    const suggestedEmoji = getEmojiForWord(val);
    if (suggestedEmoji) {
        setEmojiInput(suggestedEmoji);
    }
  };

  const handleAddWord = () => {
    if (!wordInput.trim()) return;
    
    const newItem: WordItem = {
      id: Date.now().toString() + Math.random().toString().slice(2),
      text: wordInput.trim(),
      emoji: emojiInput.trim() || '📝',
      enabled: true
    };
    
    setItems([...items, newItem]);
    setWordInput('');
    setEmojiInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: WordItem[] = [];
      Array.from(e.target.files).forEach((file) => {
        const imageUrl = URL.createObjectURL(file);
        // Use input label if present, otherwise filename
        let text = imageLabelInput.trim();
        if (!text) {
             text = file.name.split('.')[0].replace(/[-_]/g, ' ');
        }

        newItems.push({
            id: Date.now().toString() + Math.random().toString().slice(2),
            text: text, 
            imageSrc: imageUrl,
            enabled: true
        });
      });
      setItems(prev => [...prev, ...newItems]);
      setImageLabelInput(''); // Clear input after adding
    }
  };

  const handleRemove = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateItemText = (id: string, newText: string) => {
    setItems(items.map(i => i.id === id ? { ...i, text: newText } : i));
  };

  const handleApply = () => {
    onSave(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Create Custom Set</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
            <button 
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'words' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                onClick={() => setActiveTab('words')}
            >
                TEXT & EMOJI
            </button>
            <button 
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'images' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                onClick={() => setActiveTab('images')}
            >
                UPLOAD IMAGES
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            
            {/* Input Forms */}
            {activeTab === 'words' && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
                    <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Word</label>
                            <input 
                                value={wordInput}
                                onChange={handleWordInputChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                                placeholder="e.g. Cat"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="w-20 space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Emoji</label>
                            <input 
                                value={emojiInput}
                                onChange={(e) => setEmojiInput(e.target.value)}
                                placeholder="🐱"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-center focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleAddWord}
                        disabled={!wordInput.trim()}
                        className="w-full py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold rounded-lg text-sm"
                    >
                        + Add to List
                    </button>
                    <p className="text-[10px] text-slate-500 text-center">
                        Tip: Type a known word (like "Lion") or paste an emoji to auto-fill!
                    </p>
                </div>
            )}

            {activeTab === 'images' && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
                    <p className="text-sm text-slate-400 text-center">Select images from your device.</p>
                    
                    <div className="space-y-1">
                         <label className="text-[10px] uppercase font-bold text-slate-500">Label (Optional)</label>
                         <input 
                             type="text"
                             value={imageLabelInput}
                             onChange={(e) => setImageLabelInput(e.target.value)}
                             placeholder="Type name here before uploading..."
                             className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                         />
                    </div>

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold text-sm w-full"
                    >
                        {imageLabelInput ? `Upload as "${imageLabelInput}"` : 'Choose Files'}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        multiple
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                </div>
            )}

            {/* List of Items */}
            <div className="space-y-2 mt-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                    <span>Current Set ({items.length})</span>
                    <span className="text-[10px] font-normal text-slate-600">Click text to edit</span>
                </h3>
                {items.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                        List is empty. Add items above!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-800 p-2 rounded-lg border border-slate-700 group">
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                    {item.imageSrc ? (
                                        <img src={item.imageSrc} className="w-10 h-10 rounded object-cover bg-black/20 shrink-0" alt="" />
                                    ) : (
                                        <span className="text-xl w-10 text-center shrink-0">{item.emoji}</span>
                                    )}
                                    <input 
                                        value={item.text}
                                        onChange={(e) => handleUpdateItemText(item.id, e.target.value)}
                                        className="bg-transparent text-slate-200 font-bold border-b border-transparent focus:border-blue-500 hover:border-slate-700 outline-none w-full px-1 py-0.5 transition-colors"
                                    />
                                </div>
                                <button 
                                    onClick={() => handleRemove(item.id)} 
                                    className="text-slate-500 hover:text-red-400 hover:bg-slate-700 p-2 rounded transition-colors ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex gap-3 bg-slate-900 rounded-b-2xl">
          <button onClick={onClose} className="flex-1 py-3 text-slate-400 hover:bg-slate-800 rounded-xl font-bold">Cancel</button>
          <button 
            onClick={handleApply}
            disabled={items.length < 2}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20"
          >
            Play with this Set
          </button>
        </div>
      </div>
    </div>
  );
};