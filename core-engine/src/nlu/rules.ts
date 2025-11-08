import { IntentDecision } from './types';
import { 
  normalizeAppName, 
  INTENT_KEYWORDS, 
  parseTimeDuration 
} from './lexicon';

/**
 * Main intent parser - converts natural language to structured intent
 */
export const parseIntent = (text: string): IntentDecision => {
  const lower = text.toLowerCase().trim();
  const timestamp = Date.now();
  
  // ========== INTENT: open_app ==========
  // Patterns: "open chrome", "launch vscode", "start spotify"
  if (INTENT_KEYWORDS.OPEN.some(kw => lower.startsWith(kw))) {
    // Extract app name after the action verb
    const appMatch = lower.match(/^(?:open|launch|start|run|execute)\s+(.+)$/);
    
    if (appMatch) {
      const appPhrase = appMatch[1];
      const normalized = normalizeAppName(appPhrase);
      
      if (normalized) {
        return {
          intent: 'open_app',
          slots: { 
            app_name: normalized.appKey,
            app_cmd: normalized.cmd
          },
          confidence: 0.95,
          rawText: text,
          timestamp
        };
      }
      
      // App not in lexicon - low confidence
      return {
        intent: 'open_app',
        slots: { app_name: appPhrase },
        confidence: 0.3,
        rawText: text,
        timestamp
      };
    }
  }
  
  // ========== INTENT: list_windows ==========
  // Patterns: "list windows", "show windows", "what's open", "what windows"
  if (INTENT_KEYWORDS.LIST.some(kw => lower.includes(kw)) && 
      (lower.includes('window') || lower.includes('open') || lower.includes('running'))) {
    return {
      intent: 'list_windows',
      slots: {},
      confidence: 0.92,
      rawText: text,
      timestamp
    };
  }
  
  // ========== INTENT: search_file ==========
  // Patterns: "find config.json", "search for readme", "locate package.json"
  if (INTENT_KEYWORDS.SEARCH.some(kw => lower.includes(kw))) {
    const searchMatch = lower.match(/(?:find|search|locate|look for)\s+(?:for\s+)?(.+)$/);
    
    if (searchMatch) {
      const query = searchMatch[1].trim();
      
      return {
        intent: 'search_file',
        slots: { query },
        confidence: query.length > 0 ? 0.85 : 0.4,
        rawText: text,
        timestamp
      };
    }
  }
  
  // ========== INTENT: project_mode ==========
  // Patterns: "project mode research", "start workspace dev", "run project work"
  if (INTENT_KEYWORDS.PROJECT.some(kw => lower.includes(kw))) {
    // Try to extract project name
    const projectMatch = lower.match(/(?:project|workspace|mode|environment)\s+(?:mode\s+)?(?:called\s+)?(.+)$/);
    
    if (projectMatch) {
      const projectName = projectMatch[1].trim();
      
      return {
        intent: 'project_mode',
        slots: { project_name: projectName },
        confidence: projectName.length > 0 ? 0.88 : 0.6,
        rawText: text,
        timestamp
      };
    }
    
    // Just "project mode" with no name
    return {
      intent: 'project_mode',
      slots: {},
      confidence: 0.6,
      rawText: text,
      timestamp
    };
  }
  
  // ========== INTENT: pause_listening ==========
  // Patterns: "pause for 5 minutes", "stop listening", "silence for 10 seconds"
  if (INTENT_KEYWORDS.PAUSE.some(kw => lower.includes(kw))) {
    const duration = parseTimeDuration(lower);
    const untilMatch = lower.match(/until\s+(.+)$/);
    
    const slots: Record<string, string> = {};
    
    if (duration) {
      slots.duration_value = duration.value.toString();
      slots.duration_unit = duration.unit;
    }
    
    if (untilMatch) {
      slots.until = untilMatch[1].trim();
    }
    
    return {
      intent: 'pause_listening',
      slots,
      confidence: duration || untilMatch ? 0.82 : 0.7,
      rawText: text,
      timestamp
    };
  }
  
  // ========== INTENT: create_recipe_from_history ==========
  // Patterns: "save recipe as morning routine", "create workflow called deploy", "make a recipe named setup"
  if ((INTENT_KEYWORDS.CREATE.some(kw => lower.includes(kw)) && 
       INTENT_KEYWORDS.RECIPE.some(kw => lower.includes(kw)))) {
    
    const nameMatch = lower.match(/(?:as|called|named)\s+(.+)$/);
    const name = nameMatch ? nameMatch[1].trim() : 'Unnamed Recipe';
    
    // Try to extract step count
    const countMatch = lower.match(/(?:last|recent)\s+(\d+)/);
    const stepCount = countMatch ? parseInt(countMatch[1]) : undefined;
    
    const slots: Record<string, string> = { name };
    if (stepCount) {
      slots.step_count = stepCount.toString();
    }
    
    return {
      intent: 'create_recipe_from_history',
      slots,
      confidence: name !== 'Unnamed Recipe' ? 0.88 : 0.6,
      rawText: text,
      timestamp
    };
  }
  
  // ========== INTENT: unknown ==========
  return {
    intent: 'unknown',
    slots: {},
    confidence: 0.0,
    rawText: text,
    timestamp
  };
};

/**
 * Validate intent confidence and provide feedback
 */
export const getIntentFeedback = (decision: IntentDecision): string => {
  if (decision.confidence >= 0.8) {
    return 'High confidence - ready to execute';
  } else if (decision.confidence >= 0.5) {
    return 'Medium confidence - please confirm';
  } else {
    return 'Low confidence - please rephrase or confirm';
  }
};