// File: packages/core-engine/src/stt/mic-windows.ts
// Purpose: Windows-compatible microphone capture using 'mic' package

import { EventEmitter } from 'events';
import { STTState } from './types';
import { logger } from '../utils/logger';

// @ts-ignore - No types available
import mic from 'mic';

export class WindowsMicrophoneCapture extends EventEmitter {
  private micInstance: any = null;
  private state: STTState = STTState.IDLE;
  private audioStream: any = null;

  constructor() {
    super();
  }

  start(): void {
    if (this.state === STTState.LISTENING) {
      logger.warn('Microphone already active');
      return;
    }

    try {
      logger.info('Starting Windows microphone capture...');

      // Configure microphone
      this.micInstance = mic({
        rate: '16000',
        channels: '1',
        debug: false,
        exitOnSilence: 0,
        encoding: 'signed-integer',
        bitwidth: '16'
      });

      this.audioStream = this.micInstance.getAudioStream();

      this.audioStream.on('data', (chunk: Buffer) => {
        this.emit('audio', chunk);
      });

      this.audioStream.on('error', (error: Error) => {
        logger.error('Microphone stream error:', error);
        this.state = STTState.ERROR;
        this.emit('error', error);
      });

      this.audioStream.on('silence', () => {
        logger.debug('Silence detected');
      });

      // Start recording
      this.micInstance.start();
      this.state = STTState.LISTENING;
      logger.info('Windows microphone capture started');
      this.emit('start');

    } catch (error: any) {
      logger.error('Failed to start Windows microphone:', error);
      this.state = STTState.ERROR;
      throw error;
    }
  }

  stop(): void {
    if (!this.micInstance || this.state !== STTState.LISTENING) {
      logger.warn('No active microphone to stop');
      return;
    }

    logger.info('Stopping Windows microphone capture...');
    
    try {
      this.micInstance.stop();
      this.audioStream = null;
      this.micInstance = null;
      this.state = STTState.IDLE;
      this.emit('stop');
      logger.info('Windows microphone stopped');
    } catch (error: any) {
      logger.error('Error stopping microphone:', error);
    }
  }

  getState(): STTState {
    return this.state;
  }

  isListening(): boolean {
    return this.state === STTState.LISTENING;
  }
}
