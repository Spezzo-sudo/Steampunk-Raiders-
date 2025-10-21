// FIX: Der zirkuläre Import von 'Resources' wurde entfernt, um den Namenskonflikt mit der lokalen Typdefinition zu beheben.
export enum ResourceType {
  Orichalkum = 'Orichalkum',
  Fokuskristalle = 'Fokuskristalle',
  Vitriol = 'Vitriol',
}

export type Resources = Record<ResourceType, number>;
export type Storage = Resources;

export interface Building {
  id: string;
  name: string;
  description: string;
  baseCost: Resources;
  costMultiplier: number;
  baseProduction: Resources;
  productionMultiplier?: number;
  baseEnergyConsumption?: number;
  energyConsumptionMultiplier?: number;
  baseEnergySupply?: number;
  energySupplyMultiplier?: number;
}

export interface Research {
  id: string;
  name: string;
  description: string;
  baseCost: Resources;
  costMultiplier: number;
}

export enum View {
  Uebersicht = 'Uebersicht',
  Gebaeude = 'Gebaeude',
  Forschung = 'Forschung',
  Werft = 'Werft',
  Galaxie = 'Galaxie',
}

export interface BuildQueueItem {
  entityId: string;
  level: number;
  startTime: number;
  endTime: number;
}

export interface AxialCoordinates {
  q: number;
  r: number;
}

export enum PlanetBiome {
  Messingwueste = 'Messingwueste',
  Aethermoor = 'Aethermoor',
  Dampfarchipel = 'Dampfarchipel',
  Uhrwerksteppe = 'Uhrwerksteppe',
  Glimmerkluft = 'Glimmerkluft',
}

export interface Planet {
  coordinates: string;
  name: string;
  player: string;
  isOwnPlanet: boolean;
  biome: PlanetBiome;
  axial: AxialCoordinates;
}
