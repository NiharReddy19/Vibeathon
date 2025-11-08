// API route definitions - single source of truth
export const API_ROUTES = {
    BASE: '/v1',
    // Intent parsing
    PARSE_INTENT: '/v1/intents/parse',
    // Action execution
    RUN_ACTION: '/v1/actions/run',
    // Recipe management
    RECIPES: '/v1/recipes',
    RECIPE_BY_ID: (id) => `/v1/recipes/${id}`,
    RUN_RECIPE: (id) => `/v1/recipes/${id}/run`,
    // WebSocket
    LOGS_WS: '/v1/logs',
    // Settings (optional)
    SETTINGS: '/v1/settings',
};
