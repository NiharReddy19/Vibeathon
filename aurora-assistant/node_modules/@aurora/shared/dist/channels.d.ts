export declare const IPC_CHANNELS: {
    readonly ACTION_RUN: "action:run";
    readonly RECIPE_LIST: "recipe:list";
    readonly RECIPE_GET: "recipe:get";
    readonly RECIPE_SAVE: "recipe:save";
    readonly RECIPE_DELETE: "recipe:delete";
    readonly RECIPE_RUN: "recipe:run";
    readonly GET_MIC_STATUS: "system:mic-status";
    readonly REQUEST_MIC_PERMISSION: "system:mic-permission";
    readonly GET_ENGINE_STATUS: "system:engine-status";
    readonly GET_SETTINGS: "settings:get";
    readonly SET_SETTINGS: "settings:set";
};
export declare const WS_CHANNELS: {
    readonly STT_PARTIAL: "stt.partial";
    readonly STT_FINAL: "stt.final";
    readonly INTENT_PREVIEW: "intent.preview";
    readonly ACTION_RESULT: "action.result";
    readonly HEARTBEAT: "heartbeat";
};
