import { exec } from 'child_process';
import { promisify } from 'util';
interface ActionResult {
  requestId: string;
  ok: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

// import { ActionResult } from '@shared/types';
import { WINDOWS_APPS } from '../nlu/lexicon';

const execAsync = promisify(exec);

/**
 * Open a Windows application
 * Params: { app_name: string, app_cmd?: string }
 */
export const openApp = async (params: any, requestId: string): Promise<ActionResult> => {
  const { app_name, app_cmd } = params;
  
  if (!app_name) {
    return {
      requestId,
      ok: false,
      error: 'Missing required parameter: app_name',
      timestamp: Date.now()
    };
  }
  
  try {
    // Use provided command or lookup from lexicon
    let command = app_cmd;
    
    if (!command) {
      const appConfig = WINDOWS_APPS[app_name];
      if (!appConfig) {
        return {
          requestId,
          ok: false,
          error: `Application "${app_name}" not found in registry. Available apps: ${Object.keys(WINDOWS_APPS).join(', ')}`,
          timestamp: Date.now()
        };
      }
      command = appConfig.cmd;
    }
    
    // Execute command
    console.log(`[openApp] Executing: ${command}`);
    await execAsync(command);
    
    return {
      requestId,
      ok: true,
      data: { 
        message: `Successfully opened ${app_name}`,
        command,
        app_name
      },
      timestamp: Date.now()
    };
    
  } catch (err: any) {
    return {
      requestId,
      ok: false,
      error: `Failed to open ${app_name}: ${err.message}`,
      timestamp: Date.now()
    };
  }
};