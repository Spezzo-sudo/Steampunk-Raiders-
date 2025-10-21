import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { RESEARCH } from '@/constants';
import GameCard from '@/components/ui/GameCard';

const ResearchView: React.FC = () => {
  const research = useGameStore(state => state.research);
  const buildQueue = useGameStore(state => state.buildQueue);
  const canAfford = useGameStore(state => state.canAfford);
  const getUpgradeCost = useGameStore(state => state.getUpgradeCost);
  const getBuildTime = useGameStore(state => state.getBuildTime);
  const startUpgrade = useGameStore(state => state.startUpgrade);
  
  return (
    <div>
      <h2 className="text-4xl font-cinzel text-yellow-400 mb-6 border-b-2 border-yellow-800/50 pb-2">Forschungslabor</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(RESEARCH).map((tech) => {
          const currentLevel = research[tech.id] || 0;
          const targetLevel = buildQueue
            .filter(item => item.entityId === tech.id)
            .reduce((max, item) => Math.max(max, item.level), currentLevel);

          const nextLevel = targetLevel + 1;

          const costForNextUpgrade = getUpgradeCost(tech, nextLevel);
          const buildTime = getBuildTime(costForNextUpgrade);
          const isUpgrading = buildQueue.some(item => item.entityId === tech.id);
          const affordable = canAfford(costForNextUpgrade);

          return (
            <GameCard
              key={tech.id}
              name={tech.name}
              level={currentLevel}
              targetLevel={targetLevel}
              description={tech.description}
              upgradeCost={costForNextUpgrade}
              buildTime={buildTime}
              canAfford={affordable}
              onUpgrade={() => startUpgrade(tech)}
              isUpgrading={isUpgrading}
              queueLength={buildQueue.length}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ResearchView;
