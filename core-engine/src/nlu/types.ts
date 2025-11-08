export interface IntentDecision {
  intent: string;
  slots: Record<string, string>;
  confidence: number;
  rawText: string;
  timestamp: number;
}

export interface ParsedIntent {
  intent: string;
  slots: Record<string, string>;
  confidence: number;
}