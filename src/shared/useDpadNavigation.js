import { useState, useEffect, useRef, useCallback } from "react";

const useDpadNavigation = ({
  totalItems = 0,
  columns = 1,
  onEnter = null,
  enabled = true,
  onDirectionChange = null,
  initialIndex = 0,
} = {}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const containerRef = useRef(null);

  useEffect(() => {
    if (enabled) {
      setSelectedIndex(initialIndex);
    }
  }, [enabled, initialIndex]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!enabled || totalItems === 0 || !containerRef.current) return;

      let handled = false;
      switch (e.key) {
        case "ArrowUp":
          if (selectedIndex >= columns) {
            setSelectedIndex((prev) => prev - columns);
            handled = true;
          }
          break;
        case "ArrowDown":
          const targetIndex = selectedIndex + columns;
          // If the target is a valid index, go to it.
          if (targetIndex < totalItems) {
            setSelectedIndex(targetIndex);
            handled = true;
          } else if (selectedIndex < totalItems - 1 && Math.floor(selectedIndex / columns) < Math.floor((totalItems - 1) / columns)) {
            // If the target is out of bounds, but we are not on the last row, jump to the last item.
            setSelectedIndex(totalItems - 1);
            handled = true;
          }
          break;
        case "ArrowLeft":
          // Allow moving left if not in the first column (index 0, 5, 10, etc.)
          if (selectedIndex % columns !== 0) {
            setSelectedIndex((prev) => prev - 1);
            handled = true;
          }
          break;
        case "ArrowRight":
          // Allow moving right if not in the last column AND not the last item overall.
          const isLastColumn = (selectedIndex + 1) % columns === 0;
          if (!isLastColumn && selectedIndex < totalItems - 1) {
            setSelectedIndex((prev) => prev + 1);
            handled = true;
          }
          break;
        case "Enter":
          if (onEnter) onEnter(selectedIndex);
          handled = true;
          break;
      }

      if (handled) e.preventDefault();
      if (onDirectionChange) onDirectionChange(e.key, handled);
    },
    [enabled, totalItems, columns, selectedIndex, onEnter, onDirectionChange]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (enabled && containerRef.current && totalItems > 0) {
      const selectedElement = containerRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }
  }, [selectedIndex, totalItems, enabled]);

  return { selectedIndex, containerRef };
};

export default useDpadNavigation;