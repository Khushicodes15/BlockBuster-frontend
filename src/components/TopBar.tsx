'use client';

import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, Cloud, Sun, CloudRain, CloudSun, AlertTriangle, Users } from 'lucide-react';
import { useDashboard } from './DashboardContext';
import { Skeleton } from './ui/Skeleton';
import { StatusPill } from './ui/Badge';
import { BrandLogo } from './BrandLogo';
import { cn } from '@/lib/cn';

function WeatherIcon({ condition }: { condition: string }) {
  const cls = 'w-4 h-4';
  if (condition.includes('Rain')) return <CloudRain className={`${cls} text-blue-500`} aria-hidden />;
  if (condition.includes('Sunny')) return <Sun className={`${cls} text-amber-500`} aria-hidden />;
  if (condition.includes('Partly')) return <CloudSun className={`${cls} text-amber-500`} aria-hidden />;
  if (condition.includes('Clear')) return <Sun className={`${cls} text-amber-400`} aria-hidden />;
  return <Cloud className={`${cls} text-text-subtle`} aria-hidden />;
}

function Metric({
  icon,
  label,
  loading,
  children,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2 px-3 md:px-5 border-r border-border-light h-full', className)}>
      {icon}
      <div>
        <div className="text-[10px] text-text-subtle font-bold tracking-wider hidden md:block">{label}</div>
        {loading ? (
          <Skeleton className="h-5 w-16 mt-0.5" />
        ) : (
          <div className="text-sm md:text-base font-bold text-foreground leading-tight">{children}</div>
        )}
      </div>
    </div>
  );
}

export default function TopBar() {
  const { systemStatus, currentTime, activeEventsCount, availableMarshals, isMounted, weather } =
    useDashboard();

  const operational = systemStatus === 'OPERATIONAL';

  return (
    <header className="h-14 md:h-16 bg-card-bg border-b border-border-light flex items-center justify-between px-3 md:px-6 shrink-0 relative overflow-x-auto no-scrollbar gap-4 md:gap-0">
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#EAB308_10px,#EAB308_20px)]" />

      {/* Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <BrandLogo size={42} />
        <div className="hidden sm:block">
          <h1 className="text-sm md:text-lg font-bold leading-tight tracking-wide text-foreground">
            BENGALURU TRAFFIC MANAGEMENT CENTER
          </h1>
          <p className="text-[10px] text-text-subtle font-medium">CITY OPERATIONS DASHBOARD</p>
        </div>
        <div className="sm:hidden">
          <h1 className="text-xs font-bold leading-tight tracking-wide text-foreground">BTMC</h1>
          <p className="text-[9px] text-text-subtle font-medium">OPS DASHBOARD</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center h-full">
        <Metric icon={<Clock className="w-4 h-4 text-text-subtle hidden md:block" aria-hidden />} label="TIME (IST)" loading={!isMounted}>
          <span className="font-mono">{format(currentTime, 'HH:mm:ss')}</span>
        </Metric>

        <Metric icon={<Calendar className="w-4 h-4 text-text-subtle hidden md:block" aria-hidden />} label="DATE" loading={!isMounted} className="hidden sm:flex">
          <span className="text-xs md:text-sm">{format(currentTime, 'dd MMM yyyy')}</span>
        </Metric>

        <Metric icon={weather ? <WeatherIcon condition={weather.condition} /> : undefined} label="WEATHER" loading={!weather} className="hidden lg:flex">
          {weather?.temp}°C
          <span className="text-xs font-normal text-text-subtle ml-1">{weather?.condition}</span>
        </Metric>

        <Metric icon={<AlertTriangle className="w-4 h-4 text-status-yellow" aria-hidden />} label="ACTIVE EVENTS">
          <span className={activeEventsCount > 0 ? 'text-status-red' : 'text-foreground'}>{activeEventsCount}</span>
        </Metric>

        <Metric icon={<Users className="w-4 h-4 text-text-subtle" aria-hidden />} label="AVAILABLE MARSHALS" loading={!availableMarshals} className="hidden md:flex">
          {availableMarshals ? `${availableMarshals.available} / ${availableMarshals.total}` : '—'}
        </Metric>

        {/* System status */}
        <div className="flex flex-col justify-center px-3 md:px-6 h-full">
          <div className="text-[10px] text-text-subtle font-bold tracking-wider hidden md:block mb-1">SYSTEM STATUS</div>
          <StatusPill tone={operational ? 'success' : systemStatus === 'UNKNOWN' ? 'neutral' : 'danger'} pulse={operational}>
            {systemStatus}
          </StatusPill>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </header>
  );
}
