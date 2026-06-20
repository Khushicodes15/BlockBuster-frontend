'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, ZoomControl, Marker, Popup } from 'react-leaflet';
import { useDashboard } from './DashboardContext';
import { Search, Layers, X } from 'lucide-react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

// Helper to determine color based on vc_ratio or color string
function getColorForStatus(vcRatio: number | null, colorStr?: string): string {
  if (colorStr) {
    if (colorStr === 'green') return '#10B981';
    if (colorStr === 'yellow') return '#EAB308';
    if (colorStr === 'red') return '#EF4444';
  }
  if (vcRatio === null) return '#EF4444'; // Blocked / No Data -> Red
  if (vcRatio < 0.7) return '#10B981';  // Green
  if (vcRatio < 0.9) return '#EAB308';  // Yellow
  return '#EF4444'; // Red
}

// Component to handle map centering via search
function MapController({ center }: { center: L.LatLngExpression | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1 });
    }
  }, [center, map]);
  return null;
}

export default function MapComponent() {
  const {
    networkStatus,
    corridorCentroids,
    corridorGraph,
    stations,
    junctions,
    selectedIncident,
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [showStations, setShowStations] = useState(false);
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build search suggestions: corridors + stations + junctions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 1) return [];
    const term = searchQuery.toLowerCase();
    const results: { label: string; type: string; lat?: number; lng?: number }[] = [];

    // Corridor centroids
    corridorCentroids.forEach(c => {
      if (c.corridor.toLowerCase().includes(term)) {
        results.push({ label: c.corridor, type: 'Corridor', lat: c.latitude, lng: c.longitude });
      }
    });

    // Stations
    stations.forEach(s => {
      if (s.police_station.toLowerCase().includes(term)) {
        results.push({ label: s.police_station, type: 'Station', lat: s.latitude, lng: s.longitude });
      }
    });

    // Junctions (no lat/lng — show as info only)
    junctions.forEach(j => {
      if (j.junction?.toLowerCase().includes(term)) {
        // Find parent corridor's centroid as a rough location
        const parent = corridorCentroids.find(c => c.corridor === j.corridor);
        results.push({
          label: `${j.junction} (${j.corridor})`,
          type: 'Junction',
          lat: parent?.latitude,
          lng: parent?.longitude,
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, corridorCentroids, stations, junctions]);

  const handleSelectSuggestion = (suggestion: { lat?: number; lng?: number; label: string }) => {
    if (suggestion.lat && suggestion.lng) {
      setMapCenter([suggestion.lat, suggestion.lng]);
      setSearchQuery(suggestion.label);
      setShowSuggestions(false);
      setSearchFeedback(null);
    } else {
      setSearchFeedback('No coordinates available for this location');
      setTimeout(() => setSearchFeedback(null), 2000);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else {
        setSearchFeedback('No matching locations found');
        setTimeout(() => setSearchFeedback(null), 2000);
      }
    }
  };

  // Create a map of corridor status for quick lookup
  // Merge baseline network_status with incident's playbook network_state
  const statusMap = useMemo(() => {
    const map = new Map<string, any>();
    
    // First load baseline network status
    networkStatus.forEach(status => {
      map.set(status.corridor, status);
    });

    // Then overlay incident's playbook network state (has disaster impact)
    const playbookNetworkState = selectedIncident?.playbook?.network_state;
    if (playbookNetworkState) {
      playbookNetworkState.forEach((status: any) => {
        const simStatus = { ...status };
        // Artificially boost congestion for the mock incident so the map shows visual spillover
        if (selectedIncident?.id === "MOCK-INCIDENT-001") {
          if (simStatus.corridor === 'Magadi Road') simStatus.vc_ratio = 0.95;
          if (simStatus.corridor === 'West of Chord Road') simStatus.vc_ratio = 0.85;
          if (simStatus.corridor === 'Tumkur Road') simStatus.vc_ratio = 0.75;
          if (simStatus.corridor === 'Bellary Road 1') simStatus.vc_ratio = 0.82;
        }
        map.set(simStatus.corridor, simStatus);
      });
    }

    return map;
  }, [networkStatus, selectedIncident]);

  // Compute diversion path edges
  const diversionEdges = useMemo(() => {
    const playbook = selectedIncident?.playbook;
    if (!playbook?.diversion?.path || playbook.diversion.path.length < 2) return [];

    const pathEdges: { id: string; positions: L.LatLngExpression[] }[] = [];
    const path = playbook.diversion.path;
    for (let i = 0; i < path.length - 1; i++) {
      const sourceNode = corridorCentroids.find(c => c.corridor === path[i]);
      const targetNode = corridorCentroids.find(c => c.corridor === path[i + 1]);
      if (sourceNode && targetNode) {
        pathEdges.push({
          id: `div-${path[i]}-${path[i + 1]}`,
          positions: [
            [sourceNode.latitude, sourceNode.longitude],
            [targetNode.latitude, targetNode.longitude],
          ],
        });
      }
    }
    return pathEdges;
  }, [selectedIncident, corridorCentroids]);

  // Compute all corridor graph edges with colors from network status
  const corridorEdges = useMemo(() => {
    return []; // FULL MESH REMOVED per instruction
  }, []);

  const blockedCorridors = selectedIncident?.blocked_corridors || [];

  return (
    <div className="relative w-full h-full bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
      
      {/* Top Search Bar & Map Layers Controls overlaying the map */}
      <div className="absolute top-3 left-3 right-3 md:top-4 md:left-4 md:right-4 z-[1000] flex justify-between pointer-events-none gap-2">
        <div ref={searchRef} className="w-56 md:w-80 relative pointer-events-auto">
          <div className={`bg-white rounded-lg shadow-md border ${searchFeedback ? 'border-red-300' : 'border-gray-200'} flex items-center px-3 py-2 transition-colors`}>
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search location or junction..." 
              className="w-full text-sm outline-none bg-transparent"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setSearchFeedback(null);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleSearch}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSuggestions(false); setSearchFeedback(null); }} className="ml-1">
                <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          {searchFeedback && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 font-medium shadow-sm">
              {searchFeedback}
            </div>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors"
                  onClick={() => handleSelectSuggestion(s)}
                >
                  <span className="text-sm text-gray-800 truncate">{s.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                    s.type === 'Corridor' ? 'bg-blue-50 text-blue-600' :
                    s.type === 'Station' ? 'bg-amber-50 text-amber-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>{s.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div 
          onClick={() => setShowStations(!showStations)}
          className={`rounded-lg shadow-md border flex items-center px-2 md:px-3 py-2 cursor-pointer pointer-events-auto transition-colors shrink-0 ${showStations ? 'bg-accent-olive text-white border-accent-olive-hover' : 'bg-white border-gray-200 text-gray-700'}`}
        >
          <Layers className={`w-4 h-4 mr-1.5 ${showStations ? 'text-white' : 'text-gray-600'}`} />
          <span className="text-xs md:text-sm font-medium hidden sm:inline">Map Layers</span>
        </div>
      </div>

      <MapContainer 
        center={[12.9716, 77.5946]} 
        zoom={12} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <MapController center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />

        {/* Render Diversion Path (dashed blue overlay) */}
        {diversionEdges.map(edge => (
          <Polyline 
            key={edge.id} 
            positions={edge.positions} 
            color="#3B82F6"
            weight={5}
            opacity={0.8}
            dashArray="10, 10"
          />
        ))}

        {/* Render Corridor Centroids */}
        {corridorCentroids.map(centroid => {
          const status = statusMap.get(centroid.corridor);
          const isBlocked = blockedCorridors.includes(centroid.corridor);
          
          if (isBlocked) return null; // We render a special glowing marker for blocked corridors

          const color = status ? getColorForStatus(status.vc_ratio, status.color) : '#9CA3AF';

          return (
            <CircleMarker
              key={centroid.corridor}
              center={[centroid.latitude, centroid.longitude]}
              radius={6}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: color,
                fillOpacity: 1
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="font-bold text-gray-800">{centroid.corridor}</div>
                {status && (
                  <div className="text-xs text-gray-600 mt-1">
                    V/C Ratio: {status.vc_ratio === null ? 'Blocked' : status.vc_ratio.toFixed(2)}
                  </div>
                )}
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Render Glowing Incident Marker & Popup */}
        {selectedIncident && blockedCorridors.length > 0 && (() => {
          const blockedCentroid = corridorCentroids.find(c => blockedCorridors.includes(c.corridor));
          if (!blockedCentroid) return null;

          const glowingIconHtml = `
            <div class="relative flex items-center justify-center w-12 h-12">
              <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30"></div>
              <div class="absolute inset-2 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          `;

          const icon = L.divIcon({
            html: glowingIconHtml,
            className: '',
            iconSize: [48, 48],
            iconAnchor: [24, 24],
            popupAnchor: [0, -20],
          });

          return (
            <Marker 
              position={[blockedCentroid.latitude, blockedCentroid.longitude]}
              icon={icon}
            >
              <Tooltip permanent direction="right" offset={[24, -10]} className="bg-white/90 backdrop-blur-sm border border-red-200 shadow-lg !p-2 !rounded-lg">
                <div className="flex flex-col items-start min-w-[150px]">
                  <h3 className="font-bold text-gray-900 text-[11px] leading-tight uppercase tracking-wider">{selectedIncident.label || blockedCorridors[0]}</h3>
                  <p className="text-[10px] text-gray-600 mt-0.5 mb-2">{blockedCorridors.join(' / ')}</p>
                  <div className="flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded w-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 animate-pulse" />
                    Severe Congestion
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })()}

        {/* Render Stations (Toggled) */}
        {showStations && stations.map(station => (
          <CircleMarker
            key={station.police_station}
            center={[station.latitude, station.longitude]}
            radius={5}
            pathOptions={{ color: '#ffffff', weight: 1.5, fillColor: '#727038', fillOpacity: 1 }}
          >
            <Tooltip direction="top">{station.police_station} Station</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Traffic Density Legend */}
      <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-[1000] bg-white rounded-lg shadow-md border border-gray-200 p-3 md:p-4 w-40 md:w-48">
        <h4 className="text-[10px] font-bold text-gray-500 mb-2 md:mb-3 tracking-wider">TRAFFIC DENSITY</h4>
        <div className="space-y-1.5 md:space-y-2">
          <div className="flex items-center text-xs md:text-sm font-medium text-gray-700">
            <div className="w-6 h-[3px] rounded-full bg-status-green mr-2 md:mr-3" /> Smooth
          </div>
          <div className="flex items-center text-xs md:text-sm font-medium text-gray-700">
            <div className="w-6 h-[3px] rounded-full bg-status-yellow mr-2 md:mr-3" /> Moderate
          </div>
          <div className="flex items-center text-xs md:text-sm font-medium text-gray-700">
            <div className="w-6 h-[3px] rounded-full bg-status-red mr-2 md:mr-3" /> Congested / Blocked
          </div>
          <div className="flex items-center text-xs md:text-sm font-medium text-gray-700">
            <div className="w-6 h-[3px] rounded-full bg-gray-400 mr-2 md:mr-3" /> No Data
          </div>
        </div>
      </div>
    </div>
  );
}
