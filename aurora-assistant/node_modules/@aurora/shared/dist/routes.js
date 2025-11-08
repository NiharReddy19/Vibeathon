"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = void 0;
// API route definitions
exports.API_ROUTES = {
    INTENTS: {
        PARSE: '/v1/intents/parse',
    },
    ACTIONS: {
        RUN: '/v1/actions/run',
    },
    RECIPES: {
        LIST: '/v1/recipes',
        CREATE: '/v1/recipes',
        GET: (id) => `/v1/recipes/${id}`,
        UPDATE: (id) => `/v1/recipes/${id}`,
        DELETE: (id) => `/v1/recipes/${id}`,
    },
};
