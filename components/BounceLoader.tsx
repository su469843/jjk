'use client';

import React from 'react';

interface BounceLoaderProps {
  message?: string;
}

const BounceLoader: React.FC<BounceLoaderProps> = ({ message = '处理中...' }) => {
  return (
    <div className="BounceLoaderModal flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="mb-4 flex justify-center">
          <div className="h-4 w-4 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]"></div>
          <div className="mx-1 h-4 w-4 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]"></div>
          <div className="h-4 w-4 animate-bounce rounded-full bg-indigo-500"></div>
        </div>
        {message && (
          <p className="text-sm font-medium text-slate-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default BounceLoader;