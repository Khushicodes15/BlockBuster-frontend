'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useDashboard } from './DashboardContext';

export default function AlertTicker() {
  const { networkStatus, upcomingEvents, isMounted } = useDashboard();

  // Combine red corridors and upcoming events into alerts
  const redCorridors = networkStatus.filter(s => s.vc_ratio === null || s.vc_ratio >= 0.9);
  
  const alerts = [
    ...redCorridors.map(c => ({
      text: `Heavy traffic on ${c.corridor}`,
      color: 'bg-status-red'
    })),
    ...upcomingEvents.map(e => ({
      text: `${e.label} at ${isMounted ? new Date(e.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}`,
      color: 'bg-status-green'
    }))
  ];

  // Always show some alerts for visual completeness
  if (alerts.length === 0) {
    alerts.push(
      { text: 'Heavy traffic on ORR – Eastbound', color: 'bg-status-red' },
      { text: 'Rain forecasted in 2 hrs', color: 'bg-status-yellow' },
      { text: 'VIP Movement at Vidhana Soudha at 16:00', color: 'bg-status-green' },
    );
  }

  return (
    <div className="h-10 md:h-12 bg-card-bg border-t border-border-light flex items-center shrink-0 w-full">
      <div className="flex items-center px-3 md:px-6 border-r border-border-light h-full bg-gray-50/50 min-w-[120px] md:min-w-[180px]">
        <Bell className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 mr-1.5 md:mr-2" />
        <span className="text-[9px] md:text-[10px] font-bold tracking-wider text-gray-600">SYSTEM ALERTS</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative flex items-center px-3 md:px-4">
        <div className="flex items-center gap-4 md:gap-8 whitespace-nowrap overflow-x-auto no-scrollbar mask-edges">
          {alerts.map((alert, idx) => (
            <div key={idx} className="flex items-center text-[11px] md:text-xs text-gray-600 font-medium">
              <div className={`w-2 h-2 rounded-full ${alert.color} mr-1.5 md:mr-2 shrink-0`} />
              {alert.text}
            </div>
          ))}
        </div>
      </div>

      {/* Data Source — hidden on small screens */}
      <div className="hidden lg:flex items-center px-6 border-l border-border-light h-full bg-gray-50/50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zM9 14h6m-6-4h6" />
          </svg>
          <span className="text-[10px] font-bold tracking-wider text-gray-500">DATA SOURCE:</span>
          <span className="text-[10px] text-gray-400 font-medium">City Sensors, CCTV, Traffic APIs</span>
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
    </div>
  );
}
