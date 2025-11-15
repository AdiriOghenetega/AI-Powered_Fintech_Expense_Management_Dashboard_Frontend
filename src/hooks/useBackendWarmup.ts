import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

interface BackendWarmupState {
  isWarming: boolean;
  isReady: boolean;
  error: Error | null;
}

interface UseBackendWarmupOptions {
  pingInterval?: number; // How often to ping when warming (ms)
  timeout?: number; // Max time to wait for warmup (ms)
  initialCheckDelay?: number; // Delay before first check (ms)
}

const API_BASE_URL = import.meta.env.VITE_API_ROOT_URL || 'http://localhost:5000';

export const useBackendWarmup = (options: UseBackendWarmupOptions = {}) => {
  const {
    pingInterval = 3000, // Ping every 3 seconds
    timeout = 120000, // 2 minute timeout
    initialCheckDelay = 500, // Wait 500ms before first check
  } = options;

  const [state, setState] = useState<BackendWarmupState>({
    isWarming: false,
    isReady: false,
    error: null,
  });

  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Ping the backend to check if it's alive
  const pingBackend = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout per request

      const response = await axios.get(`${API_BASE_URL}/health`, {
        signal: controller.signal,
        timeout: 5000,
      });

      clearTimeout(timeoutId);
      return response.status === 200;
    } catch (error) {
      // Ignore errors during warmup - we'll keep trying
      return false;
    }
  }, []);

  // Start the warmup process
  const startWarmup = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState(prev => ({ ...prev, isWarming: true, error: null }));

    // Clear any existing timeouts
    if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
    if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);

    // Set maximum timeout
    maxTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setState({
          isWarming: false,
          isReady: false,
          error: new Error('Backend warmup timeout. Please refresh the page.'),
        });
      }
    }, timeout);

    // Function to recursively ping until ready
    const checkAndPing = async () => {
      if (!isMountedRef.current) return;

      const isReady = await pingBackend();

      if (isReady) {
        // Backend is ready!
        if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
        if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);

        setState({
          isWarming: false,
          isReady: true,
          error: null,
        });
      } else {
        // Not ready yet, schedule next ping
        pingTimeoutRef.current = setTimeout(checkAndPing, pingInterval);
      }
    };

    // Start pinging after initial delay
    setTimeout(checkAndPing, initialCheckDelay);
  }, [pingBackend, pingInterval, timeout, initialCheckDelay]);

  // Detect if a request failed due to backend being down
  const handleRequestError = useCallback((error: any): boolean => {
    // Check if error is likely due to backend being down
    const isNetworkError = 
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      !error.response;

    if (isNetworkError && !state.isWarming) {
      startWarmup();
      return true; // Indicates warmup was triggered
    }

    return false;
  }, [state.isWarming, startWarmup]);

  // Initial health check on mount
  useEffect(() => {
    isMountedRef.current = true;

    const initialCheck = async () => {
      const isReady = await pingBackend();
      
      if (!isReady && isMountedRef.current) {
        // Backend is down, start warmup
        startWarmup();
      } else if (isMountedRef.current) {
        setState(prev => ({ ...prev, isReady: true }));
      }
    };

    initialCheck();

    return () => {
      isMountedRef.current = false;
      if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
      if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    };
  }, [pingBackend, startWarmup]);

  return {
    ...state,
    handleRequestError,
    startWarmup,
  };
};