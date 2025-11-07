import React, { useState, useEffect } from 'react';

const VirtualKeyboard = ({ 
  isVisible, 
  onClose, 
  onInput, 
  onBackspace,
  onClear,
  currentValue = '' 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const keys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '@'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', '/', '!'],
    ['DEL', 'CLEAR', 'SPACE', '-', 'DONE']
  ];

  const totalKeys = keys.flat().length;

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => Math.min(totalKeys - 1, prev + 10));
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => Math.max(0, prev - 10));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => Math.min(totalKeys - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Enter') {
        handleKeyPress(selectedIndex);
      } else if (e.key === 'Backspace') {
        onBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, selectedIndex, totalKeys, onInput, onBackspace, onClose]);

  const handleKeyPress = (index) => {
    let flatIndex = 0;
    for (let row of keys) {
      if (index < flatIndex + row.length) {
        const keyIndex = index - flatIndex;
        const key = row[keyIndex];
        
        if (key === 'DEL') {
          onBackspace();
        } else if (key === 'CLEAR') {
          onClear();
        } else if (key === 'SPACE') {
          onInput(' ');
        } else if (key === 'DONE') {
          onClose();
        } else {
          onInput(key.toLowerCase());
        }
        return;
      }
      flatIndex += row.length;
    }
  };

  const getKeyPosition = (index) => {
    let flatIndex = 0;
    for (let rowIdx = 0; rowIdx < keys.length; rowIdx++) {
      const row = keys[rowIdx];
      if (index < flatIndex + row.length) {
        const keyIndex = index - flatIndex;
        return { rowIdx, keyIndex };
      }
      flatIndex += row.length;
    }
    return { rowIdx: 0, keyIndex: 0 };
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 p-8 rounded-2xl border-2 border-gray-700 shadow-2xl">
        {/* Display current input */}
        <div className="mb-6 bg-gray-800 p-4 rounded-lg text-white text-2xl font-mono text-center h-16 flex items-center justify-center">
          {currentValue || 'Type here...'}
        </div>

        {/* Keyboard */}
        <div className="space-y-3 mb-6">
          {keys.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-2 justify-center">
              {row.map((key, keyIdx) => {
                let flatIndex = 0;
                for (let i = 0; i < rowIdx; i++) {
                  flatIndex += keys[i].length;
                }
                flatIndex += keyIdx;
                
                const isSelected = selectedIndex === flatIndex;
                const isSpecialKey = ['DEL', 'CLEAR', 'SPACE', 'DONE', '-'].includes(key);
                
                return (
                  <button
                    key={`${rowIdx}-${keyIdx}`}
                    onClick={() => handleKeyPress(flatIndex)}
                    className={`
                      px-3 py-3 rounded-lg font-bold text-sm transition-all transform
                      ${isSpecialKey 
                        ? 'bg-gray-700 text-yellow-400 text-xs' 
                        : 'bg-gray-600 text-white'
                      }
                      ${isSelected 
                        ? 'scale-110 ring-4 ring-red-600 bg-red-700 text-white' 
                        : 'hover:bg-gray-500'
                      }
                      ${key === 'SPACE' ? 'px-12' : ''}
                      ${key === 'DONE' ? 'bg-green-700 text-white' : ''}
                      ${key === 'DEL' ? 'bg-red-700 text-white' : ''}
                    `}
                  >
                    {key === 'SPACE' ? '␣' : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <p className="text-gray-400 text-center text-sm">
          Use arrow keys to navigate • Enter to select • Esc to close
        </p>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
