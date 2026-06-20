'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, AlertTriangle, TrafficCone, Users, HardHat, BarChart2, FileText, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', icon: Home, href: '/dashboard/overview' },
  { label: 'Live Traffic', icon: Map, href: '/dashboard/live-traffic' },
  { label: 'Incidents', icon: AlertTriangle, href: '/dashboard/incidents' },
  { label: 'Signals', icon: TrafficCone, href: '/dashboard/signals' },
  { label: 'Marshals', icon: Users, href: '/dashboard/marshals' },
  { label: 'Roadworks', icon: HardHat, href: '/dashboard/roadworks' },
  { label: 'Analytics', icon: BarChart2, href: '/dashboard/analytics' },
  { label: 'Reports', icon: FileText, href: '/dashboard/reports' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full md:w-20 lg:w-24 bg-card-bg border-t md:border-t-0 md:border-r border-border-light flex flex-row md:flex-col items-center py-1 md:py-4 shrink-0 gap-0.5 md:gap-1 h-auto md:h-full overflow-x-auto md:overflow-y-auto order-last md:order-first no-scrollbar">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg md:rounded-xl transition-colors shrink-0 ${
              isActive ? 'bg-gray-100 text-accent-olive' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 md:w-6 md:h-6 mb-0.5 md:mb-1" />
            <span className="text-[8px] md:text-[10px] font-semibold tracking-wide text-center leading-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
