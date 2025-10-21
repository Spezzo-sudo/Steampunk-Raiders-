import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  ResourceType,
  Resources,
  Storage,
  View,
  Building,
  Research,
  BuildQueueItem,
} from '@/types';
import {
  INITIAL_RESOURCES,
  INITIAL_STORAGE,
  BUILDINGS,
  RESEARCH,
  TICK_INTERVAL,
  SERVER_SPEED,
  INITIAL_BUILDING_LEVELS,
  INITIAL_RESEARCH_LEVELS,
  MAX_BUILD_QUEUE_LENGTH,
} from '@/constants';
import { calculateKesseldruck, calculateResourceProductionPerTick } from '@/lib/economy';

type GameState = {
  resources: Resources;
  storage: Storage;
  kesseldruck: {
    capacity: number;
    consumption: number;
    net: number;
    efficiency: number;
  };
  buildings: Record<string, number>;
  research: Record<string, number>;
  activeView: View;
  buildQueue: BuildQueueItem[];
};

type GameActions = {
  setView: (view: View) => void;
  gameTick: () => void;
  canAfford: (cost: Resources) => boolean;
  getUpgradeCost: (entity: Building | Research, targetLevel: number) => Resources;
  getBuildTime: (cost: Resources) => number;
  startUpgrade: (entity: Building | Research) => void;
};

const RESOURCE_TYPES = Object.values(ResourceType) as ResourceType[];

const createInitialKesseldruck = () => calculateKesseldruck(INITIAL_BUILDING_LEVELS);

/**
 * Central Zustand store that manages the client-side simulation and progression state.
 */
export const useGameStore = create<GameState & GameActions>()(
  immer((set, get) => ({
    resources: { ...INITIAL_RESOURCES },
    storage: { ...INITIAL_STORAGE },
    kesseldruck: { ...createInitialKesseldruck() },
    buildings: { ...INITIAL_BUILDING_LEVELS },
    research: { ...INITIAL_RESEARCH_LEVELS },
    activeView: View.Uebersicht,
    buildQueue: [],

    setView: (view) => set({ activeView: view }),
    
    canAfford: (cost) => {
      const { resources } = get();
      return (
        resources[ResourceType.Orichalkum] >= cost[ResourceType.Orichalkum] &&
        resources[ResourceType.Fokuskristalle] >= cost[ResourceType.Fokuskristalle] &&
        resources[ResourceType.Vitriol] >= cost[ResourceType.Vitriol]
      );
    },

    getUpgradeCost: (entity, targetLevel) => {
      const cost: Resources = {
        [ResourceType.Orichalkum]: 0,
        [ResourceType.Fokuskristalle]: 0,
        [ResourceType.Vitriol]: 0,
      };
      const exponent = Math.max(0, targetLevel - 1);
      const multiplier = Math.pow(entity.costMultiplier, exponent);
      cost[ResourceType.Orichalkum] = Math.floor(entity.baseCost[ResourceType.Orichalkum] * multiplier);
      cost[ResourceType.Fokuskristalle] = Math.floor(entity.baseCost[ResourceType.Fokuskristalle] * multiplier);
      cost[ResourceType.Vitriol] = Math.floor(entity.baseCost[ResourceType.Vitriol] * multiplier);
      return cost;
    },
    
    getBuildTime: (cost) => {
      const totalCost =
        cost[ResourceType.Orichalkum] +
        cost[ResourceType.Fokuskristalle] * 2 +
        cost[ResourceType.Vitriol] * 3;
      const timeInSeconds = Math.max(5, Math.floor(totalCost / 10 / SERVER_SPEED));
      return timeInSeconds;
    },

    startUpgrade: (entity) => {
      set((state) => {
        const isBuilding = 'baseProduction' in entity || entity.id === 'dampfkraftwerk';
        const currentLevel = isBuilding ? state.buildings[entity.id] || 0 : state.research[entity.id] || 0;
        
        const lastQueuedLevel = state.buildQueue
            .filter(item => item.entityId === entity.id)
            .reduce((max, item) => Math.max(max, item.level), currentLevel);

        const nextLevel = lastQueuedLevel + 1;

        const cost = get().getUpgradeCost(entity, nextLevel);
        if (!get().canAfford(cost) || state.buildQueue.length >= MAX_BUILD_QUEUE_LENGTH) return;

        state.resources[ResourceType.Orichalkum] -= cost[ResourceType.Orichalkum];
        state.resources[ResourceType.Fokuskristalle] -= cost[ResourceType.Fokuskristalle];
        state.resources[ResourceType.Vitriol] -= cost[ResourceType.Vitriol];

        const buildTime = get().getBuildTime(cost);
        const now = Date.now();
        const lastItemEndTime = state.buildQueue.length > 0 ? state.buildQueue[state.buildQueue.length - 1].endTime : now;
        const startTime = Math.max(now, lastItemEndTime);
        const endTime = startTime + buildTime * 1000;

        state.buildQueue.push({ entityId: entity.id, level: nextLevel, startTime, endTime });
      });
    },

    gameTick: () => {
      set((state) => {
        // 1. Process build queue
        const now = Date.now();
        const finishedItems = state.buildQueue.filter((item) => now >= item.endTime);
        
        if (finishedItems.length > 0) {
            finishedItems.forEach(item => {
                const entity = BUILDINGS[item.entityId] || RESEARCH[item.entityId];
                if (!entity) {
                  console.error(`Could not find entity with ID: ${item.entityId} in build queue.`);
                  return; // Skip this item
                }
                const isBuilding = 'baseProduction' in entity || entity.id === 'dampfkraftwerk';
                if (isBuilding) {
                    state.buildings[item.entityId] = item.level;
                } else {
                    state.research[item.entityId] = item.level;
                }
            });
            state.buildQueue = state.buildQueue.filter((item) => now < item.endTime);
        }

        // 2. Calculate energy production and consumption
        const kesseldruckState = calculateKesseldruck(state.buildings);
        state.kesseldruck.capacity = kesseldruckState.capacity;
        state.kesseldruck.consumption = kesseldruckState.consumption;
        state.kesseldruck.net = kesseldruckState.net;
        state.kesseldruck.efficiency = kesseldruckState.efficiency;

        const income = calculateResourceProductionPerTick(
          state.buildings,
          SERVER_SPEED,
          kesseldruckState.efficiency
        );

        (RESOURCE_TYPES as ResourceType[]).forEach((resource) => {
          const nextAmount = state.resources[resource] + income[resource];
          state.resources[resource] = Math.min(state.storage[resource], nextAmount);
        });
      });
    },
  }))
);
