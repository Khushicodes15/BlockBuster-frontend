'use client';

import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, Cloud, Sun, CloudRain, CloudSun, AlertTriangle, Users, Car } from 'lucide-react';
import { useDashboard } from './DashboardContext';

function WeatherIcon({ condition }: { condition: string }) {
  const cls = "w-4 h-4";
  if (condition.includes("Rain")) return <CloudRain className={`${cls} text-blue-400`} />;
  if (condition.includes("Sunny")) return <Sun className={`${cls} text-yellow-400`} />;
  if (condition.includes("Partly")) return <CloudSun className={`${cls} text-amber-400`} />;
  if (condition.includes("Clear")) return <Sun className={`${cls} text-yellow-300`} />;
  return <Cloud className={`${cls} text-gray-400`} />;
}

/* Bengaluru City Police circular emblem — matches the official badge style */
function BTPEmblem({ size = 48 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {/* Outer gold ring */}
      <circle cx="50" cy="50" r="48" fill="#1B5E20" stroke="#C5A83E" strokeWidth="3"/>
      {/* Inner gold ring */}
      <circle cx="50" cy="50" r="40" fill="none" stroke="#C5A83E" strokeWidth="1.5"/>
      {/* Text arc — BENGALURU on top */}
      <defs>
        <path id="topArc" d="M 15,50 A 35,35 0 0,1 85,50" fill="none"/>
        <path id="bottomArc" d="M 85,55 A 35,35 0 0,1 15,55" fill="none"/>
      </defs>
      <text fill="#C5A83E" fontSize="8" fontWeight="bold" fontFamily="serif" letterSpacing="3">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">BENGALURU</textPath>
      </text>
      <text fill="#C5A83E" fontSize="7" fontWeight="bold" fontFamily="serif" letterSpacing="3">
        <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">CITY POLICE</textPath>
      </text>
      {/* Ashoka emblem center — simplified */}
      <circle cx="50" cy="46" r="14" fill="none" stroke="#C5A83E" strokeWidth="1.2"/>
      <circle cx="50" cy="46" r="10" fill="none" stroke="#C5A83E" strokeWidth="0.8"/>
      {/* Ashoka wheel spokes */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        return (
          <line key={i} x1="50" y1="46"
            x2={50 + 10 * Math.cos(angle)} y2={46 + 10 * Math.sin(angle)}
            stroke="#C5A83E" strokeWidth="0.5"/>
        );
      })}
      <circle cx="50" cy="46" r="2.5" fill="#C5A83E"/>
      {/* Stars */}
      <circle cx="25" cy="50" r="1.5" fill="#C5A83E"/>
      <circle cx="75" cy="50" r="1.5" fill="#C5A83E"/>
    </svg>
  );
}

export { BTPEmblem };

export default function TopBar() {
  const {
    systemStatus,
    currentTime,
    activeEventsCount,
    availableMarshals,
    isMounted,
    weather,
  } = useDashboard();

  return (
    <div className="h-14 md:h-16 bg-card-bg border-b border-border-light flex items-center justify-between px-3 md:px-6 shrink-0 relative overflow-x-auto no-scrollbar gap-4 md:gap-0">
      {/* Decorative hazard stripe at the very bottom of the top bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#EAB308_10px,#EAB308_20px)]" />

      {/* Left side: Logo & Titles */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="shrink-0">
          <BTPEmblem size={42} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm md:text-lg font-bold leading-tight tracking-wide text-foreground">
            BENGALURU TRAFFIC MANAGEMENT CENTER
          </h1>
          <p className="text-[10px] text-gray-500 font-medium">CITY OPERATIONS DASHBOARD</p>
        </div>
        <div className="sm:hidden">
          <h1 className="text-xs font-bold leading-tight tracking-wide text-foreground">BTMC</h1>
          <p className="text-[8px] text-gray-500 font-medium">OPS DASHBOARD</p>
        </div>
      </div>

      {/* Right side: Metrics & Status */}
      <div className="flex items-center h-full">
        
        {/* Time */}
        <div className="flex items-center gap-2 px-3 md:px-6 border-r border-border-light h-full">
          <Clock className="w-4 h-4 text-gray-400 hidden md:block" />
          <div>
            <div className="text-[10px] text-gray-500 font-bold tracking-wider hidden md:block">TIME (IST)</div>
            <div className="text-sm md:text-lg font-mono font-bold">
              {isMounted ? format(currentTime, 'HH:mm:ss') : '--:--:--'}
            </div>
          </div>
        </div>

        {/* Date — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-2 px-3 md:px-6 border-r border-border-light h-full">
          <Calendar className="w-4 h-4 text-gray-400 hidden md:block" />
          <div>
            <div className="text-[10px] text-gray-500 font-bold tracking-wider hidden md:block">DATE</div>
            <div className="text-xs md:text-sm font-bold">
              {isMounted ? format(currentTime, 'dd MMM yyyy') : '-- --- ----'}
            </div>
          </div>
        </div>

        {/* Weather — mock data (data scope locked, no external API allowed) */}
        <div className="hidden lg:flex items-center gap-2 px-6 border-r border-border-light h-full">
          {weather ? <WeatherIcon condition={weather.condition} /> : <Cloud className="w-4 h-4 text-gray-400" />}
          <div>
            <div className="text-[10px] text-gray-500 font-bold tracking-wider">WEATHER</div>
            <div className="text-sm font-bold">
              {weather ? (
                <>
                  {weather.temp}°C
                  <span className="text-xs font-normal text-gray-400 ml-1">{weather.condition}</span>
                </>
              ) : '-- °C'}
            </div>
          </div>
        </div>

        {/* Active Events */}
        <div className="flex items-center gap-2 px-3 md:px-6 border-r border-border-light h-full">
          <AlertTriangle className="w-4 h-4 text-status-yellow" />
          <div>
            <div className="text-[10px] text-gray-500 font-bold tracking-wider hidden md:block">ACTIVE EVENTS</div>
            <div className="text-sm md:text-lg font-bold text-status-red">{activeEventsCount}</div>
          </div>
        </div>

        {/* Available Marshals — hidden on very small screens */}
        <div className="hidden md:flex items-center gap-2 px-6 border-r border-border-light h-full">
          <Users className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-[10px] text-gray-500 font-bold tracking-wider">AVAILABLE MARSHALS</div>
            <div className="text-sm font-bold">
              {availableMarshals ? `${availableMarshals.available} / ${availableMarshals.total}` : '--- / ---'}
            </div>
          </div>
        </div>

        {/* Response Units (Placeholder — concept undefined per backend docs) */}
        <div className="hidden xl:flex items-center gap-2 px-6 border-r border-border-light h-full opacity-50">
          <Car className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-[10px] text-gray-500 font-bold tracking-wider">RESPONSE UNITS</div>
            <div className="text-sm font-bold">--</div>
          </div>
        </div>

        {/* System Status */}
        <div className="flex flex-col justify-center px-3 md:px-6 md:pl-8 h-full">
          <div className="text-[10px] text-gray-500 font-bold tracking-wider hidden md:block">SYSTEM STATUS</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-bold ${systemStatus === 'OPERATIONAL' ? 'text-status-green' : 'text-status-red'}`}>
              {systemStatus}
            </span>
            <div className={`w-2 h-2 rounded-full ${systemStatus === 'OPERATIONAL' ? 'bg-status-green' : 'bg-status-red'}`} />
          </div>
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
      `}</style>
    </div>
  );
}
