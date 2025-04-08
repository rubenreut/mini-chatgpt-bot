import React from 'react';

interface AnimatedPlusIconProps {
  isActive: boolean;
}

const AnimatedPlusIcon: React.FC<AnimatedPlusIconProps> = ({ isActive }) => {
  return (
    <div className={`animated-plus-container ${isActive ? 'active' : ''}`}>
      <svg 
        className="animated-plus" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Horizontal line of the plus/X */}
        <path
          className="plus-line-1"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          d="M6 12h12"
        />
        
        {/* Vertical line of the plus/X */}
        <path
          className="plus-line-2"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          d="M12 6v12"
        />
      </svg>
    </div>
  );
};

export default AnimatedPlusIcon;