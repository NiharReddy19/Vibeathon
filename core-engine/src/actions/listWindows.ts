interface ActionResult {
  requestId: string;
  ok: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

import { exec } from 'child_process';
import { promisify } from 'util';
// import { ActionResult } from '@shared/types';

const execAsync = promisify(exec);

/**
 * List all open windows on Windows
 * Uses tasklist to get running processes
 */
export const listWindows = async (params: any, requestId: string): Promise<ActionResult> => {
  try {
    // Get running processes with window titles
    // tasklist shows all processes; we filter for GUI apps
    const { stdout } = await execAsync('tasklist /FO CSV /NH');
    
    // Parse CSV output
    const lines = stdout.trim().split('\n');
    const processes = lines
      .map(line => {
        // Remove quotes and split by comma
        const parts = line.replace(/"/g, '').split(',');
        return {
          name: parts[0],
          pid: parts[1],
          memory: parts[4]
        };
      })
      .filter(p => p.name && !p.name.toLowerCase().includes('system')) // Filter system processes
      .slice(0, 15); // Top 15 processes
    
    // Get unique process names
    const uniqueApps = Array.from(
      new Map(processes.map(p => [p.name.toLowerCase(), p])).values()
    );
    
    return {
      requestId,
      ok: true,
      data: { 
        windows: uniqueApps,
        count: uniqueApps.length,
        message: `Found ${uniqueApps.length} running applications`
      },
      timestamp: Date.now()
    };
    
  } catch (err: any) {
    return {
      requestId,
      ok: false,
      error: `Failed to list windows: ${err.message}`,
      timestamp: Date.now()
    };
  }
};