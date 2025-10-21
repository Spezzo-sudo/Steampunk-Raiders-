import React from 'react';
import { useGameTick } from '@/hooks/useGameTick';
import LeftNav from '@/components/layout/LeftNav';
import MainView from '@/components/layout/MainView';
import TopBar from '@/components/layout/TopBar';

/**
 * Die Hauptkomponente der Anwendung.
 * Sie initialisiert den Game-Tick und rendert das Hauptlayout,
 * das aus der linken Navigation, der oberen Leiste und der Hauptansicht besteht.
 */
const App: React.FC = () => {
  // Initialisiert die Spiel-Logikschleife.
  useGameTick();

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      {/* Hintergrundbild mit Unschärfe und Verdunkelung */}
      <div 
        className="fixed inset-0 bg-cover bg-center" 
        style={{backgroundImage: "url('https://picsum.photos/seed/steampunkbg/1920/1080')", filter: 'blur(4px) brightness(0.4)'}}
      ></div>
      <div className="relative z-10 flex h-screen">
        <LeftNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <MainView />
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
