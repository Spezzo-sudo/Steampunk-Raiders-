import React from 'react';
// FIX: Die Typen-Importe wurden in einer Zeile zusammengefasst.
import { Resources, ResourceType } from '@/types';
import { MAX_BUILD_QUEUE_LENGTH } from '@/constants';

interface GameCardProps {
  name: string;
  level: number;
  targetLevel: number;
  description: string;
  upgradeCost: Resources;
  buildTime: number;
  canAfford: boolean;
  onUpgrade: () => void;
  isUpgrading: boolean;
  queueLength: number;
}

const formatTime = (seconds: number) => {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const CostDisplay: React.FC<{ cost: Resources }> = ({ cost }) => (
    <div className="flex justify-center space-x-4 text-xs mt-2 text-gray-300">
        {cost[ResourceType.Orichalkum] > 0 && <span>Or: {cost[ResourceType.Orichalkum].toLocaleString('de-DE')}</span>}
        {cost[ResourceType.Fokuskristalle] > 0 && <span>Kr: {cost[ResourceType.Fokuskristalle].toLocaleString('de-DE')}</span>}
        {cost[ResourceType.Vitriol] > 0 && <span>Vt: {cost[ResourceType.Vitriol].toLocaleString('de-DE')}</span>}
    </div>
);


const GameCard: React.FC<GameCardProps> = ({ name, level, targetLevel, description, upgradeCost, buildTime, canAfford, onUpgrade, isUpgrading, queueLength }) => {
  const queueIsFull = queueLength >= MAX_BUILD_QUEUE_LENGTH;
  const isDisabled = !canAfford || queueIsFull;

  let buttonText = 'Ausbauen';
  if (isUpgrading) {
    buttonText = 'Weiter ausbauen';
  }
  
  // Higher priority messages overwrite lower priority ones.
  if (!canAfford) {
    buttonText = 'Nicht genug Ressourcen';
  }
  if (queueIsFull) {
    buttonText = `Warteschlange voll (max. ${MAX_BUILD_QUEUE_LENGTH})`;
  }

  return (
    <div className="steampunk-glass steampunk-border p-4 rounded-lg flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-baseline border-b border-yellow-800/30 pb-2 mb-2">
            <h3 className="text-xl font-bold font-cinzel text-yellow-400">{name}</h3>
            <span className="text-lg font-cinzel">
              Stufe {level}
              {isUpgrading && targetLevel > level && <span className="text-green-400"> → {targetLevel}</span>}
            </span>
        </div>
        <p className="text-sm text-gray-400 min-h-[60px]">{description}</p>
      </div>
      <div className="mt-4 text-center">
        <div className="mb-2">
            <p className="text-sm text-gray-400 font-cinzel">Kosten für Stufe {targetLevel + 1}</p>
            <CostDisplay cost={upgradeCost} />
            <p className="text-xs text-gray-400 mt-1">Bauzeit: {formatTime(buildTime)}</p>
        </div>
        <button
          onClick={onUpgrade}
          disabled={isDisabled}
          className="w-full px-4 py-2 font-cinzel steampunk-button rounded-md"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default GameCard;
