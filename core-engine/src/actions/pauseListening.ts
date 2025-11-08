// import { ActionResult } from '@shared/types';
interface ActionResult {
  requestId: string;
  ok: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

import { EventEmitter } from 'events';

// Shared event emitter for signaling STT pause
// Person B (STT owner) will subscribe to this
export const sttControlEmitter = new EventEmitter();

/**
 * Pause voice recognition temporarily
 * Params: { duration_value?: number, duration_unit?: string, until?: string }
 */
export const pauseListening = async (params: any, requestId: string): Promise<ActionResult> => {
  const { duration_value, duration_unit, until } = params;
  
  try {
    let pauseDuration = 0; // milliseconds
    let message = 'Paused listening';
    
    if (duration_value && duration_unit) {
      // Convert to milliseconds
      const value = parseInt(duration_value);
      
      switch (duration_unit) {
        case 'seconds':
          pauseDuration = value * 1000;
          break;
        case 'minutes':
          pauseDuration = value * 60 * 1000;
          break;
        case 'hours':
          pauseDuration = value * 60 * 60 * 1000;
          break;
        default:
          pauseDuration = value * 60 * 1000; // Default to minutes
      }
      
      message = `Paused listening for ${value} ${duration_unit}`;
    } else if (until) {
      message = `Paused listening until ${until}`;
      pauseDuration = 5 * 60 * 1000; // Default 5 minutes
    } else {
      // No duration specified - pause for 1 minute default
      pauseDuration = 60 * 1000;
      message = 'Paused listening for 1 minute (default)';
    }
    
    // Emit pause event for STT worker (Person B will listen to this)
    sttControlEmitter.emit('pause', { duration: pauseDuration });
    
    console.log(`[pauseListening] ${message} (${pauseDuration}ms)`);
    
    return {
      requestId,
      ok: true,
      data: { 
        message,
        pauseDuration,
        resumeAt: Date.now() + pauseDuration
      },
      timestamp: Date.now()
    };
    
  } catch (err: any) {
    return {
      requestId,
      ok: false,
      error: `Failed to pause listening: ${err.message}`,
      timestamp: Date.now()
    };
  }
};