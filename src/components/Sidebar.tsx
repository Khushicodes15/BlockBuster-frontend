'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Map,
  AlertTriangle,
  TrafficCone,
  Users,
  HardHat,
  BarChart2,
  FileText,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
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

const PRIMARY = NAV_ITEMS.slice(0, 8);
const PINNED = NAV_ITEMS[8]; // Settings, pinned to the bottom

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={item.label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex flex-col items-center justify-center gap-1 w-16 h-14 md:w-full md:h-auto md:py-2.5 rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'text-accent-olive bg-olive-50'
          : 'text-text-subtle hover:text-foreground hover:bg-surface-muted',
      )}
    >
      <span
        className={cn(
          'hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-accent-olive transition-opacity',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />
      <Icon className="w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={active ? 2.4 : 2} aria-hidden />
      <span className="text-[10px] font-semibold tracking-wide text-center leading-none">
        {item.label}
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Primary navigation"
      className="w-full md:w-20 lg:w-24 bg-card-bg border-t md:border-t-0 md:border-r border-border-light flex flex-row md:flex-col items-center md:items-stretch py-1 md:py-3 px-1 md:px-2 shrink-0 gap-1 h-auto md:h-full overflow-x-auto md:overflow-y-auto order-last md:order-first no-scrollbar"
    >
      <div className="flex flex-row md:flex-col items-center md:items-stretch gap-1 md:flex-1">
        {PRIMARY.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>
      <NavLink item={PINNED} active={isActive(PINNED.href)} />
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </nav>
  );
}
