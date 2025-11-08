import { z } from 'zod';
// import { ActionRequest } from '@shared/types';
interface ActionRequest {
  type: string;
  params: any;
  requestId: string;
}
import { Recipe } from '../recipes/types';

/**
 * Action Request Schema
 */
const ActionRequestSchema = z.object({
  type: z.enum([
    'open_app',
    'list_windows',
    'search_file',
    'project_mode',
    'pause_listening'
  ]),
  params: z.record(z.any()),
  requestId: z.string().uuid()
});

/**
 * Recipe Schema
 */
const RecipeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  steps: z.array(ActionRequestSchema),
  createdAt: z.number(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional()
});

/**
 * Intent Parse Request Schema
 */
const IntentParseRequestSchema = z.object({
  text: z.string().min(1).max(500)
});

/**
 * Validate Action Request
 */
export const validateActionRequest = (data: any): ActionRequest => {
  try {
    return ActionRequestSchema.parse(data);
  } catch (err: any) {
    throw new Error(`Invalid action request: ${err.message}`);
  }
};

/**
 * Validate Recipe
 */
export const validateRecipe = (data: any): Recipe => {
  try {
    return RecipeSchema.parse(data);
  } catch (err: any) {
    throw new Error(`Invalid recipe: ${err.message}`);
  }
};

/**
 * Validate Intent Parse Request
 */
export const validateIntentParseRequest = (data: any): { text: string } => {
  try {
    return IntentParseRequestSchema.parse(data);
  } catch (err: any) {
    throw new Error(`Invalid intent parse request: ${err.message}`);
  }
};

/**
 * Sanitize file path to prevent directory traversal
 */
export const sanitizeFilePath = (filePath: string): string => {
  // Remove dangerous characters
  return filePath
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*]/g, '') // Remove invalid Windows filename chars
    .trim();
};

/**
 * Validate app name to prevent command injection
 */
export const validateAppName = (appName: string): boolean => {
  // Only allow alphanumeric, spaces, hyphens, underscores
  const safePattern = /^[a-zA-Z0-9\s\-_]+$/;
  return safePattern.test(appName);
};

/**
 * Safe parameter validation for actions
 */
export const validateActionParams = (actionType: string, params: any): void => {
  switch (actionType) {
    case 'open_app':
      if (!params.app_name) {
        throw new Error('Missing required parameter: app_name');
      }
      if (!validateAppName(params.app_name)) {
        throw new Error('Invalid app_name: contains unsafe characters');
      }
      break;
      
    case 'search_file':
      if (!params.query) {
        throw new Error('Missing required parameter: query');
      }
      params.query = sanitizeFilePath(params.query);
      break;
      
    case 'project_mode':
      if (!params.project_name) {
        throw new Error('Missing required parameter: project_name');
      }
      break;
      
    case 'list_windows':
      // No params required
      break;
      
    case 'pause_listening':
      // Optional params - no validation needed
      break;
      
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
};