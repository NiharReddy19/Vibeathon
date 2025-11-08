// ============= STT Events =============
export interface TranscriptEvent {
  id: string;
  timestamp: number;
  text: string;
  partial: boolean;
  confidence?: number;
}

// ============= NLU/Intent =============
export interface IntentDecision {
  intent: string;
  confidence: number;
  slots: Record<string, string>;
  rawText: string;
}

// ============= Actions =============
export interface ActionRequest {
  action: string;
  params: Record<string, any>;
  requiresApproval: boolean;
}

export interface ActionResult {
  ok: boolean;
  data?: any;
  error?: string;
  logs: string[];
}

// ============= Recipes =============
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  steps: ActionRequest[];
  createdAt: number;
}

// ============= Server Responses =============
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ============= WebSocket Messages =============
export type WSMessageType = 
  | 'stt.partial' 
  | 'stt.final' 
  | 'intent.preview' 
  | 'action.result'
  | 'connection.heartbeat';

export interface WSMessage {
  type: WSMessageType;
  payload: any;
  timestamp: number;
}
