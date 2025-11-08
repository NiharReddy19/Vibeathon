// IPC & WebSocket channel names
export const IPC_CHANNELS = {
  ACTION_RUN: 'action:run',
  RECIPE_LIST: 'recipe:list',
  RECIPE_SAVE: 'recipe:save',
  RECIPE_DELETE: 'recipe:delete',
} as const;

export const WS_CHANNELS = {
  LOGS: '/v1/logs',
} as const;
