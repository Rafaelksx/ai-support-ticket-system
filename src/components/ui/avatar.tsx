'use client';

interface AvatarProps {
  name?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function Avatar({ name, initials, size = 'md', className = '' }: AvatarProps) {
  const displayInitials = initials || (name ? name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'U');
  
  const colors = [
    'bg-indigo-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-amber-500',
  ];
  
  const colorIndex = displayInitials.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} flex items-center justify-center rounded-full text-white font-semibold ${className}`}
      title={name}
    >
      {displayInitials}
    </div>
  );
}
