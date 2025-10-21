import React from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import Tooltip from '@/components/ui/Tooltip';
import { calculateResourceProductionPerTick } from '@/lib/economy';
import { SERVER_SPEED } from '@/constants';
import { useGameStore } from '@/store/gameStore';
import { ResourceType } from '@/types';

const numberFormatter = new Intl.NumberFormat('de-DE');

/**
 * Formatiert eine Zahl für die Ressourcenausgabe und schneidet Nachkommastellen ab.
 */
const formatNumber = (value: number): string => numberFormatter.format(Math.floor(value));

const formatRate = (value: number): string => {
  const rounded = Math.round(value);
  const prefix = rounded > 0 ? '+' : '';
  return `${prefix}${numberFormatter.format(rounded)}/h`;
};

const formatBarValue = (value: number): string => `${formatNumber(value)} bar`;

const InfoBadge: React.FC<{ label: string }> = ({ label }) => (
  <span className="rounded-full border border-yellow-700/60 bg-yellow-900/40 px-2 py-0.5 font-cinzel text-[0.65rem] uppercase tracking-wide text-yellow-200">
    {label}
  </span>
);

const InfoButton: React.FC<{ label: string }> = ({ label }) => (
  <button
    type="button"
    aria-label={label}
    className="flex h-6 w-6 items-center justify-center rounded-full border border-yellow-500/40 bg-black/60 text-xs text-yellow-200 transition-colors hover:bg-yellow-800/40 focus:outline-none focus:ring-2 focus:ring-yellow-400"
  >
    i
  </button>
);

const ManometerIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    className="text-yellow-300"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 12L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M11 3h2v3h-2z" fill="currentColor" />
    <path d="M4.5 12.5h3v1h-3z" fill="currentColor" />
    <path d="M12.5 18.5h-1v2h1z" fill="currentColor" />
    <path d="M16.5 13.5h3v-1h-3z" fill="currentColor" />
  </svg>
);

interface ResourceDisplayProps {
  type: ResourceType;
  current: number;
  capacity: number;
  productionPerHour: number;
}

/**
 * Zeigt eine einzelne Ressource inklusive Lagerstand, Auslastung und stündlicher Produktion an.
 */
const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  type,
  current,
  capacity,
  productionPerHour,
}) => {
  const fillPercent = capacity > 0 ? Math.min(100, (current / capacity) * 100) : 0;
  const isNearlyFull = capacity > 0 && current >= capacity * 0.95;
  const textColor = isNearlyFull ? 'text-red-300' : 'text-yellow-100';
  const freeStorage = Math.max(0, capacity - current);
  const tooltipContent = (
    <div className="space-y-1">
      <p className="font-cinzel text-[0.75rem] uppercase tracking-wide text-yellow-200">{type}</p>
      <dl className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-300">Produktion/h</dt>
          <dd className="font-mono text-yellow-100">{formatRate(productionPerHour)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-300">Lagerkapazität</dt>
          <dd className="font-mono text-yellow-100">{formatNumber(capacity)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-300">Freier Speicher</dt>
          <dd className="font-mono text-yellow-100">{formatNumber(freeStorage)}</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-xl bg-black/30 p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[clamp(0.9rem,0.8vw+0.8rem,1.1rem)] font-cinzel uppercase tracking-wide">{type}</span>
          <Tooltip content={tooltipContent}>
            <InfoButton label={`${type}-Details anzeigen`} />
          </Tooltip>
        </div>
        <span className={`text-sm font-semibold ${textColor}`}>
          {formatNumber(current)} / {formatNumber(capacity)}
        </span>
      </div>
      <ProgressBar progress={fillPercent} />
      <div className="grid grid-cols-1 gap-2 text-xs text-gray-300 min-[480px]:grid-cols-2">
        <div className="flex items-center justify-between gap-2">
          <span>Produktion</span>
          <span className="font-semibold text-emerald-200">{formatRate(productionPerHour)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Freier Speicher</span>
          <span>{formatNumber(freeStorage)}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Visualisiert die aktuelle Energieproduktion und Effizienz des Kesseldrucks.
 */
const KesseldruckDisplay: React.FC = () => {
  const { capacity, consumption, net, efficiency } = useGameStore((state) => state.kesseldruck);
  const demandRatio = capacity > 0 ? (consumption / capacity) * 100 : 0;
  const statusColor = net >= 0 ? 'text-emerald-300' : 'text-red-400';
  const gaugePercent = Math.min(100, Math.max(0, demandRatio));
  const tooltip = (
    <div className="space-y-1">
      <p className="flex items-center gap-2 font-cinzel text-[0.75rem] uppercase tracking-wide text-yellow-200">
        <InfoBadge label="Kessel" /> Energie-Status
      </p>
      <dl className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-300">Kapazität</dt>
          <dd className="font-mono text-yellow-100">{formatBarValue(capacity)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-300">Verbrauch</dt>
          <dd className="font-mono text-yellow-100">{formatBarValue(consumption)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-300">Netto</dt>
          <dd className={`font-mono ${statusColor}`}>{formatBarValue(net)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-gray-300">Effizienz</dt>
          <dd className="font-mono text-yellow-100">{Math.round(Math.min(1, Math.max(0, efficiency)) * 100)}%</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-xl bg-black/30 p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-[clamp(0.9rem,0.8vw+0.8rem,1.1rem)] font-cinzel uppercase tracking-wide">
            <ManometerIcon />
            Kesseldruck <span className="text-xs text-gray-400">(bar)</span>
          </span>
          <Tooltip content={tooltip}>
            <InfoButton label="Kesseldruck-Details anzeigen" />
          </Tooltip>
        </div>
        <span className="text-sm text-yellow-100">
          {formatBarValue(consumption)} / {formatBarValue(capacity)}
        </span>
      </div>
      <ProgressBar progress={gaugePercent} />
      <div className="grid grid-cols-1 gap-2 text-xs text-gray-300 min-[480px]:grid-cols-2">
        <div className="flex items-center justify-between gap-2">
          <span className={statusColor}>{net >= 0 ? 'Überschuss' : 'Defizit'}</span>
          <span className={statusColor}>{formatBarValue(Math.abs(net))}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Effizienz</span>
          <span>{Math.round(Math.min(1, Math.max(0, efficiency)) * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Die obere Leiste der Benutzeroberfläche mit Ressourcen und Energieübersicht.
 */
const TopBar: React.FC = () => {
  const { resources, storage, buildings, kesseldruck } = useGameStore((state) => ({
    resources: state.resources,
    storage: state.storage,
    buildings: state.buildings,
    kesseldruck: state.kesseldruck,
  }));

  const productionPerSecond = React.useMemo(
    () => calculateResourceProductionPerTick(buildings, SERVER_SPEED, kesseldruck.efficiency),
    [buildings, kesseldruck.efficiency],
  );

  const productionPerHour: Record<ResourceType, number> = React.useMemo(
    () => ({
      [ResourceType.Orichalkum]: productionPerSecond[ResourceType.Orichalkum] * 3600,
      [ResourceType.Fokuskristalle]: productionPerSecond[ResourceType.Fokuskristalle] * 3600,
      [ResourceType.Vitriol]: productionPerSecond[ResourceType.Vitriol] * 3600,
    }),
    [productionPerSecond],
  );

  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ResourceDisplay
        type={ResourceType.Orichalkum}
        current={resources[ResourceType.Orichalkum]}
        capacity={storage[ResourceType.Orichalkum]}
        productionPerHour={productionPerHour[ResourceType.Orichalkum]}
      />
      <ResourceDisplay
        type={ResourceType.Fokuskristalle}
        current={resources[ResourceType.Fokuskristalle]}
        capacity={storage[ResourceType.Fokuskristalle]}
        productionPerHour={productionPerHour[ResourceType.Fokuskristalle]}
      />
      <ResourceDisplay
        type={ResourceType.Vitriol}
        current={resources[ResourceType.Vitriol]}
        capacity={storage[ResourceType.Vitriol]}
        productionPerHour={productionPerHour[ResourceType.Vitriol]}
      />
      <KesseldruckDisplay />
    </div>
  );
};

export default TopBar;
