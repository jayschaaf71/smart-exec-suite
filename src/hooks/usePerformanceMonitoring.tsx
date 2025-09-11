import { useEffect, useState } from 'react';
import { performanceMonitor } from '@/utils/performance';

interface PerformanceData {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  performanceScore: number;
}

export function usePerformanceMonitoring() {
  const [performanceData, setPerformanceData] = useState<Partial<PerformanceData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.init();

    // Get initial metrics
    const updateMetrics = () => {
      const metrics = performanceMonitor.getMetrics();
      const score = performanceMonitor.getPerformanceScore();
      
      setPerformanceData({
        ...metrics,
        performanceScore: score
      });
      setIsLoading(false);
    };

    // Update metrics after page load
    if (document.readyState === 'complete') {
      setTimeout(updateMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(updateMetrics, 1000);
      });
    }

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000);

    return () => {
      clearInterval(interval);
      performanceMonitor.cleanup();
    };
  }, []);

  const getPerformanceGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatMetric = (value: number | undefined, unit: string = 'ms'): string => {
    if (value === undefined) return 'N/A';
    
    if (unit === 'ms') {
      return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(1)}s`;
    }
    
    return `${value.toFixed(3)}${unit}`;
  };

  return {
    performanceData,
    isLoading,
    getPerformanceGrade,
    getPerformanceColor,
    formatMetric,
    refreshMetrics: () => {
      const metrics = performanceMonitor.getMetrics();
      const score = performanceMonitor.getPerformanceScore();
      setPerformanceData({ ...metrics, performanceScore: score });
    }
  };
}