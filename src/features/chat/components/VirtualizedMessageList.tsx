import React, { useEffect, useRef, useCallback } from 'react';
import { Message as MessageType } from '../../../shared/types';
import { useVirtualizedList } from '../../../hooks/virtualization/useVirtualizedList';
import Message from './Message';
import styles from './VirtualizedMessageList.module.css';

interface VirtualizedMessageListProps {
  messages: MessageType[];
  itemHeight?: number;
  className?: string;
}

/**
 * Virtualized message list component for efficient rendering of large chat histories
 */
const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
  messages,
  itemHeight = 120, // Approximate average height, will be dynamically adjusted
  className = '',
}) => {
  // Height adjustments map
  const heightMap = useRef<Map<number, number>>(new Map());
  
  // Calculate average item height from observed messages
  const getAverageHeight = useCallback(() => {
    if (heightMap.current.size === 0) return itemHeight;
    
    const sum = Array.from(heightMap.current.values()).reduce((a, b) => a + b, 0);
    return sum / heightMap.current.size;
  }, [itemHeight]);
  
  // Virtualization hook
  const {
    virtualItems,
    containerRef,
    totalHeight,
    scrollToIndex,
    isScrolling,
  } = useVirtualizedList(messages, {
    itemHeight: getAverageHeight(),
    overscan: 5,
  });
  
  // Measure and record actual item heights for dynamic sizing
  const measureItemHeight = useCallback((index: number, height: number) => {
    heightMap.current.set(index, height);
  }, []);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      scrollToIndex(messages.length - 1, 'smooth');
    }
  }, [messages.length, scrollToIndex]);
  
  return (
    <div 
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={`${styles.container} ${className}`}
      aria-live="polite"
    >
      <div 
        className={styles.innerContainer} 
        style={{ height: `${totalHeight}px` }}
      >
        {virtualItems.map(({ index, item }) => (
          <div 
            key={`${item.role}-${index}`}
            className={styles.itemWrapper}
            style={{ 
              position: 'absolute',
              top: `${index * getAverageHeight()}px`,
              width: '100%',
            }}
          >
            <Message
              message={item}
              onHeightChange={(height) => measureItemHeight(index, height)}
              isAnimated={!isScrolling && index === messages.length - 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(VirtualizedMessageList);