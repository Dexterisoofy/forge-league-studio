import React from 'react';
import { AuthModal } from './components/Auth/AuthModal';
import { CommunityHub } from './components/Community/CommunityHub';
import { CompetitionsHub } from './components/Competitions/CompetitionsHub';
import { Header } from './components/Layout/Header';
import { RegistryPanel } from './components/Registry/RegistryPanel';
import { SportCreatorPanel } from './components/Sports/SportCreatorPanel';
import { TeamStudio } from './components/TeamStudio/TeamStudio';
import { FranchiseVault } from './components/Vault/FranchiseVault';
import { AppProvider, useApp } from './context/AppContext';

const MainShell: React.FC = () => {
  const { activeTab, toast } = useApp();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {activeTab === 'studio' && <TeamStudio />}
        {activeTab === 'vault' && <FranchiseVault />}
        {activeTab === 'competitions' && <CompetitionsHub />}
        {activeTab === 'sports' && <SportCreatorPanel />}
        {activeTab === 'community' && <CommunityHub />}
        {activeTab === 'registry' && <RegistryPanel />}
      </main>

      <AuthModal />

      {toast && (
        <div className="fixed right-5 bottom-5 z-50 rounded-xl border border-amber-500/40 bg-slate-900/95 px-4 py-2.5 text-sm font-medium text-amber-200 shadow-2xl backdrop-blur">
          {toast}
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}

export default App;
