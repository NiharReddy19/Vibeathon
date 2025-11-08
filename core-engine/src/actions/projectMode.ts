// import { ActionResult } from '@shared/types';
interface ActionResult {
  requestId: string;
  ok: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

import { getRecipe } from '../recipes/store';
import { runAction } from './index';

/**
 * Load and execute a project workflow (recipe)
 * Params: { project_name: string }
 */
export const projectMode = async (params: any, requestId: string): Promise<ActionResult> => {
  const { project_name } = params;
  
  if (!project_name) {
    return {
      requestId,
      ok: false,
      error: 'Missing required parameter: project_name',
      timestamp: Date.now()
    };
  }
  
  try {
    // Look up recipe by name
    const recipe = await getRecipe(project_name);
    
    if (!recipe) {
      return {
        requestId,
        ok: false,
        error: `Project "${project_name}" not found. Create it first using "create recipe" command.`,
        timestamp: Date.now()
      };
    }
    
    console.log(`[projectMode] Executing recipe: ${recipe.name} with ${recipe.steps.length} steps`);
    
    // Execute each step in sequence
    const results = [];
    for (const step of recipe.steps) {
      const result = await runAction(step);
      results.push(result);
      
      // Stop if any step fails
      if (!result.ok) {
        return {
          requestId,
          ok: false,
          error: `Project mode failed at step ${results.length}: ${result.error}`,
          data: { completedSteps: results.length - 1, results },
          timestamp: Date.now()
        };
      }
      
      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return {
      requestId,
      ok: true,
      data: { 
        message: `Successfully executed project "${recipe.name}"`,
        stepsCompleted: results.length,
        results
      },
      timestamp: Date.now()
    };
    
  } catch (err: any) {
    return {
      requestId,
      ok: false,
      error: `Project mode execution failed: ${err.message}`,
      timestamp: Date.now()
    };
  }
};