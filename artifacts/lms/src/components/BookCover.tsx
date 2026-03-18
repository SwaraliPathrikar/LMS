import React from 'react';

interface BookCoverProps {
  title: string;
  author: string;
  genre: string;
  bookId: string;
  className?: string;
  coverImage?: string;
}

// Color schemes for different genres
const genreColors: Record<string, { bg: string; accent: string; text: string }> = {
  'History': { bg: '#8B4513', accent: '#D2691E', text: '#FFF8DC' },
  'Biography': { bg: '#2C3E50', accent: '#34495E', text: '#ECF0F1' },
  'Fiction': { bg: '#8E44AD', accent: '#AF7AC5', text: '#F4ECF7' },
  'Technology': { bg: '#1E90FF', accent: '#4169E1', text: '#F0F8FF' },
  'Political Science': { bg: '#DC143C', accent: '#FF6347', text: '#FFF5EE' },
  'Law': { bg: '#191970', accent: '#4B0082', text: '#F0F8FF' },
  'Health & Wellness': { bg: '#228B22', accent: '#32CD32', text: '#F0FFF0' },
  'Science': { bg: '#FF8C00', accent: '#FFA500', text: '#FFF8DC' },
  'Literature': { bg: '#8B0000', accent: '#DC143C', text: '#FFF5EE' },
  'Arts': { bg: '#FF1493', accent: '#FF69B4', text: '#FFF0F5' },
  'Business': { bg: '#006400', accent: '#228B22', text: '#F0FFF0' },
  'Government': { bg: '#4B0082', accent: '#8A2BE2', text: '#F8F8FF' },
  'News': { bg: '#FF4500', accent: '#FF6347', text: '#FFF5EE' },
  'Library Science': { bg: '#8B4513', accent: '#CD853F', text: '#FFFAF0' },
  'Philosophy': { bg: '#2F4F4F', accent: '#708090', text: '#F5FFFA' },
  'Social Science': { bg: '#4169E1', accent: '#6495ED', text: '#F0F8FF' },
};

export const BookCover: React.FC<BookCoverProps> = ({ 
  title, 
  author, 
  genre, 
  bookId,
  className = 'w-full h-full',
  coverImage
}) => {
  const [imageError, setImageError] = React.useState(false);

  // If a cover image is provided and no error, display it
  if (coverImage && !imageError) {
    return (
      <img
        src={coverImage}
        alt={title}
        className={`${className} object-cover pointer-events-none`}
        onError={() => setImageError(true)}
      />
    );
  }

  // Otherwise, use SVG cover as fallback
  
  const colors = genreColors[genre] || { bg: '#34495E', accent: '#7F8C8D', text: '#ECF0F1' };
  
  // Generate a unique pattern based on bookId
  const patternId = `pattern-${bookId}`;
  const getInitials = (text: string) => {
    return text
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const titleInitials = getInitials(title);
  const authorInitials = getInitials(author);

  return (
    <svg
      viewBox="0 0 200 300"
      className={className}
      style={{ background: colors.bg, pointerEvents: 'none' }}
    >
      <defs>
        <pattern id={patternId} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill={colors.bg} />
          <circle cx="20" cy="20" r="2" fill={colors.accent} opacity="0.3" />
          <circle cx="10" cy="10" r="1" fill={colors.accent} opacity="0.2" />
          <circle cx="30" cy="30" r="1" fill={colors.accent} opacity="0.2" />
        </pattern>
      </defs>

      {/* Background with pattern */}
      <rect width="200" height="300" fill={colors.bg} />
      <rect width="200" height="300" fill={`url(#${patternId})`} opacity="0.5" />

      {/* Decorative top bar */}
      <rect width="200" height="40" fill={colors.accent} opacity="0.8" />
      <line x1="0" y1="40" x2="200" y2="40" stroke={colors.accent} strokeWidth="2" />

      {/* Main content area */}
      <g>
        {/* Genre label */}
        <text
          x="100"
          y="25"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill={colors.text}
          opacity="0.9"
        >
          {genre.substring(0, 15)}
        </text>

        {/* Title initials circle */}
        <circle cx="100" cy="120" r="35" fill={colors.accent} opacity="0.9" />
        <text
          x="100"
          y="130"
          textAnchor="middle"
          fontSize="32"
          fontWeight="bold"
          fill={colors.text}
        >
          {titleInitials}
        </text>

        {/* Title text */}
        <text
          x="100"
          y="180"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fill={colors.text}
          textLength="180"
          lengthAdjust="spacingAndGlyphs"
        >
          {title.length > 20 ? title.substring(0, 20) + '...' : title}
        </text>

        {/* Author text */}
        <text
          x="100"
          y="210"
          textAnchor="middle"
          fontSize="10"
          fill={colors.text}
          opacity="0.85"
          textLength="180"
          lengthAdjust="spacingAndGlyphs"
        >
          {author.length > 25 ? author.substring(0, 25) + '...' : author}
        </text>

        {/* Decorative bottom bar */}
        <line x1="20" y1="240" x2="180" y2="240" stroke={colors.accent} strokeWidth="1" opacity="0.6" />
        <line x1="20" y1="245" x2="180" y2="245" stroke={colors.accent} strokeWidth="1" opacity="0.4" />

        {/* Author initials at bottom */}
        <circle cx="100" cy="270" r="12" fill={colors.accent} opacity="0.7" />
        <text
          x="100"
          y="275"
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill={colors.text}
        >
          {authorInitials}
        </text>
      </g>
    </svg>
  );
};

export default BookCover;
