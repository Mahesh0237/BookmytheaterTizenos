import React, { useState, useEffect, useMemo, useCallback } from 'react';

const VirtualKeyboard = ({
  isVisible,
  onClose,
  onInput,
  onBackspace,
  onClear,
  currentValue = ''
}) => {
  const [focusedKey, setFocusedKey] = useState({ row: 0, col: 0 });
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [isSpecialChars, setIsSpecialChars] = useState(false);

  const regularKeyboard = useMemo(() => (
    [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '@'],
      ['$%^', '↑', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
      ['Space', 'Clear', 'Done']
    ]
  ), []);

  const specialCharsKeyboard = useMemo(() => (
    [
      ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
      ['-', '_', '=', '+', '[', ']', '{', '}', '|', '\\'],
      [';', ':', "'", '"', ',', '<', '.', '>', '/', '?'],
      ['$%^', '↑', '`', '~', '¡', '™', '£', '¢', '∞', '⌫'],
      ['Space', 'Clear', 'Done']
    ]
  ), []);

  const currentKeyboard = useMemo(() => (
    isSpecialChars ? specialCharsKeyboard : regularKeyboard
  ), [isSpecialChars, specialCharsKeyboard, regularKeyboard]);

  useEffect(() => {
    if (!isVisible) return;
    setFocusedKey({ row: 0, col: 0 });
    setIsCapsLock(false);
    setIsSpecialChars(false);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const row = currentKeyboard[focusedKey.row] || [];
    if (row.length === 0) {
      setFocusedKey({ row: 0, col: 0 });
      return;
    }
    if (focusedKey.col >= row.length) {
      setFocusedKey(prev => ({ row: prev.row, col: row.length - 1 }));
    }
  }, [isVisible, currentKeyboard, focusedKey.row, focusedKey.col]);

  const handleKeySelection = useCallback((row, col) => {
    const key = currentKeyboard[row]?.[col];
    if (!key) return;
    if (key === '⌫') {
      onBackspace();
      return;
    }
    if (key === 'Space') {
      onInput(' ');
      return;
    }
    if (key === 'Clear') {
      onClear();
      return;
    }
    if (key === 'Done') {
      onClose();
      return;
    }
    if (key === '$%^') {
      setIsSpecialChars(prev => !prev);
      return;
    }
    if (key === '↑') {
      setIsCapsLock(prev => !prev);
      return;
    }
    if (key.length === 1) {
      const isLetter = /[a-z]/i.test(key);
      const finalKey = isLetter && !isSpecialChars && isCapsLock ? key.toUpperCase() : key;
      onInput(finalKey);
    }
  }, [currentKeyboard, isSpecialChars, isCapsLock, onBackspace, onInput, onClear, onClose]);

  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e) => {
      const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Backspace', 'Escape'];
      if (navigationKeys.includes(e.key)) {
        e.preventDefault();
      }
      const keyboard = isSpecialChars ? specialCharsKeyboard : regularKeyboard;
      const rowCount = keyboard.length;
      const currentRow = keyboard[focusedKey.row] || [];
      if (e.key === 'ArrowUp') {
        if (focusedKey.row > 0) {
          setFocusedKey(prev => {
            const newRow = prev.row - 1;
            const nextRow = keyboard[newRow];
            const newCol = Math.min(prev.col, nextRow.length - 1);
            return { row: newRow, col: newCol };
          });
        }
      } else if (e.key === 'ArrowDown') {
        if (focusedKey.row < rowCount - 1) {
          setFocusedKey(prev => {
            const newRow = prev.row + 1;
            const nextRow = keyboard[newRow];
            const newCol = Math.min(prev.col, nextRow.length - 1);
            return { row: newRow, col: newCol };
          });
        }
      } else if (e.key === 'ArrowLeft') {
        if (focusedKey.col > 0) {
          setFocusedKey(prev => ({ row: prev.row, col: prev.col - 1 }));
        } else if (focusedKey.row > 0) {
          setFocusedKey(prev => {
            const newRow = prev.row - 1;
            const nextRow = keyboard[newRow];
            return { row: newRow, col: nextRow.length - 1 };
          });
        }
      } else if (e.key === 'ArrowRight') {
        if (focusedKey.col < currentRow.length - 1) {
          setFocusedKey(prev => ({ row: prev.row, col: prev.col + 1 }));
        } else if (focusedKey.row < rowCount - 1) {
          setFocusedKey(prev => ({ row: prev.row + 1, col: 0 }));
        }
      } else if (e.key === 'Enter') {
        handleKeySelection(focusedKey.row, focusedKey.col);
      } else if (e.key === 'Backspace') {
        onBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, focusedKey, isSpecialChars, handleKeySelection, onBackspace, onClose, regularKeyboard, specialCharsKeyboard]);

  if (!isVisible) return null;

  const renderKeyLabel = (key) => {
    if (key === 'Space') return 'Space';
    if (key === '↑') return isCapsLock && !isSpecialChars ? '⇧' : '↑';
    if (key.length === 1 && /[a-z]/.test(key) && !isSpecialChars) {
      return isCapsLock ? key.toUpperCase() : key;
    }
    return key;
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 p-8 rounded-2xl border-2 border-gray-700 shadow-2xl w-[90%] max-w-4xl">
        <div className="mb-6 bg-gray-800 p-4 rounded-lg text-white text-2xl font-mono text-center h-16 flex items-center justify-center">
          {currentValue || 'Type here...'}
        </div>
        <div className="space-y-3 mb-6 space-x-0">
          {currentKeyboard.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-2 justify-center">
              {row.map((key, keyIdx) => {
                const isSelected = focusedKey.row === rowIdx && focusedKey.col === keyIdx;
                const isActionKey = ['$%^', '↑', '⌫', 'Space', 'Clear', 'Done'].includes(key);
                const isToggleActive = (key === '$%^' && isSpecialChars) || (key === '↑' && isCapsLock && !isSpecialChars);
                return (
                  <button
                    key={`${rowIdx}-${keyIdx}`}
                    onClick={() => handleKeySelection(rowIdx, keyIdx)}
                    className={`
                      px-4 py-3 rounded-lg font-semibold tracking-wide transition-all transform
                      ${isActionKey ? 'bg-[#5B0203] text-white' : 'bg-gray-600 text-white'}
                      ${isSelected ? 'scale-105 ring-4 ring-red-600' : 'hover:bg-gray-500'}
                      ${key === 'Space' ? 'flex-1 px-16' : 'min-w-[60px]'}
                      ${key === 'Done' ? 'bg-green-600 text-white' : ''}
                      ${key === 'Clear' ? 'bg-gray-700 text-white' : ''}
                      ${key === '⌫' ? 'bg-red-700 text-white' : ''}
                      ${isToggleActive ? 'bg-white text-black' : ''}
                    `}
                  >
                    {renderKeyLabel(key)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-center text-sm">
          Use arrow keys to navigate • Enter to select • Esc to close
        </p>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
