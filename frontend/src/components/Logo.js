import React from 'react';

const Logo = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* PDF Document Icon */}
      <div className="relative mr-3">
        <div className="w-8 h-10 bg-gradient-to-b from-purple-400 to-blue-600 rounded-md relative shadow-lg">
          {/* Folded corner effect */}
          <div className="absolute top-0 right-0 w-0 h-0 border-l-4 border-t-4 border-l-transparent border-t-white rounded-br-md"></div>
          {/* PDF text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-xs drop-shadow-sm">PDF</span>
          </div>
        </div>
      </div>
      
      {/* Brand name */}
      <div className="flex flex-col">
        <h1 className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600 ${sizeClasses[size]}`}>
          PDFPOOL
        </h1>
        <p className="text-xs text-cyan-400 font-medium">by ComputePool Solutions</p>
      </div>
    </div>
  );
};

export default Logo;
