import React from 'react';

interface AudiobookIconProps {
  size?: number;
  className?: string;
}

export const AudiobookIcon: React.FC<AudiobookIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Book */}
      <path d="M4 3h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z" />
      <path d="M4 3v16" />
      
      {/* Speaker with sound waves */}
      <circle cx="16" cy="8" r="2.5" fill="currentColor" />
      <path d="M18 6v4" strokeWidth="1.5" />
      <path d="M19.5 4.5v7" strokeWidth="1.5" />
    </svg>
  );
};

export default AudiobookIcon;
