// File: packages/core-engine/src/stt/manager.ts
// Add after imports, before the class definition

import { MockAudioStream } from './mock-audio';
import { EventEmitter } from 'events';
import { MicrophoneCapture } from './mic';
import { VoskRecognizer } from './vosk';
import { AudioConfig, STTConfig, STTState } from './types';
import { TranscriptEvent } from '@aurora/shared';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Check if in mock mode
const USE_MOCK_AUDIO = process.env.STT_MOCK_MODE === 'true';

export class STTManager extends EventEmitter {
  private mic: MicrophoneCapture | null = null;
  private recognizer: VoskRecognizer | null = null;
  private state: STTState = STTState.IDLE;
  private isInitialized = false;

  /**
   * Initialize STT components (model loading)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('STT Manager already initialized');
      return;
    }

    try {
      logger.info('Initializing STT Manager...');

      // Resolve model path relative to project root
      const modelPath = path.resolve(__dirname, '../../', config.modelDir);
      logger.info('Using model path:', { modelPath });

      // Initialize Vosk recognizer
      const sttConfig: STTConfig = {
        modelPath,
        sampleRate: 16000,
      };

      this.recognizer = new VoskRecognizer(sttConfig);
      await this.recognizer.initialize();

      // Set up recognizer event handlers
      this.recognizer.on('transcript:partial', (event: TranscriptEvent) => {
        this.emit('transcript:partial', event);
      });

      this.recognizer.on('transcript:final', (event: TranscriptEvent) => {
        this.emit('transcript:final', event);
      });

      this.recognizer.on('error', (error: Error) => {
        logger.error('Recognizer error:', error);
        this.emit('error', error);
      });

      this.isInitialized = true;
      logger.info('STT Manager initialized successfully');
    } catch (error: any) {
      logger.error('Failed to initialize STT Manager:', error);
      throw error;
    }
  }

  /**
   * Start listening (microphone + recognition)
   */
  async startListening(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('STT Manager not initialized. Call initialize() first.');
    }

    if (this.state === STTState.LISTENING) {
      logger.warn('Already listening');
      return;
    }

    try {
      logger.info('Starting STT listening...');

      // DEMO MODE: Use mock audio instead of real microphone
      if (USE_MOCK_AUDIO) {
        logger.info('🎭 Running in MOCK MODE - simulating voice commands');
        
        const mockStream = new MockAudioStream();
        
        mockStream.on('command', (text: string) => {
          // Simulate partial transcript
          const partialEvent: TranscriptEvent = {
            id: uuidv4(),
            timestamp: Date.now(),
            text: text,
            partial: true,
          };
          this.emit('transcript:partial', partialEvent);

          // Simulate final transcript after 1 second
          setTimeout(() => {
            const finalEvent: TranscriptEvent = {
              id: uuidv4(),
              timestamp: Date.now(),
              text: text,
              partial: false,
              confidence: 0.95,
            };
            this.emit('transcript:final', finalEvent);
          }, 1000);
        });

        mockStream.start();
        (this as any).mockStream = mockStream; // Store reference
        
        this.state = STTState.LISTENING;
        this.emit('listening');
        logger.info('Mock STT listening started');
        return;
      }

      // REAL MODE: Use actual microphone (original code)
      const audioConfig: AudioConfig = {
        sampleRate: 16000,
        channels: 1,
        threshold: 0.5,
        silence: '1.0',
        recordProgram: 'sox',
      };

      this.mic = new MicrophoneCapture(audioConfig);

      this.mic.on('audio', (chunk: Buffer) => {
        if (this.recognizer && this.state === STTState.LISTENING) {
          this.recognizer.processAudio(chunk);
        }
      });

      this.mic.on('error', (error: Error) => {
        logger.error('Microphone error:', error);
        this.state = STTState.ERROR;
        this.emit('error', error);
      });

      this.mic.on('end', () => {
        logger.info('Microphone ended');
        this.state = STTState.IDLE;
        this.emit('stopped');
      });

      this.mic.start();
      this.state = STTState.LISTENING;
      this.emit('listening');

      logger.info('Real STT listening started successfully');
    } catch (error: any) {
      logger.error('Failed to start listening:', error);
      this.state = STTState.ERROR;
      throw error;
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    // Handle mock mode
    if ((this as any).mockStream) {
      logger.info('Stopping mock audio stream');
      (this as any).mockStream.stop();
      (this as any).mockStream = null;
      this.state = STTState.IDLE;
      this.emit('stopped');
      return;
    }

    // Original code for real microphone
    if (!this.mic || this.state !== STTState.LISTENING) {
      logger.warn('Not currently listening');
      return;
    }

    logger.info('Stopping STT listening...');

    try {
      this.mic.stop();

      if (this.recognizer) {
        const finalEvent = this.recognizer.finalize();
        if (finalEvent) {
          this.emit('transcript:final', finalEvent);
        }
      }

    this.mic = null;
    this.state = STTState.IDLE;
    this.emit('stopped');

    logger.info('STT listening stopped');
  } catch (error: any) {
    logger.error('Error stopping STT:', error);
    this.state = STTState.ERROR;
    throw error;
  }
}

  /**
   * Pause listening (for temporary interruptions)
   */
  pauseListening(durationMs?: number): void {
    if (this.state !== STTState.LISTENING) {
      logger.warn('Cannot pause - not listening');
      return;
    }

    logger.info('Pausing STT listening', { durationMs });
    this.state = STTState.PAUSED;
    this.emit('paused');

    // Auto-resume after duration if specified
    if (durationMs) {
      setTimeout(() => {
        if (this.state === STTState.PAUSED) {
          this.resumeListening();
        }
      }, durationMs);
    }
  }

  /**
   * Resume listening after pause
   */
  resumeListening(): void {
    if (this.state !== STTState.PAUSED) {
      logger.warn('Cannot resume - not paused');
      return;
    }

    logger.info('Resuming STT listening');
    this.state = STTState.LISTENING;
    this.emit('resumed');
  }

  /**
   * Get current state
   */
  getState(): STTState {
    return this.state;
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return this.state === STTState.LISTENING;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    logger.info('Destroying STT Manager...');

    if (this.mic) {
      this.mic.stop();
      this.mic = null;
    }

    if (this.recognizer) {
      this.recognizer.destroy();
      this.recognizer = null;
    }

    this.state = STTState.IDLE;
    this.isInitialized = false;
    this.removeAllListeners();

    logger.info('STT Manager destroyed');
  }
}
