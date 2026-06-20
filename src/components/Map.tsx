'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-gray-400 font-medium">Loading Map...</div>
    </div>
  ),
});

export default function Map() {
  return <MapComponent />;
}
