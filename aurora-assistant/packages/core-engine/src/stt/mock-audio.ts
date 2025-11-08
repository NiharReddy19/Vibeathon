// File: packages/core-engine/src/stt/mock-audio.ts
// Purpose: Simulate microphone input for demo/testing

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export class MockAudioStream extends EventEmitter {
  private interval: NodeJS.Timeout | null = null;
  private isActive = false;
  
  // Simulated voice commands for demo
  private demoCommands = [
    'open vscode',
    'search for project files',
    'list all windows',
    'create recipe from history',
    'pause listening for five seconds',
  ];
  
  private commandIndex = 0;

  start(): void {
    if (this.isActive) {
      logger.warn('Mock audio already active');
      return;
    }

    logger.info('🎭 Starting MOCK audio stream (demo mode)');
    this.isActive = true;

    // Simulate speaking every 5 seconds
    this.interval = setInterval(() => {
      const command = this.demoCommands[this.commandIndex];
      this.commandIndex = (this.commandIndex + 1) % this.demoCommands.length;

      logger.info(`🎤 [DEMO] Simulating voice: "${command}"`);
      
      // Emit the command as "audio" for processing
      this.emit('command', command);
    }, 5000);

    this.emit('start');
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isActive = false;
    logger.info('Mock audio stopped');
    this.emit('stop');
  }

  // Manually trigger a command (for API testing)
  triggerCommand(text: string): void {
    logger.info(`🎤 [MANUAL] Triggering command: "${text}"`);
    this.emit('command', text);
  }
}