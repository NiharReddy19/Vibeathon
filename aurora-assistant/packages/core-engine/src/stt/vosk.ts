// File: packages/core-engine/src/stt/vosk.ts
// Purpose: Vosk speech recognition wrapper with streaming support

import vosk from 'vosk';
import { EventEmitter } from 'events';
import { VoskResult, STTConfig } from './types';
import { TranscriptEvent } from '@aurora/shared';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class VoskRecognizer extends EventEmitter {
  private model: vosk.Model | null = null;
  private recognizer: vosk.Recognizer | null = null;
  private isInitialized = false;

  constructor(private config: STTConfig) {
    super();
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Loading Vosk model...', { path: this.config.modelPath });
      
      // Set Vosk log level (0 = no logs, 1 = errors only, 2 = debug)
      vosk.setLogLevel(0);

      // Load the model
      this.model = new vosk.Model(this.config.modelPath);
      
      // Create recognizer
      this.recognizer = new vosk.Recognizer({
        model: this.model,
        sampleRate: this.config.sampleRate,
      });

      // Enable partial results for real-time feedback
      this.recognizer.setWords(true);

      this.isInitialized = true;
      logger.info('Vosk model loaded successfully');
    } catch (error: any) {
      logger.error('Failed to initialize Vosk:', { error: error.message });
      throw new Error(`Vosk initialization failed: ${error.message}`);
    }
  }

  /**
   * Process audio chunk and return recognition results
   */
  processAudio(audioChunk: Buffer): void {
    if (!this.isInitialized || !this.recognizer) {
      throw new Error('Vosk recognizer not initialized');
    }

    try {
      // Feed audio data to recognizer
      const endOfSpeech = this.recognizer.acceptWaveform(audioChunk);

      if (endOfSpeech) {
        // Final result available
        const resultStr = this.recognizer.result();
        const result: VoskResult = JSON.parse(resultStr);

        if (result.text && result.text.trim().length > 0) {
          const event: TranscriptEvent = {
            id: uuidv4(),
            timestamp: Date.now(),
            text: result.text.trim(),
            partial: false,
            confidence: this.calculateConfidence(result),
          };

          logger.debug('Final transcript:', { text: event.text });
          this.emit('transcript:final', event);
        }
      } else {
        // Partial result
        const partialStr = this.recognizer.partialResult();
        const partial: VoskResult = JSON.parse(partialStr);

        if (partial.partial && partial.partial.trim().length > 0) {
          const event: TranscriptEvent = {
            id: uuidv4(),
            timestamp: Date.now(),
            text: partial.partial.trim(),
            partial: true,
          };

          logger.debug('Partial transcript:', { text: event.text });
          this.emit('transcript:partial', event);
        }
      }
    } catch (error: any) {
      logger.error('Error processing audio:', { error: error.message });
      this.emit('error', error);
    }
  }

  /**
   * Calculate average confidence from word-level results
   */
  private calculateConfidence(result: VoskResult): number {
    if (!result.result || result.result.length === 0) {
      return 0.5; // Default confidence
    }

    const totalConf = result.result.reduce((sum, word) => sum + word.conf, 0);
    return totalConf / result.result.length;
  }

  /**
   * Finalize any pending recognition
   */
  finalize(): TranscriptEvent | null {
    if (!this.recognizer) return null;

    try {
      const finalStr = this.recognizer.finalResult();
      const result: VoskResult = JSON.parse(finalStr);

      if (result.text && result.text.trim().length > 0) {
        return {
          id: uuidv4(),
          timestamp: Date.now(),
          text: result.text.trim(),
          partial: false,
          confidence: this.calculateConfidence(result),
        };
      }
    } catch (error: any) {
      logger.error('Error in finalize:', { error: error.message });
    }

    return null;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.recognizer) {
      this.recognizer.free();
      this.recognizer = null;
    }
    if (this.model) {
      this.model.free();
      this.model = null;
    }
    this.isInitialized = false;
    logger.info('Vosk recognizer destroyed');
  }
}
