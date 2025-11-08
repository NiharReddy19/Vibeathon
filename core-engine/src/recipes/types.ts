// import { ActionRequest } from '@shared/types';
interface ActionRequest {
  type: string;
  params: any;
  requestId: string;
}

export interface Recipe {
  id: string;
  name: string;
  steps: ActionRequest[];
  createdAt: number;
  description?: string;
  tags?: string[];
}

export interface RecipeMetadata {
  id: string;
  name: string;
  stepCount: number;
  createdAt: number;
  description?: string;
}