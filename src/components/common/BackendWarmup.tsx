import React, { useState, useEffect } from 'react';
import { Loader2, Server, Coffee } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface BackendWarmupProps {
  isWarming: boolean;
  onWarmupComplete?: () => void;
}

export const BackendWarmup: React.FC<BackendWarmupProps> = ({ 
  isWarming, 
  onWarmupComplete 
}) => {
  const [dots, setDots] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isWarming) return;

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Track elapsed time
    const timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timeInterval);
    };
  }, [isWarming]);

  useEffect(() => {
    if (!isWarming && elapsedTime > 0) {
      setElapsedTime(0);
      setDots('');
      onWarmupComplete?.();
    }
  }, [isWarming, elapsedTime, onWarmupComplete]);

  if (!isWarming) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-white backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card variant="elevated" className="relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-pulse" />
          
          <div className="relative p-8 text-center space-y-6">
            {/* Server icon with animation */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl animate-spin" 
                   style={{ animationDuration: '3s' }} />
              <div className="absolute inset-1 bg-white rounded-2xl flex items-center justify-center">
                <Server className="h-12 w-12 text-blue-600" />
              </div>
              
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping" />
              <div className="absolute -inset-2 rounded-2xl bg-blue-500/10 animate-ping" 
                   style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Main message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Waking up the server{dots}
              </h2>
              <p className="text-gray-600 text-sm">
                Our backend is spinning up from sleep mode. This usually takes 30-60 seconds.
              </p>
            </div>

            {/* Progress indicator */}
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Time elapsed: {formatTime(elapsedTime)}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"
                     style={{ 
                       width: `${Math.min((elapsedTime / 60) * 100, 95)}%`,
                       transition: 'width 1s ease-out'
                     }} 
                />
              </div>
            </div>

            {/* Status messages based on time */}
            <div className="space-y-3">
              {elapsedTime < 15 && (
                <div className="flex items-center justify-center space-x-2 text-blue-600 text-sm">
                  <span className="font-medium">Initializing server...</span>
                </div>
              )}
              
              {elapsedTime >= 15 && elapsedTime < 30 && (
                <div className="flex items-center justify-center space-x-2 text-purple-600 text-sm">
                  <Server className="h-4 w-4" />
                  <span className="font-medium">Loading services...</span>
                </div>
              )}
              
              {elapsedTime >= 30 && elapsedTime < 45 && (
                <div className="flex items-center justify-center space-x-2 text-indigo-600 text-sm">
                  <Coffee className="h-4 w-4" />
                  <span className="font-medium">Almost ready...</span>
                </div>
              )}
              
              {elapsedTime >= 45 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    This is taking longer than usual. Please be patient, the server will be ready soon.
                  </p>
                </div>
              )}
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Coffee className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 text-xs text-blue-700 space-y-1">
                  <p className="font-medium">Why is this happening?</p>
                  <p>
                    We use eco-friendly hosting that puts the server to sleep after periods of inactivity 
                    to save energy. First request after idle time needs to wake it up.
                  </p>
                </div>
              </div>
            </div>

            {/* Reassurance message */}
            <p className="text-xs text-gray-500">
              Your request is queued and will be processed automatically once the server is ready.
            </p>
          </div>
        </Card>

        {/* Fun facts to keep users engaged */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            💡 Pro tip: Keep the app open to prevent future delays
          </p>
        </div>
      </div>
    </div>
  );
};