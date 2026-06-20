import React from 'react';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import AlertTicker from '@/components/AlertTicker';
import { DashboardProvider } from '@/components/DashboardContext';
import { BackendOfflineBanner } from '@/components/BackendOfflineBanner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        <BackendOfflineBanner />
        <TopBar />
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          <Sidebar />
          <main className="flex-1 overflow-auto md:overflow-hidden relative">
            {children}
          </main>
        </div>
        <AlertTicker />
      </div>
    </DashboardProvider>
  );
}
