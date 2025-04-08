import { useCallback } from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

// Mock implementation - in a real app, you would connect this to your analytics service
export const useAnalytics = () => {
  // Track a page view
  const trackPageView = useCallback((path: string, title?: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Analytics] Page View:', { path, title });
      return;
    }
    
    // In production, you would call your analytics service
    // Example: window.gtag('config', 'GA-TRACKING-ID', { page_path: path, page_title: title });
  }, []);

  // Track a custom event
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Analytics] Event:', event);
      return;
    }
    
    // In production, you would call your analytics service
    // Example: window.gtag('event', event.action, { 
    //   event_category: event.category,
    //   event_label: event.label,
    //   value: event.value,
    //   ...otherProps
    // });
  }, []);

  // Track a user interaction with a feature
  const trackFeatureUsage = useCallback((feature: string, details?: Record<string, any>) => {
    trackEvent({
      action: 'feature_used',
      category: 'feature',
      label: feature,
      ...details
    });
  }, [trackEvent]);

  // Track errors
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    trackEvent({
      action: 'error',
      category: 'error',
      label: error.message,
      error_stack: error.stack,
      ...context
    });
  }, [trackEvent]);

  // Track user preferences
  const trackPreference = useCallback((preference: string, value: any) => {
    trackEvent({
      action: 'preference_set',
      category: 'preferences',
      label: preference,
      value: typeof value === 'number' ? value : undefined,
      preference_value: value
    });
  }, [trackEvent]);

  return {
    trackPageView,
    trackEvent,
    trackFeatureUsage,
    trackError,
    trackPreference
  };
};

export default useAnalytics;