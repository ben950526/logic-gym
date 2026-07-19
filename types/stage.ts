export type StageUnlockStatus = "locked" | "available" | "cleared";

export interface PlanetStage {
  order: number;
  id: string;
  name: string;
  puzzleTitle: string;
  difficulty: string;
  zone?: number;
  zoneName?: string;
  topicType?: string;
  isBoss?: boolean;
  notes?: string;
}

export interface Planet {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  color: string;
  icon: string;
  unlockRule: string;
  stageCount: number;
  stages: PlanetStage[];
}

export interface GalaxyMap {
  version: string;
  theme: string;
  galaxy: {
    id: string;
    name: string;
    description: string;
  };
  planets: Planet[];
}

export interface StageViewModel extends PlanetStage {
  status: StageUnlockStatus;
  planetSlug: string;
  planetName: string;
}
