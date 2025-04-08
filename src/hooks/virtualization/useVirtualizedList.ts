import { useState, useEffect, useCallback } from 'react';

interface VirtualizationConfig {
  itemHeight: number;        // Height of each item in pixels
  overscan?: number;         // Number of items to render beyond visible area
  scrollingDelay?: number;   // Milliseconds to wait before considering scrolling stopped
  initialIndex?: number;     // Initial scroll index
}

interface VirtualizationResult<T> {
  virtualItems: Array<{ index: number; item: T }>;
  startIndex: number;
  endIndex: number;
  containerRef: React.RefObject<HTMLDivElement>;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
  totalHeight: number;
  isScrolling: boolean;
}

/**
 * Custom hook for virtualizing large lists
 * 
 * @param items Array of items to virtualize
 * @param config Configuration options
 * @returns Virtualization helpers
 */
export function useVirtualizedList<T>(
  items: T[],
  {
    itemHeight,
    overscan = 3,
    scrollingDelay = 150,
    initialIndex = 0
  }: VirtualizationConfig
): VirtualizationResult<T> {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  
  // Use a callback ref to get the container element
  const containerRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainerRef(node);
      setViewportHeight(node.clientHeight);
      
      // Set up resize observer
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setViewportHeight(entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(node);
      
      // Set initial scroll position if needed
      if (initialIndex > 0) {
        node.scrollTop = initialIndex * itemHeight;
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [initialIndex, itemHeight]);
  
  // Handle scroll events
  useEffect(() => {
    if (!containerRef) return;
    
    let scrollTimeout: ReturnType<typeof setTimeout>;
    
    const handleScroll = () => {
      setScrollTop(containerRef.scrollTop);
      setIsScrolling(true);
      
      // Clear previous timeout
      clearTimeout(scrollTimeout);
      
      // Set a timeout to detect when scrolling stops
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, scrollingDelay);
    };
    
    containerRef.addEventListener('scroll', handleScroll);
    
    return () => {
      containerRef.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [containerRef, scrollingDelay]);
  
  // Calculate start and end indices
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + viewportHeight) / itemHeight) + overscan
  );
  
  // Generate virtual items
  const virtualItems = items
    .slice(startIndex, endIndex + 1)
    .map((item, i) => ({ index: startIndex + i, item }));
  
  // Function to scroll to a specific index
  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'auto') => {
      if (containerRef && index >= 0 && index < items.length) {
        containerRef.scrollTo({
          top: index * itemHeight,
          behavior,
        });
      }
    },
    [containerRef, itemHeight, items.length]
  );
  
  // Calculate total height of the list
  const totalHeight = items.length * itemHeight;
  
  const containerRefObject = { 
    current: containerRef 
  } as React.RefObject<HTMLDivElement>;
  
  return {
    virtualItems,
    startIndex,
    endIndex,
    containerRef: containerRefObject,
    scrollToIndex,
    totalHeight,
    isScrolling,
  };
}

export default useVirtualizedList;