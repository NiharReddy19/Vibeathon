// File: packages/core-engine/src/stt/mic.ts
// Purpose: Microphone audio capture with configurable settings

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { AudioConfig, STTState } from './types';
import { logger } from '../utils/logger';

export class MicrophoneCapture extends EventEmitter {
  private recording: ChildProcess | null = null;
  private state: STTState = STTState.IDLE;

  constructor(private config: AudioConfig) {
    super();
  }

  /**
   * Start capturing audio from microphone
   */
  start(): void {
  if (this.state === STTState.LISTENING) {
    logger.warn('Microphone already active');
    return;
  }

  try {
    logger.info('Starting microphone capture...', this.config);

    let soxArgs: string[];

    // Windows-specific configuration
    if (process.platform === 'win32') {
      // Windows: Use waveaudio with default device
      soxArgs = [
        '-q', // quiet mode
        '-t', 'waveaudio', 'default', // Windows audio input
        '-t', 'raw', // output raw PCM
        '-r', this.config.sampleRate.toString(),
        '-c', this.config.channels.toString(),
        '-b', '16',
        '-e', 'signed-integer',
        '-', // output to stdout
      ];
    } else {
      // Linux/Mac: Use default device
      soxArgs = [
        '-q', // quiet mode
        '-d', // default input device
        '-t', 'raw', // output raw PCM
        '-r', this.config.sampleRate.toString(),
        '-c', this.config.channels.toString(),
        '-b', '16',
        '-e', 'signed-integer',
        '-', // output to stdout
      ];
    }

    // Spawn sox process
    const soxPath = process.platform === 'win32'
      ? 'C:\\Program Files (x86)\\sox-14-4-2\\sox.exe' // Your SoX path
      : this.config.recordProgram;

    this.recording = spawn(soxPath, soxArgs);

    this.recording.stdout?.on('data', (chunk: Buffer) => {
      this.emit('audio', chunk);
    });

    this.recording.stderr?.on('data', (data: Buffer) => {
      const message = data.toString();
      // Filter out SoX informational messages
      if (!message.includes('Input File') && !message.includes('Sample Rate')) {
        logger.warn('Microphone stderr:', { message });
      }
    });

    this.recording.on('exit', (code) => {
      logger.info('Microphone process exited', { code });
      this.state = STTState.IDLE;
      this.emit('end');
    });

    this.recording.on('error', (error) => {
      logger.error('Microphone error:', { error: error.message });
      this.state = STTState.ERROR;
      this.emit('error', error);
    });

    this.state = STTState.LISTENING;
    logger.info('Microphone capture started');
    this.emit('start');

  } catch (error: any) {
    logger.error('Failed to start microphone:', { error: error.message });
    this.state = STTState.ERROR;
    throw error;
  }
}

  /**
   * Stop capturing audio
   */
  stop(): void {
    if (!this.recording || this.state !== STTState.LISTENING) {
      logger.warn('No active microphone to stop');
      return;
    }

    logger.info('Stopping microphone capture...');
    
    // Send SIGTERM to gracefully close sox
    this.recording.kill('SIGTERM');
    
    // Fallback: force kill after 2 seconds
    setTimeout(() => {
      if (this.recording && !this.recording.killed) {
        this.recording.kill('SIGKILL');
      }
    }, 2000);

    this.recording = null;
    this.state = STTState.IDLE;
    this.emit('stop');
  }

  /**
   * Pause recording (not fully supported by sox)
   */
  pause(): void {
    if (this.state === STTState.LISTENING) {
      this.state = STTState.PAUSED;
      logger.info('Microphone paused');
    }
  }

  /**
   * Resume recording
   */
  resume(): void {
    if (this.state === STTState.PAUSED) {
      this.state = STTState.LISTENING;
      logger.info('Microphone resumed');
    }
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
}
