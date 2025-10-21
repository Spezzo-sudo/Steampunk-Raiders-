
import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { View } from '@/types';
import OverviewView from '@/components/views/OverviewView';
import BuildingsView from '@/components/views/BuildingsView';
import ResearchView from '@/components/views/ResearchView';
import GalaxyView from '@/components/views/GalaxyView';

const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex items-center justify-center h-full">
        <div className="p-8 text-center steampunk-glass rounded-lg">
            <h2 className="text-3xl font-cinzel text-yellow-400 mb-4">{title}</h2>
            <p className="text-gray-400">Dieses Modul ist für das MVP noch nicht implementiert.</p>
        </div>
    </div>
);


const MainView: React.FC = () => {
  const activeView = useGameStore((state) => state.activeView);

  switch (activeView) {
    case View.Uebersicht:
      return <OverviewView />;
    case View.Gebaeude:
      return <BuildingsView />;
    case View.Forschung:
      return <ResearchView />;
    case View.Werft:
        return <PlaceholderView title="Werft" />;
    case View.Galaxie:
      return <GalaxyView />;
    default:
      return <OverviewView />;
  }
};

export default MainView;
