import { useState, useEffect } from "react";

export function AnimatedTimeDisplay() {
  const [time, setTime] = useState(new Date());
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      setSeconds(now.getSeconds());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Add a subtle animation effect based on seconds
  const getTimeColor = () => {
    const secondValue = seconds % 10;
    if (secondValue < 3) return 'text-blue-600 dark:text-blue-400';
    if (secondValue < 6) return 'text-purple-600 dark:text-purple-400';
    return 'text-pink-600 dark:text-pink-400';
  };

  return (
    <div className="flex flex-col items-start transition-all duration-500 transform hover:scale-105">
      <div className={`text-xl font-bold ${getTimeColor()} transition-colors duration-1000`}>
        {formatTime(time)}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 animate-fadeIn">
        {formatDate(time)}
      </div>
      {/* Subtle progress bar showing seconds */}
      <div className="w-16 h-1 bg-gray-200 dark:bg-dark-border rounded-full mt-1 overflow-hidden">
        <div 
          className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-1000 ease-linear"
          style={{ width: `${(seconds / 60) * 100}%` }}
        />
      </div>
    </div>
  );
}