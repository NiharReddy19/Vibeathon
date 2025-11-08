// File: packages/core-engine/src/index.ts
// Purpose: Main entry point - bootstrap HTTP, WebSocket, and STT

import http from 'http';
import { createHttpServer } from './api/http';
import { WSEventServer } from './api/ws';
import { STTManager } from './stt/manager';
import { setSTTManager } from './api/routes/stt';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { TranscriptEvent, WSMessage } from '@aurora/shared';

async function startEngine() {
  try {
    logger.info('Starting Aurora Core Engine...');
    logger.info('Configuration:', { 
      port: config.port, 
      nodeEnv: config.nodeEnv,
      autostartSTT: config.autostartSTT 
    });

    // Create HTTP server
    const app = createHttpServer();
    const server = http.createServer(app);

    // Create WebSocket server
    const wsServer = new WSEventServer(server);

    // Initialize STT Manager
    const sttManager = new STTManager();
    
    try {
      await sttManager.initialize();
      logger.info('STT Manager initialized');
      
      // Inject STT manager into routes
      setSTTManager(sttManager);

      // Wire STT events to WebSocket broadcasts
      sttManager.on('transcript:partial', (event: TranscriptEvent) => {
        const message: WSMessage = {
          type: 'stt.partial',
          payload: event,
          timestamp: Date.now(),
        };
        wsServer.broadcast(message);
        logger.debug('Broadcasting partial transcript', { text: event.text });
      });

      sttManager.on('transcript:final', (event: TranscriptEvent) => {
        const message: WSMessage = {
          type: 'stt.final',
          payload: event,
          timestamp: Date.now(),
        };
        wsServer.broadcast(message);
        logger.info('Broadcasting final transcript', { text: event.text });
      });

      sttManager.on('error', (error: Error) => {
        logger.error('STT Manager error:', { error: error.message });
      });

      // Auto-start STT if configured
      if (config.autostartSTT) {
        logger.info('Auto-starting STT...');
        await sttManager.startListening();
      }

    } catch (error: any) {
      logger.warn('STT initialization failed - API will work without STT', { 
        error: error.message 
      });
    }

    // Start listening
    server.listen(config.port, () => {
      logger.info(`🚀 Aurora Engine running on port ${config.port}`);
      logger.info(`   HTTP API: http://localhost:${config.port}`);
      logger.info(`   WebSocket: ws://localhost:${config.port}/v1/logs`);
      logger.info(`   Health check: http://localhost:${config.port}/health`);
      logger.info(`   STT Status: http://localhost:${config.port}/v1/stt/status`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      
      if (sttManager) {
        sttManager.destroy();
      }
      
      wsServer.close();
      
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully...');
      
      if (sttManager) {
        sttManager.destroy();
      }
      
      wsServer.close();
      
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start engine:', error);
    process.exit(1);
  }
}

// Start the engine
startEngine();
