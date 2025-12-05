import React, { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, ...rest }) => {
  const cursorClass = onClick ? 'cursor-pointer' : '';
  return (
    <div 
      className={`bg-surface rounded-2xl border border-border transition-all duration-300 p-6 relative group shadow-sm hover:shadow-lg hover:shadow-gray-200 ${className} ${cursorClass}`}
      onClick={onClick}
      {...rest}
    >
       <div className="absolute -inset-px rounded-2xl border-2 border-transparent opacity-0 group-hover:opacity-100 group-hover:border-primary/30 transition-opacity duration-300 pointer-events-none" style={{
         background: 'radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(16, 54, 125, 0.08), transparent 40%)'
       }} />
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default Card;