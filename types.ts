export interface WordItem {
  id: string;
  text: string;
  emoji?: string;
  imageSrc?: string; // For user uploaded images
  enabled?: boolean; // For subset selection
}

export interface GameSettings {
  bpm: number;
  gridSize: number;
  vocabCategory: string;
  showEmojis: boolean;
  hideText: boolean;
  totalRounds: number;
}

export type AppMode = 'game' | 'flashcards';

export interface SchedulerState {
  currentRound: number;
  currentLoop: number;
  beatIndex: number;
  isIntermission: boolean;
  isLoopTransition: boolean;
}