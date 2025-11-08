export declare const API_ROUTES: {
    readonly BASE: "/v1";
    readonly PARSE_INTENT: "/v1/intents/parse";
    readonly RUN_ACTION: "/v1/actions/run";
    readonly RECIPES: "/v1/recipes";
    readonly RECIPE_BY_ID: (id: string) => string;
    readonly RUN_RECIPE: (id: string) => string;
    readonly LOGS_WS: "/v1/logs";
    readonly SETTINGS: "/v1/settings";
};
export type APIRoute = typeof API_ROUTES[keyof typeof API_ROUTES];
