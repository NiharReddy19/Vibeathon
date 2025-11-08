/**
 * Windows application mappings
 * Maps common phrases to executable commands
 */
export const WINDOWS_APPS: Record<string, { cmd: string; aliases: string[] }> = {
  chrome: {
    cmd: 'start chrome',
    aliases: ['chrome', 'google chrome', 'browser', 'google']
  },
  edge: {
    cmd: 'start msedge',
    aliases: ['edge', 'microsoft edge', 'msedge']
  },
  vscode: {
    cmd: 'code',
    aliases: ['vscode', 'vs code', 'code', 'visual studio code', 'visual studio']
  },
  notepad: {
    cmd: 'notepad',
    aliases: ['notepad', 'text editor', 'editor']
  },
  explorer: {
    cmd: 'explorer',
    aliases: ['explorer', 'file explorer', 'files', 'my computer']
  },
  cmd: {
    cmd: 'start cmd',
    aliases: ['cmd', 'command prompt', 'terminal', 'console', 'command line']
  },
  powershell: {
    cmd: 'start powershell',
    aliases: ['powershell', 'power shell', 'ps']
  },
  calculator: {
    cmd: 'calc',
    aliases: ['calculator', 'calc']
  },
  paint: {
    cmd: 'mspaint',
    aliases: ['paint', 'ms paint', 'mspaint']
  },
  spotify: {
    cmd: 'start spotify',
    aliases: ['spotify', 'music']
  },
  discord: {
    cmd: 'start discord',
    aliases: ['discord']
  },
  slack: {
    cmd: 'start slack',
    aliases: ['slack']
  },
  outlook: {
    cmd: 'start outlook',
    aliases: ['outlook', 'email', 'mail']
  },
  word: {
    cmd: 'start winword',
    aliases: ['word', 'microsoft word', 'ms word']
  },
  excel: {
    cmd: 'start excel',
    aliases: ['excel', 'microsoft excel', 'ms excel', 'spreadsheet']
  }
};

/**
 * Normalize app name from user phrase
 */
export const normalizeAppName = (phrase: string): { appKey: string; cmd: string } | null => {
  const lower = phrase.toLowerCase().trim();
  
  for (const [appKey, config] of Object.entries(WINDOWS_APPS)) {
    if (config.aliases.some(alias => lower.includes(alias) || alias.includes(lower))) {
      return { appKey, cmd: config.cmd };
    }
  }
  
  return null;
};

/**
 * Keywords for intent detection
 */
export const INTENT_KEYWORDS = {
  OPEN: ['open', 'launch', 'start', 'run', 'execute'],
  LIST: ['list', 'show', 'display', 'what', 'tell me'],
  SEARCH: ['find', 'search', 'locate', 'look for', 'where is'],
  PROJECT: ['project', 'workspace', 'mode', 'environment'],
  PAUSE: ['pause', 'stop', 'halt', 'quiet', 'silence'],
  CREATE: ['create', 'save', 'make', 'record'],
  RECIPE: ['recipe', 'workflow', 'routine', 'sequence', 'macro']
};

/**
 * Time duration parsing
 */
export const parseTimeDuration = (text: string): { value: number; unit: string } | null => {
  const patterns = [
    { regex: /(\d+)\s*(min|minute|minutes)/i, unit: 'minutes' },
    { regex: /(\d+)\s*(hour|hours|hr|hrs)/i, unit: 'hours' },
    { regex: /(\d+)\s*(sec|second|seconds)/i, unit: 'seconds' }
  ];
  
  for (const { regex, unit } of patterns) {
    const match = text.match(regex);
    if (match) {
      return { value: parseInt(match[1]), unit };
    }
  }
  
  return null;
};