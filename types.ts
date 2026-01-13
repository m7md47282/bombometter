
export interface OrdnanceAnalysis {
  isExplosive: boolean;
  type: string;
  confidence: number;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  description: string;
  safetyProtocols: string[];
  componentsIdentified: string[];
  dimensionsEstimated: string;
}

export enum AppState {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
