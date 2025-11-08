export interface TranscriptEvent {
    id: string;
    timestamp: number;
    text: string;
    partial: boolean;
    confidence?: number;
}
export interface IntentDecision {
    intent: string;
    confidence: number;
    slots: Record<string, string>;
    rawText: string;
}
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
export interface Recipe {
    id: string;
    name: string;
    description?: string;
    steps: ActionRequest[];
    createdAt: number;
}
export interface ApiResponse<T = any> {
    ok: boolean;
    data?: T;
    error?: string;
}
export type WSMessageType = 'stt.partial' | 'stt.final' | 'intent.preview' | 'action.result' | 'connection.heartbeat';
export interface WSMessage {
    type: WSMessageType;
    payload: any;
    timestamp: number;
}
