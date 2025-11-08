// import { ActionRequest } from '@shared/types';
interface ActionRequest {
  type: string;
  params: any;
  requestId: string;
  timestamp?: number;
}
import { Recipe } from './types';
import { v4 as uuid } from 'uuid';

/**
 * In-memory circular buffer for recent actions
 */
const MAX_HISTORY_SIZE = 50;
let actionHistory: ActionRequest[] = [];

/**
 * Record an action to history
 */
export const recordAction = (action: ActionRequest): void => {
  actionHistory.push({
    ...action,
    // Ensure we have a timestamp
    timestamp: action.timestamp || Date.now()
  } as any);
  
  // Keep only last N actions
  if (actionHistory.length > MAX_HISTORY_SIZE) {
    actionHistory = actionHistory.slice(-MAX_HISTORY_SIZE);
  }
  
  console.log(`[history] Recorded action: ${action.type} (total: ${actionHistory.length})`);
};

/**
 * Get recent actions
 */
export const getRecentActions = (count: number = 10): ActionRequest[] => {
  const start = Math.max(0, actionHistory.length - count);
  return actionHistory.slice(start);
};

/**
 * Get all history
 */
export const getAllHistory = (): ActionRequest[] => {
  return [...actionHistory];
};

/**
 * Create a recipe from recent history
 */
export const createRecipeFromHistory = (name: string, stepCount?: number): Recipe => {
  const steps = getRecentActions(stepCount || 10);
  
  if (steps.length === 0) {
    throw new Error('No actions in history to create recipe from');
  }
  
  // Clean up steps - remove timestamps and generate new request IDs
  const cleanedSteps = steps.map(step => ({
    type: step.type,
    params: step.params,
    requestId: uuid() // Generate new ID for recipe execution
  }));
  
  return {
    id: uuid(),
    name,
    steps: cleanedSteps,
    createdAt: Date.now(),
    description: `Created from last ${steps.length} actions`,
    tags: ['auto-generated']
  };
};

/**
 * Clear history
 */
export const clearHistory = (): void => {
  actionHistory = [];
  console.log('[history] Cleared action history');
};

/**
 * Get history summary
 */
export const getHistorySummary = () => {
  const actionTypes = actionHistory.reduce((acc, action) => {
    acc[action.type] = (acc[action.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalActions: actionHistory.length,
    actionTypes,
    oldestAction: actionHistory[0]?.timestamp || null,
    newestAction: actionHistory[actionHistory.length - 1]?.timestamp || null
  };
};