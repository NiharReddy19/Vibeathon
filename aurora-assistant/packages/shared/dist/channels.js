"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_CHANNELS = exports.IPC_CHANNELS = void 0;
// IPC & WebSocket channel names
exports.IPC_CHANNELS = {
    ACTION_RUN: 'action:run',
    RECIPE_LIST: 'recipe:list',
    RECIPE_SAVE: 'recipe:save',
    RECIPE_DELETE: 'recipe:delete',
};
exports.WS_CHANNELS = {
    LOGS: '/v1/logs',
};
