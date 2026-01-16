import React, { useState, useRef } from 'react';
import { WordItem } from '../types';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: WordItem[]) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onSave }) => {
  const [uploadedItems, setUploadedItems] = useState<WordItem[]>([]);
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: WordItem[] = [];
      
      Array.from(e.target.files).forEach((file) => {
        const imageUrl = URL.createObjectURL(file);
        // Use filename (without extension) as default text if input is empty
        const defaultText = file.name.split('.')[0].replace(/[-_]/g, ' ');
        const text = inputText || defaultText;

        newItems.push({
            id: Date.now().toString() + Math.random().toString().slice(2),
            text: text, 
            imageSrc: imageUrl
        });
      });

      setUploadedItems(prev => [...prev, ...newItems]);
      setInputText(''); // Reset input
    }
  };

  const handleRemove = (id: string) => {
    setUploadedItems(uploadedItems.filter(i => i.id !== id));
  };

  const handleApply = () => {
    onSave(uploadedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Upload Custom Images</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
          <p className="text-sm text-slate-400">
            Select one or more images. You can optionally type a word label before selecting to apply it to the images (or rename them later by re-uploading).
          </p>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Label (Optional)" 
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap"
            >
              + Add Images
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

          <div className="grid grid-cols-3 gap-2 mt-2">
            {uploadedItems.map((item) => (
              <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-600">
                <img src={item.imageSrc} alt={item.text} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold mb-1 text-center px-1 truncate w-full">{item.text}</span>
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="text-red-400 hover:text-red-300 text-xs bg-black/50 px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {uploadedItems.length === 0 && (
              <div className="col-span-3 h-32 flex items-center justify-center text-slate-600 text-sm border-2 border-dashed border-slate-700 rounded-lg">
                No images added yet.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 text-slate-400 hover:bg-slate-800 rounded-lg font-bold">Cancel</button>
          <button 
            onClick={handleApply}
            disabled={uploadedItems.length < 2}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-bold"
          >
            Start with {uploadedItems.length} Images
          </button>
        </div>
      </div>
    </div>
  );
};