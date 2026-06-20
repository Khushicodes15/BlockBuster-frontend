import React from 'react';
import Map from '@/components/Map';
import PlaybookPanel from '@/components/PlaybookPanel';

export default function OverviewPage() {
  return (
    <div className="flex flex-col md:flex-row w-full h-full p-2 md:p-4 gap-2 md:gap-4 bg-background overflow-hidden">
      <div className="flex-1 relative rounded-xl overflow-hidden shadow-sm border border-border-light min-h-[250px] md:min-h-0">
        <Map />
      </div>
      <div className="h-[500px] md:h-full rounded-xl overflow-hidden shadow-sm border border-border-light bg-card-bg">
        <PlaybookPanel />
      </div>
    </div>
  );
}
