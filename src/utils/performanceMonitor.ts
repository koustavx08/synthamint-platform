import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface PerformanceNavigationTimingExt extends PerformanceEntry {
  responseStart: number;
  requestStart: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  init() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals monitoring
    this.observeCLS();
    this.observeFID();
    this.observeLCP();
    this.observeFCP();
    this.observeTTFB();

    // Navigation timing
    this.measureNavigationTiming();
    
    // Resource timing
    this.observeResourceTiming();
  }

  private addMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
    };
    
    this.metrics.push(metric);
    console.log(`Performance Metric: ${name} = ${value.toFixed(2)}ms`);

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }
  }

  private observeCLS() {
    let clsValue = 0;
    let clsEntries: LayoutShift[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShift[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
    this.observers.push(observer);

    // Report CLS on page hide
    window.addEventListener('beforeunload', () => {
      this.addMetric('CLS', clsValue);
    });
  }

  private observeFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as PerformanceEventTiming;
        this.addMetric('FID', eventEntry.processingStart - eventEntry.startTime);
      }
    });

    observer.observe({ type: 'first-input', buffered: true });
    this.observers.push(observer);
  }

  private observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.addMetric('LCP', lastEntry.startTime);
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    this.observers.push(observer);
  }

  private observeFCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.addMetric('FCP', entry.startTime);
      }
    });

    observer.observe({ type: 'paint', buffered: true });
    this.observers.push(observer);
  }

  private observeTTFB() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navEntry = entry as PerformanceNavigationTimingExt;
        this.addMetric('TTFB', navEntry.responseStart - navEntry.requestStart);
      }
    });

    observer.observe({ type: 'navigation', buffered: true });
    this.observers.push(observer);
  }

  private measureNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.addMetric('DNS', navigation.domainLookupEnd - navigation.domainLookupStart);
        this.addMetric('TCP', navigation.connectEnd - navigation.connectStart);
        this.addMetric('Request', navigation.responseStart - navigation.requestStart);
        this.addMetric('Response', navigation.responseEnd - navigation.responseStart);
        this.addMetric('DOM', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.addMetric('Load', navigation.loadEventEnd - navigation.loadEventStart);
      }, 0);
    });
  }

  private observeResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        // Monitor large resources
        if (resource.transferSize > 100000) { // > 100KB
          this.addMetric(`Resource_${resource.name.split('/').pop()}`, resource.duration);
        }
      }
    });

    observer.observe({ type: 'resource', buffered: true });
    this.observers.push(observer);
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Example: Send to Google Analytics, DataDog, etc.
    // gtag('event', 'performance_metric', {
    //   metric_name: metric.name,
    //   metric_value: metric.value,
    //   custom_parameter: 'custom_value'
    // });
  }

  // Measure custom timing
  startTiming(name: string) {
    performance.mark(`${name}-start`);
  }

  endTiming(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    this.addMetric(name, measure.duration);
    
    // Clean up marks
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const startTiming = (name: string) => performanceMonitor.startTiming(name);
  const endTiming = (name: string) => performanceMonitor.endTiming(name);
  const getMetrics = () => performanceMonitor.getMetrics();

  return { startTiming, endTiming, getMetrics };
}

// HOC for measuring component render time
export function withPerformanceMonitoring<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName?: string
) {
  const name = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  const EnhancedComponent = (props: T) => {
    const monitor = usePerformanceMonitor();
    
    React.useEffect(() => {
      monitor.startTiming(`${name}-render`);
      return () => monitor.endTiming(`${name}-render`);
    });

    return React.createElement(WrappedComponent, props);
  };

  EnhancedComponent.displayName = `withPerformanceMonitoring(${name})`;
  return EnhancedComponent;
}
