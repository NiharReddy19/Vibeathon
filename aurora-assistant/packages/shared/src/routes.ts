// API route definitions
export const API_ROUTES = {
  INTENTS: {
    PARSE: '/v1/intents/parse',
  },
  ACTIONS: {
    RUN: '/v1/actions/run',
  },
  RECIPES: {
    LIST: '/v1/recipes',
    CREATE: '/v1/recipes',
    GET: (id: string) => `/v1/recipes/${id}`,
    UPDATE: (id: string) => `/v1/recipes/${id}`,
    DELETE: (id: string) => `/v1/recipes/${id}`,
  },
} as const;
