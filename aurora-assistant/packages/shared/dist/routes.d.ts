export declare const API_ROUTES: {
    readonly INTENTS: {
        readonly PARSE: "/v1/intents/parse";
    };
    readonly ACTIONS: {
        readonly RUN: "/v1/actions/run";
    };
    readonly RECIPES: {
        readonly LIST: "/v1/recipes";
        readonly CREATE: "/v1/recipes";
        readonly GET: (id: string) => string;
        readonly UPDATE: (id: string) => string;
        readonly DELETE: (id: string) => string;
    };
};
