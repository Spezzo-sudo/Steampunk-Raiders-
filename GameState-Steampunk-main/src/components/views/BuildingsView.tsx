import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { BUILDINGS } from '@/constants';
import GameCard from '@/components/ui/GameCard';

const BuildingsView: React.FC = () => {
  const buildings = useGameStore(state => state.buildings);
  const buildQueue = useGameStore(state => state.buildQueue);
  const canAfford = useGameStore(state => state.canAfford);
  const getUpgradeCost = useGameStore(state => state.getUpgradeCost);
  const getBuildTime = useGameStore(state => state.getBuildTime);
  const startUpgrade = useGameStore(state => state.startUpgrade);

  return (
    <div>
      <h2 className="text-4xl font-cinzel text-yellow-400 mb-6 border-b-2 border-yellow-800/50 pb-2">Gebäudeausbau</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(BUILDINGS).map((building) => {
          const currentLevel = buildings[building.id] || 0;
          const targetLevel = buildQueue
            .filter(item => item.entityId === building.id)
            .reduce((max, item) => Math.max(max, item.level), currentLevel);

          const nextLevel = targetLevel + 1;

          const costForNextUpgrade = getUpgradeCost(building, nextLevel);
          const buildTime = getBuildTime(costForNextUpgrade);
          const isUpgrading = buildQueue.some(item => item.entityId === building.id);
          const affordable = canAfford(costForNextUpgrade);

          return (
            <GameCard
              key={building.id}
              name={building.name}
              level={currentLevel}
              targetLevel={targetLevel}
              description={building.description}
              upgradeCost={costForNextUpgrade}
              buildTime={buildTime}
              canAfford={affordable}
              onUpgrade={() => startUpgrade(building)}
              isUpgrading={isUpgrading}
              queueLength={buildQueue.length}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BuildingsView;
