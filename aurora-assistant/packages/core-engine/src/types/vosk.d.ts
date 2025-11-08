// File: packages/core-engine/src/types/vosk.d.ts
// Purpose: TypeScript declarations for vosk module (no official @types available)

declare module 'vosk' {
  export class Model {
    constructor(modelPath: string);
    free(): void;
  }

  export interface RecognizerConfig {
    model: Model;
    sampleRate: number;
  }

  export class Recognizer {
    constructor(config: RecognizerConfig);
    
    /**
     * Accept waveform data for recognition
     * @param data Audio buffer (PCM 16-bit signed int)
     * @returns true if silence detected (final result available), false otherwise
     */
    acceptWaveform(data: Buffer): boolean;
    
    /**
     * Get partial recognition result (during speech)
     */
    partialResult(): string;
    
    /**
     * Get final recognition result (after silence/end of speech)
     */
    result(): string;
    
    /**
     * Get final result and finalize recognizer
     */
    finalResult(): string;
    
    /**
     * Enable word-level timestamps and confidence
     */
    setWords(enable: boolean): void;
    
    /**
     * Set maximum number of alternatives
     */
    setMaxAlternatives(max: number): void;
    
    /**
     * Free recognizer resources
     */
    free(): void;
  }

  export class SpeakerModel {
    constructor(modelPath: string);
    free(): void;
  }

  /**
   * Set Vosk logging level
   * @param level 0 = no logs, 1 = errors only, 2 = all logs
   */
  export function setLogLevel(level: number): void;
}
