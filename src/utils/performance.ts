interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  init() {
    this.measureLoadTimes();
    this.observeWebVitals();
    this.trackUserInteractions();
  }

  private measureLoadTimes() {
    // Page load time
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.metrics.loadTime = loadTime;

      // DOM Content Loaded
      const domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
      this.metrics.domContentLoaded = domContentLoaded;

      this.reportMetrics();
    });
  }

  private observeWebVitals() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      });

      try {
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (e) {
        console.warn('Paint observer not supported');
      }

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = cls;
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }
    }
  }

  private trackUserInteractions() {
    // Track clicks
    document.addEventListener('click', this.debounce(() => {
      this.reportUserInteraction('click');
    }, 100));

    // Track scrolling
    window.addEventListener('scroll', this.debounce(() => {
      this.reportUserInteraction('scroll');
    }, 250));

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.reportUserInteraction('page_hidden');
      } else {
        this.reportUserInteraction('page_visible');
      }
    });
  }

  private debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  private reportMetrics() {
    // Send performance metrics to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', {
        custom_map: {
          load_time: this.metrics.loadTime,
          dom_content_loaded: this.metrics.domContentLoaded,
          first_contentful_paint: this.metrics.firstContentfulPaint,
          largest_contentful_paint: this.metrics.largestContentfulPaint,
          cumulative_layout_shift: this.metrics.cumulativeLayoutShift,
          first_input_delay: this.metrics.firstInputDelay,
        }
      });
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.table(this.metrics);
    }
  }

  private reportUserInteraction(type: string) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'user_interaction', {
        interaction_type: type,
        timestamp: Date.now()
      });
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  getPerformanceScore(): number {
    const weights = {
      loadTime: 0.25,
      firstContentfulPaint: 0.25,
      largestContentfulPaint: 0.25,
      cumulativeLayoutShift: 0.15,
      firstInputDelay: 0.1
    };

    let score = 100;

    // Load time scoring (good < 2s, poor > 4s)
    if (this.metrics.loadTime) {
      if (this.metrics.loadTime > 4000) score -= 30 * weights.loadTime * 100;
      else if (this.metrics.loadTime > 2000) score -= 15 * weights.loadTime * 100;
    }

    // FCP scoring (good < 1.8s, poor > 3s)
    if (this.metrics.firstContentfulPaint) {
      if (this.metrics.firstContentfulPaint > 3000) score -= 30 * weights.firstContentfulPaint * 100;
      else if (this.metrics.firstContentfulPaint > 1800) score -= 15 * weights.firstContentfulPaint * 100;
    }

    // LCP scoring (good < 2.5s, poor > 4s)
    if (this.metrics.largestContentfulPaint) {
      if (this.metrics.largestContentfulPaint > 4000) score -= 30 * weights.largestContentfulPaint * 100;
      else if (this.metrics.largestContentfulPaint > 2500) score -= 15 * weights.largestContentfulPaint * 100;
    }

    // CLS scoring (good < 0.1, poor > 0.25)
    if (this.metrics.cumulativeLayoutShift) {
      if (this.metrics.cumulativeLayoutShift > 0.25) score -= 30 * weights.cumulativeLayoutShift * 100;
      else if (this.metrics.cumulativeLayoutShift > 0.1) score -= 15 * weights.cumulativeLayoutShift * 100;
    }

    // FID scoring (good < 100ms, poor > 300ms)
    if (this.metrics.firstInputDelay) {
      if (this.metrics.firstInputDelay > 300) score -= 30 * weights.firstInputDelay * 100;
      else if (this.metrics.firstInputDelay > 100) score -= 15 * weights.firstInputDelay * 100;
    }

    return Math.max(0, Math.round(score));
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();