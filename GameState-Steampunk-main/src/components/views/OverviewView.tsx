import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { BUILDINGS, RESEARCH } from '@/constants';
import ProgressBar from '@/components/ui/ProgressBar';
import { BuildQueueItem } from '@/types';

const formatTime = (ms: number) => {
    if(ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

const QueueItem: React.FC<{item: BuildQueueItem}> = ({ item }) => {
    const now = Date.now();
    const isBuilding = now >= item.startTime;

    if (isBuilding) {
        const remainingTime = item.endTime - now;
        const totalTime = item.endTime - item.startTime;
        const progress = totalTime > 0 ? ((totalTime - remainingTime) / totalTime) * 100 : 100;

        return (
             <li className="list-none">
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-yellow-300">[In Arbeit] Stufe {item.level}</span>
                    <span className="font-mono">{formatTime(remainingTime)}</span>
                </div>
                <ProgressBar progress={progress} />
            </li>
        )
    }

    const duration = item.endTime - item.startTime;
    return (
        <li className="list-none opacity-70">
            <div className="flex justify-between text-sm">
                <span>[Wartend] Stufe {item.level}</span>
                <span className="font-mono">Dauer: {formatTime(duration)}</span>
            </div>
        </li>
    )
}


const OverviewView: React.FC = () => {
    const buildQueue = useGameStore((state) => state.buildQueue);
    const buildings = useGameStore((state) => state.buildings);
    const research = useGameStore((state) => state.research);

    // FIX: Explizite Typisierung von `groupedQueue`, um Inferenzfehler des Compilers zu beheben, die zu 'unknown'-Typen führten.
    const groupedQueue: Record<string, BuildQueueItem[]> = buildQueue.reduce((acc, item) => {
      if (!acc[item.entityId]) {
        acc[item.entityId] = [];
      }
      acc[item.entityId].push(item);
      return acc;
    }, {} as Record<string, BuildQueueItem[]>);
    
    return (
        <div>
            <h2 className="text-4xl font-cinzel text-yellow-400 mb-6 border-b-2 border-yellow-800/50 pb-2">Planetenübersicht</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 steampunk-glass steampunk-border p-6 rounded-lg flex items-center justify-center flex-col">
                     <img src="https://picsum.photos/seed/steampunkplanet/500/300" alt="Planet" className="rounded-full border-4 border-yellow-600/50 shadow-lg mb-4 h-48 w-48 object-cover"/>
                     <h3 className="text-3xl font-cinzel">Heimatplanet "Chronos Prime"</h3>
                     <p className="text-gray-400">Koordinaten: [1:1:1]</p>
                </div>
                <div className="steampunk-glass steampunk-border p-6 rounded-lg">
                    <h3 className="text-2xl font-cinzel text-yellow-400 mb-4">Bauschleife</h3>
                    {buildQueue.length > 0 ? (
                        <div className="space-y-6">
                           {Object.entries(groupedQueue).map(([entityId, items]) => {
                                const entity = BUILDINGS[entityId] || RESEARCH[entityId];
                                if (!entity) return null;

                        const isBuilding = 'baseProduction' in entity || entity.id === 'dampfkraftwerk';
                                const currentLevel = isBuilding ? (buildings[entityId] || 0) : (research[entityId] || 0);
                                const highestQueuedLevel = items[items.length - 1].level;

                                return (
                                    <div key={entityId}>
                                        <h4 className="font-cinzel text-lg text-yellow-200 mb-2 border-b border-yellow-800/30 pb-1">
                                            {entity.name} (Stufe {currentLevel} → {highestQueuedLevel})
                                        </h4>
                                        <ul className="space-y-3 pl-2">
                                            {items.map(item => <QueueItem key={item.level} item={item} />)}
                                        </ul>
                                    </div>
                                )
                           })}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center pt-8">Keine Aufträge in der Bauschleife.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewView;
