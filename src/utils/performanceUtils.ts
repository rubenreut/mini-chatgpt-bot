/**
 * Utility functions for measuring and enhancing performance
 */

// Web Vitals metrics type
export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

// Performance mark/measure helper
export const performance = {
  /**
   * Mark the start of a performance measurement
   */
  mark: (name: string): void => {
    if (window.performance && window.performance.mark) {
      window.performance.mark(`${name}_start`);
    }
  },

  /**
   * End a performance measurement and log the result
   */
  measure: (name: string, log = false): number | null => {
    if (window.performance && window.performance.mark && window.performance.measure) {
      try {
        window.performance.mark(`${name}_end`);
        window.performance.measure(name, `${name}_start`, `${name}_end`);
        
        const entries = window.performance.getEntriesByName(name, 'measure');
        const duration = entries.length > 0 ? entries[0].duration : null;
        
        if (log && duration !== null) {
          console.log(`${name}: ${duration.toFixed(2)}ms`);
        }
        
        return duration;
      } catch (e) {
        console.error('Error measuring performance:', e);
        return null;
      }
    }
    return null;
  },
  
  /**
   * Clear all performance marks and measures
   */
  clearMarks: (): void => {
    if (window.performance && window.performance.clearMarks) {
      window.performance.clearMarks();
    }
    if (window.performance && window.performance.clearMeasures) {
      window.performance.clearMeasures();
    }
  }
};

/**
 * Generate a large number of sample messages for load testing
 */
export const generateTestMessages = (count = 100): Array<{ role: 'user' | 'assistant' | 'system', content: string }> => {
  const messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }> = [];
  const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultrices, nisl nisl ultricies nisl, nec ultricies nisl nisl eget. Nullam euismod, nisl eget ultricies ultrices, nisl nisl ultricies nisl, nec ultricies nisl nisl eget.';
  
  // Add some sample messages with varying length
  for (let i = 0; i < count; i++) {
    // Alternate between user and assistant
    const role = i % 2 === 0 ? 'user' : 'assistant';
    
    // Vary content length
    const contentLength = Math.floor(Math.random() * 5) + 1;
    const content = Array(contentLength).fill(loremIpsum).join(' ');
    
    messages.push({ role, content });
  }
  
  return messages;
};

/**
 * Debounce function to limit the frequency of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit the frequency of function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number = 0;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      if (lastFunc) clearTimeout(lastFunc);
      
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Report Web Vitals metrics to analytics
 */
export const reportWebVitals = (onPerfEntry?: (metric: WebVitalMetric) => void) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry as any);
      getFID(onPerfEntry as any);
      getFCP(onPerfEntry as any);
      getLCP(onPerfEntry as any);
      getTTFB(onPerfEntry as any);
    });
  }
};

/**
 * Get current browser memory usage (Chrome only)
 */
export const getMemoryInfo = (): { 
  jsHeapSizeLimit?: number; 
  totalJSHeapSize?: number;
  usedJSHeapSize?: number; 
} => {
  if (window.performance && 'memory' in window.performance) {
    const memoryInfo = (window.performance as any).memory;
    return {
      jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
      totalJSHeapSize: memoryInfo.totalJSHeapSize,
      usedJSHeapSize: memoryInfo.usedJSHeapSize
    };
  }
  return {};
};

export default {
  performance,
  generateTestMessages,
  debounce,
  throttle,
  reportWebVitals,
  getMemoryInfo
};