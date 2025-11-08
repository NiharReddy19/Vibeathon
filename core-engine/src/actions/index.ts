interface ActionRequest {
  type: string;
  params: any;
  requestId: string;
}

interface ActionResult {
  requestId: string;
  ok: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

// import { ActionRequest, ActionResult } from '@shared/types';
import { openApp } from './openApp';
import { listWindows } from './listWindows';
import { searchFile } from './searchFile';
import { projectMode } from './projectMode';
import { pauseListening } from './pauseListening';
import { recordAction } from '../recipes/history';

type ActionHandler = (params: any, requestId: string) => Promise<ActionResult>;

/**
 * Registry of all available actions
 */
const ACTION_HANDLERS: Record<string, ActionHandler> = {
  open_app: openApp,
  list_windows: listWindows,
  search_file: searchFile,
  project_mode: projectMode,
  pause_listening: pauseListening,
};

/**
 * Execute an action request
 */
export const runAction = async (request: ActionRequest): Promise<ActionResult> => {
  const handler = ACTION_HANDLERS[request.type];
  
  if (!handler) {
    return {
      requestId: request.requestId,
      ok: false,
      error: `Unknown action type: ${request.type}. Available: ${Object.keys(ACTION_HANDLERS).join(', ')}`,
      timestamp: Date.now()
    };
  }
  
  try {
    const result = await handler(request.params, request.requestId);
    
    // Record successful actions to history for recipe creation
    if (result.ok) {
      recordAction(request);
    }
    
    return result;
  } catch (err: any) {
    return {
      requestId: request.requestId,
      ok: false,
      error: `Action execution failed: ${err.message}`,
      timestamp: Date.now()
    };
  }
};

/**
 * Get list of available actions with descriptions
 */
export const getAvailableActions = () => {
  return {
    open_app: 'Launch a Windows application',
    list_windows: 'List all open windows',
    search_file: 'Search for files on the system',
    project_mode: 'Load and execute a project workflow',
    pause_listening: 'Pause voice recognition temporarily'
  };
};