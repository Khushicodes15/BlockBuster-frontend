'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from './DashboardContext';
import { usePlaybookStream } from '@/lib/usePlaybookStream';
import { ChevronDown, CheckCircle, Clock, Volume2, ShieldAlert, ArrowRight, TrafficCone, MapPin, Users } from 'lucide-react';
import * as api from '@/lib/api';
import { BTPEmblem } from './TopBar';

export default function PlaybookPanel() {
  const { 
    selectedIncident, 
    incidents, 
    setSelectedIncident, 
    updateLocalIncidentPlaybook,
    refreshData 
  } = useDashboard();
  
  const { logs, isRunning, playbookResult, error, startStream } = usePlaybookStream();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  const [isDispatching, setIsDispatching] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);

  useEffect(() => {
    if (isRunning) setIsScriptOpen(true);
  }, [isRunning]);

  const playbook = selectedIncident?.playbook;
  const isMockIncident = selectedIncident?.id?.toString().startsWith("MOCK-");
  const isApproved = playbook?.judging_panel?.overall_recommendation === "APPROVE" && playbook?.judging_panel?.state === "PENDING_APPROVAL";

  const handleDispatch = async () => {
    if (!isApproved || !playbook) return;
    setIsDispatching(true);
    try {
      const advisory = await api.generateAdvisory(playbook);
      await api.dispatchSms(playbook, advisory.advisory || "Traffic Alert", ["+910000000000"]);
      
      if (playbook.nearest_officers && playbook.nearest_officers.length > 0) {
        const deployments = playbook.nearest_officers.map((o: any) => ({
          police_station: o.police_station,
          count: 1
        }));
        if (!isMockIncident) {
          await api.deployOfficers(selectedIncident.id, deployments);
        }
      }
      
      await refreshData();
      alert("Dispatched successfully!");
    } catch (err: any) {
      alert("Dispatch failed: " + err.message);
    } finally {
      setIsDispatching(false);
    }
  };

  // Trigger real /playbook-stream when playbook is null (works for both mock and real incidents)
  useEffect(() => {
    if (selectedIncident && selectedIncident.playbook === null && !isRunning) {
      startStream({
        blocked_corridors: selectedIncident.blocked_corridors,
        hour: selectedIncident.hour || new Date().getHours(),
        origin: "Mysore Road",
        destination: "CBD 2",
        capacity_remaining_pct: 0.0,
        red_threshold: 0.6,
        n_officers: 3
      });
    }
  }, [selectedIncident, isRunning, startStream]);

  // Attach playbook result to the incident
  useEffect(() => {
    if (playbookResult && selectedIncident && selectedIncident.playbook === null) {
      if (isMockIncident) {
        // Mock incidents don't exist on the backend — update state directly
        updateLocalIncidentPlaybook(selectedIncident.id, playbookResult);
      } else {
        // Real incidents — PATCH via API
        api.updateIncident(selectedIncident.id, { playbook: playbookResult }).then(() => {
          refreshData();
        }).catch(console.error);
      }
    }
  }, [playbookResult, selectedIncident, refreshData, isMockIncident, updateLocalIncidentPlaybook]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!selectedIncident) {
    return (
      <div className="w-full md:w-96 bg-card-bg border-l border-border-light flex flex-col items-center justify-center p-6 shrink-0 h-full">
        <div className="text-gray-400 font-medium">No Active Incidents</div>
      </div>
    );
  }

  const hasPlaybook = !!playbook;

  // Derive ETAs from real playbook data
  // Signal override & barricade steps don't have computed ETAs in the backend — use static estimates
  const signalEta = hasPlaybook ? "2 mins" : "--";
  const barricadeEta = hasPlaybook ? "5 mins" : "--";
  const marshalEta = playbook?.nearest_officers?.[0]?.eta_minutes
    ? `${Math.round(playbook.nearest_officers[0].eta_minutes)} mins`
    : hasPlaybook ? "8 mins" : "--";
  const advisoryEta = hasPlaybook
    ? (playbook?.diversion?.eta_minutes ? `${Math.round(playbook.diversion.eta_minutes)} mins` : "10 mins")
    : "--";

  const step1Complete = hasPlaybook && playbook?.network_state && playbook.network_state.length > 0;
  const step2Complete = hasPlaybook;
  const step3Complete = hasPlaybook && playbook?.nearest_officers && playbook.nearest_officers.length > 0;
  const step4Ready = hasPlaybook && playbook?.diversion?.path;

  return (
    <div className="w-full md:w-[400px] bg-card-bg border-l border-border-light flex flex-col shrink-0 h-full">
      
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-border-light">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded text-status-green flex items-center justify-center font-bold text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h2 className="font-bold text-xs md:text-sm tracking-wide text-gray-900">PLAYBOOK GENERATION ENGINE</h2>
          </div>
          <div className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-2 py-1">AI ASSISTED</div>
        </div>

        <div className="flex flex-col gap-2 mt-3 md:mt-4">
          <div className="text-sm font-medium text-gray-600 flex items-center">
            <span className="mr-2 shrink-0">Incident:</span>
            <span className="font-bold text-status-red truncate">{selectedIncident.label || selectedIncident.blocked_corridors?.[0] || 'Unknown'}</span>
          </div>
          <div className="relative w-full">
            <select 
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-1 pl-3 pr-8 rounded text-xs font-medium cursor-pointer outline-none focus:border-accent-olive"
              value={selectedIncident.id}
              onChange={(e) => {
                const inc = incidents.find(i => i.id.toString() === e.target.value);
                if (inc) setSelectedIncident(inc);
              }}
            >
              {incidents.map(inc => (
                <option key={inc.id} value={inc.id}>{inc.label || inc.blocked_corridors?.[0] || 'Incident'}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="p-4 md:p-6 border-b border-border-light flex-1 overflow-y-auto">
        <div className="space-y-5 md:space-y-6">
        
        {/* Step 1 — Signal Override */}
        <div className="flex items-start gap-3 md:gap-4 shrink-0">
          <div className="mt-1 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-50 shrink-0">
             <TrafficCone className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            {!step1Complete && <div className="text-[10px] font-bold text-gray-500 tracking-wider">STEP 1</div>}
            <div className="text-sm font-bold text-gray-900">Signal Override</div>
            {!step1Complete && <div className="text-xs text-gray-500 mt-0.5">Override signals in affected corridor</div>}
            {step1Complete && playbook.network_state && (
              <div className="mt-0.5 text-[11px] text-gray-500 font-medium">
                {playbook.network_state.filter((s: any) => s.vc_ratio === null || s.vc_ratio >= 0.9).length} corridors flagged
              </div>
            )}
          </div>
          <div className="text-center shrink-0">
            <div className="text-[10px] text-gray-500 font-bold">ETA</div>
            <div className="text-xs font-bold mb-1">{signalEta}</div>
            {step1Complete ? (
              <CheckCircle className="w-5 h-5 text-status-green mx-auto" />
            ) : isRunning ? (
              <Clock className="w-5 h-5 text-status-yellow mx-auto animate-pulse" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 mx-auto" />
            )}
          </div>
        </div>

        {/* Step 2 — Set Barricades */}
        <div className="flex items-start gap-3 md:gap-4 shrink-0">
          <div className="mt-1 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-50 shrink-0">
             <ShieldAlert className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            {!step2Complete && <div className="text-[10px] font-bold text-gray-500 tracking-wider">STEP 2</div>}
            <div className="text-sm font-bold text-gray-900">Set Barricades</div>
            {!step2Complete && <div className="text-xs text-gray-500 mt-0.5">Deploy barricades to block inflow</div>}
            {step2Complete && selectedIncident.blocked_corridors && (
              <div className="mt-0.5 text-[11px] text-gray-500 font-medium truncate">
                Blocking: {selectedIncident.blocked_corridors.join(', ')}
              </div>
            )}
          </div>
          <div className="text-center shrink-0">
            <div className="text-[10px] text-gray-500 font-bold">ETA</div>
            <div className="text-xs font-bold mb-1">{barricadeEta}</div>
            {step2Complete ? (
              <CheckCircle className="w-5 h-5 text-status-green mx-auto" />
            ) : step1Complete && isRunning ? (
              <Clock className="w-5 h-5 text-status-yellow mx-auto animate-pulse" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 mx-auto" />
            )}
          </div>
        </div>

        {/* Step 3 — Marshal Deployment */}
        <div className="flex items-start gap-3 md:gap-4 shrink-0">
          <div className="mt-1 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-50 shrink-0">
             <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            {!step3Complete && <div className="text-[10px] font-bold text-gray-500 tracking-wider">STEP 3</div>}
            <div className="text-sm font-bold text-gray-900">Marshal Deployment</div>
            {!step3Complete && <div className="text-xs text-gray-500 mt-0.5">Deploy marshals to key junctions</div>}
            {step3Complete && playbook.nearest_officers && (
              <div className="mt-0.5 space-y-0.5">
                {playbook.nearest_officers.slice(0, 3).map((o: any, i: number) => (
                  <div key={i} className="text-[11px] text-gray-500 font-medium truncate">
                    {o.police_station} — {o.eta_minutes?.toFixed(0) || '?'} min
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-center shrink-0">
            <div className="text-[10px] text-gray-500 font-bold">ETA</div>
            <div className="text-xs font-bold mb-1">{marshalEta}</div>
            {step3Complete ? (
              <CheckCircle className="w-5 h-5 text-status-green mx-auto" />
            ) : step2Complete && isRunning ? (
              <Clock className="w-5 h-5 text-status-yellow mx-auto animate-pulse" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 mx-auto" />
            )}
          </div>
        </div>

        {/* Step 4 — Public Advisory */}
        <div className="flex items-start gap-3 md:gap-4 shrink-0">
          <div className="mt-1 shrink-0"><Volume2 className="w-6 h-6 md:w-7 md:h-7 text-gray-600 ml-0.5" /></div>
          <div className="flex-1 min-w-0">
            {!step4Ready && <div className="text-[10px] font-bold text-gray-500 tracking-wider">STEP 4</div>}
            <div className="text-sm font-bold text-gray-900">Public Advisory</div>
            {!step4Ready && <div className="text-xs text-gray-500 mt-0.5">Send traffic advisory to commuters</div>}
            {step4Ready && playbook.diversion?.path && (
              <div className="mt-0.5 text-[11px] text-gray-500 font-medium truncate">
                Diversion: {playbook.diversion.path.join(' → ')}
              </div>
            )}
          </div>
          <div className="text-center shrink-0">
            <div className="text-[10px] text-gray-500 font-bold">ETA</div>
            <div className="text-xs font-bold mb-1">{advisoryEta}</div>
            {step4Ready ? (
              <Clock className="w-5 h-5 text-status-yellow mx-auto" />
            ) : step3Complete && isRunning ? (
              <Clock className="w-5 h-5 text-status-yellow mx-auto animate-pulse" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 mx-auto" />
            )}
          </div>
        </div>

        </div>
      </div>

      {/* Live Script Execution — real logs from POST /playbook-stream */}
      <div className={`flex flex-col border-b border-border-light transition-all ${isScriptOpen ? 'h-40 md:h-48' : ''}`}>
        <button 
          onClick={() => setIsScriptOpen(!isScriptOpen)}
          className="w-full flex justify-between items-center px-4 md:px-5 py-2.5 md:py-3 border-b border-border-light bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isScriptOpen ? 'rotate-180' : ''}`} />
            <div className="text-xs font-bold tracking-wide text-gray-700">LIVE SCRIPT EXECUTION</div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-status-green animate-pulse' : (hasPlaybook || logs.length > 0 ? 'bg-status-green' : 'bg-gray-300')}`} />
            <span className="text-[10px] font-bold text-gray-500">{isRunning ? 'RUNNING' : (hasPlaybook || logs.length > 0 ? 'COMPLETE' : 'IDLE')}</span>
          </div>
        </button>
        {isScriptOpen && (
          <div className="flex-1 p-3 md:p-4 bg-[#FAFAFA] overflow-y-auto font-mono text-[10px] md:text-[11px] leading-relaxed text-gray-600 relative">
            {logs.map((log, i) => {
              const msg = log.message || '';
              return (
                <div key={i} className="mb-1 flex">
                  <span className="text-gray-400 mr-2 md:mr-3 shrink-0">{log.timestamp}</span>
                  <span className={`${
                    msg.includes('[ OK ]') || msg.includes('OK') ? 'text-status-green' : 
                    msg.includes('IN PROGRESS') || msg.includes('progress') ? 'text-status-yellow' : 
                    msg.includes('PENDING') ? 'text-gray-400' :
                    ''
                  }`}>
                    {msg}
                  </span>
                </div>
              );
            })}
            {error && (
              <div className="mb-1 flex text-status-red">
                <span className="text-gray-400 mr-3 shrink-0">{new Date().toLocaleTimeString([], { hour12: false })}</span>
                <span>Stream error: {error}</span>
              </div>
            )}
            {!isRunning && logs.length === 0 && !error && (
               <div className="text-gray-400 italic">
                 {hasPlaybook ? 'Execution log successfully archived.' : 'Waiting for execution...'}
               </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>

      {/* Dispatch Button */}
      <div className="p-4 md:p-5 bg-gray-50 mt-auto">
        <button 
          onClick={handleDispatch}
          disabled={!isApproved || isDispatching}
          className={`w-full flex items-center justify-between p-3 md:p-4 rounded-lg text-white font-bold transition-all ${
            isApproved ? 'bg-[#2D2D2D] hover:bg-[#1a1a1a] cursor-pointer shadow-lg' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-white/10">
               <BTPEmblem size={36} />
            </div>
            <div className="text-left">
              <div className="text-xs md:text-sm tracking-wider">DISPATCH TO GROUND UNITS</div>
              <div className="text-[10px] font-normal opacity-80 mt-0.5">Deploy traffic police & response teams</div>
            </div>
          </div>
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0">
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
          </div>
        </button>
      </div>
      
    </div>
  );
}
