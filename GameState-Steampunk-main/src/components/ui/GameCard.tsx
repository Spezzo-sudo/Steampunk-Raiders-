import React from 'react';
import Tooltip from '@/components/ui/Tooltip';
import { Resources, ResourceType } from '@/types';
import { MAX_BUILD_QUEUE_LENGTH } from '@/constants';
import { useGameStore } from '@/store/gameStore';

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
  meta?: React.ReactNode;
}

const formatTime = (seconds: number) => {
  if (seconds < 0) {
    seconds = 0;
  }
  if (seconds >= 5940) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  }
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${secs}`;
};

const CostDisplay: React.FC<{ cost: Resources }> = ({ cost }) => (
  <dl className="grid grid-cols-1 gap-2 text-xs text-gray-200 min-[480px]:grid-cols-3">
    {cost[ResourceType.Orichalkum] > 0 && (
      <div className="flex flex-col items-center rounded-md bg-black/40 px-3 py-2">
        <dt className="font-semibold text-yellow-200">Orichalkum</dt>
        <dd className="font-mono text-sm">{cost[ResourceType.Orichalkum].toLocaleString('de-DE')}</dd>
      </div>
    )}
    {cost[ResourceType.Fokuskristalle] > 0 && (
      <div className="flex flex-col items-center rounded-md bg-black/40 px-3 py-2">
        <dt className="font-semibold text-yellow-200">Fokuskristalle</dt>
        <dd className="font-mono text-sm">{cost[ResourceType.Fokuskristalle].toLocaleString('de-DE')}</dd>
      </div>
    )}
    {cost[ResourceType.Vitriol] > 0 && (
      <div className="flex flex-col items-center rounded-md bg-black/40 px-3 py-2">
        <dt className="font-semibold text-yellow-200">Vitriol</dt>
        <dd className="font-mono text-sm">{cost[ResourceType.Vitriol].toLocaleString('de-DE')}</dd>
      </div>
    )}
  </dl>
);

const InfoChip: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-yellow-500/40 bg-yellow-900/30 text-[0.65rem] text-yellow-200">
    {label}
  </span>
);

/**
 * Vereinheitlichte Darstellung einer Ausbaubox für Gebäude oder Forschungselemente.
 */
const GameCard: React.FC<GameCardProps> = ({
  name,
  level,
  targetLevel,
  description,
  upgradeCost,
  buildTime,
  canAfford,
  onUpgrade,
  isUpgrading,
  queueLength,
  meta,
}) => {
  const queueIsFull = queueLength >= MAX_BUILD_QUEUE_LENGTH;
  const showResourceWarning = !canAfford;
  const resources = useGameStore((state) => state.resources);
  const missingResources = React.useMemo(() => {
    return (Object.values(ResourceType) as ResourceType[])
      .map((resource) => ({
        resource,
        missing: Math.max(0, upgradeCost[resource] - (resources[resource] ?? 0)),
      }))
      .filter((entry) => entry.missing > 0);
  }, [resources, upgradeCost]);
  const missingLabel =
    missingResources.length > 0
      ? missingResources
          .map((entry) => `${entry.resource}: ${entry.missing.toLocaleString('de-DE')}`)
          .join('\n')
      : 'Alle Ressourcen ausreichend verfügbar.';

  let buttonLabel = 'Ausbauen';
  if (isUpgrading) {
    buttonLabel = 'Weiter ausbauen';
  }
  if (queueIsFull) {
    buttonLabel = `Warteschlange voll (${MAX_BUILD_QUEUE_LENGTH})`;
  }

  return (
    <article className="flex min-h-[360px] flex-col gap-5 rounded-2xl border border-yellow-800/30 bg-black/50 p-5 shadow-lg backdrop-blur">
      <header className="border-b border-yellow-800/30 pb-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[clamp(1.2rem,1vw+1rem,1.6rem)] font-cinzel font-semibold text-yellow-300">{name}</h3>
          <span className="text-xs uppercase tracking-wide text-yellow-200">Ziel: Stufe {targetLevel + 1}</span>
        </div>
        <p className="mt-1 text-sm text-gray-300">
          Aktuell Stufe {level}
          {isUpgrading && targetLevel > level && (
            <span className="text-emerald-300"> → {targetLevel}</span>
          )}
        </p>
      </header>
      <div className="flex flex-1 flex-col gap-4">
        <p
          className="text-sm leading-relaxed text-gray-300"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {description}
        </p>
        {meta}
      </div>
      <footer className="space-y-4">
        <div className="space-y-3 text-center">
          <p className="text-sm font-cinzel text-gray-200">Kosten &amp; Bauzeit</p>
          <CostDisplay cost={upgradeCost} />
          <p className="text-xs text-gray-400">Bauzeit: {formatTime(buildTime)}</p>
        </div>
        <div className="space-y-2 text-center">
          <button
            type="button"
            onClick={onUpgrade}
            disabled={queueIsFull}
            className={`w-full rounded-md px-4 py-2 font-cinzel text-sm uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              queueIsFull
                ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                : showResourceWarning
                  ? 'bg-yellow-800/40 text-yellow-200 hover:bg-yellow-700/50'
                  : 'steampunk-button'
            }`}
          >
            {buttonLabel}
          </button>
          {showResourceWarning && (
            <div className="flex items-center justify-center gap-2 text-xs text-amber-200">
              <span>Nicht genug Ressourcen</span>
              <Tooltip
                content={missingResources.length > 0 ? (
                  <div className="space-y-1">
                    {missingResources.map((entry) => (
                      <p key={entry.resource} className="font-mono text-yellow-100">
                        {entry.resource}: {entry.missing.toLocaleString('de-DE')}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-yellow-100">{missingLabel}</p>
                )}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-yellow-700/40 bg-black/40 px-2 py-1 text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <InfoChip label="i" />
                  <span className="sr-only">Fehlende Ressourcen anzeigen</span>
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </footer>
    </article>
  );
};

export default GameCard;
