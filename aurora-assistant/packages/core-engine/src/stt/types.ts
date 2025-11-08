// File: packages/core-engine/src/stt/types.ts
// Purpose: Type definitions for speech-to-text module

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  threshold: number;
  silence: string;
  recordProgram: 'sox' | 'rec' | 'arecord';
  device?: string;
}

export interface VoskResult {
  partial?: string;
  text?: string;
  result?: Array<{
    conf: number;
    end: number;
    start: number;
    word: string;
  }>;
}

export interface STTConfig {
  modelPath: string;
  sampleRate: number;
}

export enum STTState {
  IDLE = 'idle',
  LISTENING = 'listening',
  PAUSED = 'paused',
  ERROR = 'error',
}
