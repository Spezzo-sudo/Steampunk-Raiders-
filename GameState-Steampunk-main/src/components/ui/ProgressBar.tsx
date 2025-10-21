import React from 'react';

interface ProgressBarProps {
  progress: number;
}

/**
 * Schlanke Fortschrittsanzeige, die Füllstände oder Abläufe visualisiert.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const safeProgress = Math.min(100, Math.max(0, progress));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full border-opacity-50 bg-gray-700 steampunk-border">
      <div
        className="h-2.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-500 ease-linear"
        style={{ width: `${safeProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
