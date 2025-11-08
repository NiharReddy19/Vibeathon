// File: packages/core-engine/src/api/routes/stt.ts
// Purpose: STT control endpoints (start/stop/status)

import { Router } from 'express';
import { logger } from '../../utils/logger';

const router = Router();

// Note: sttManager will be injected when router is created
let sttManagerInstance: any = null;

export function setSTTManager(manager: any) {
  sttManagerInstance = manager;
}

// POST /v1/stt/start - Start listening
router.post('/start', async (req, res) => {
  try {
    if (!sttManagerInstance) {
      return res.status(503).json({
        ok: false,
        error: 'STT Manager not available',
      });
    }

    if (sttManagerInstance.isListening()) {
      return res.json({
        ok: true,
        data: { message: 'Already listening', state: sttManagerInstance.getState() },
      });
    }

    await sttManagerInstance.startListening();

    logger.info('STT started via API');
    res.json({
      ok: true,
      data: { message: 'STT listening started', state: 'listening' },
    });
  } catch (error: any) {
    logger.error('Failed to start STT:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// POST /v1/stt/stop - Stop listening
router.post('/stop', (req, res) => {
  try {
    if (!sttManagerInstance) {
      return res.status(503).json({
        ok: false,
        error: 'STT Manager not available',
      });
    }

    sttManagerInstance.stopListening();

    logger.info('STT stopped via API');
    res.json({
      ok: true,
      data: { message: 'STT listening stopped', state: 'idle' },
    });
  } catch (error: any) {
    logger.error('Failed to stop STT:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// POST /v1/stt/pause - Pause listening
router.post('/pause', (req, res) => {
  const { duration } = req.body; // Optional: duration in ms

  try {
    if (!sttManagerInstance) {
      return res.status(503).json({
        ok: false,
        error: 'STT Manager not available',
      });
    }

    sttManagerInstance.pauseListening(duration);

    logger.info('STT paused via API', { duration });
    res.json({
      ok: true,
      data: { message: 'STT listening paused', duration, state: 'paused' },
    });
  } catch (error: any) {
    logger.error('Failed to pause STT:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// GET /v1/stt/status - Get current status
router.get('/status', (req, res) => {
  if (!sttManagerInstance) {
    return res.json({
      ok: true,
      data: {
        state: 'unavailable',
        isListening: false,
        message: 'STT Manager not initialized',
      },
    });
  }

  res.json({
    ok: true,
    data: {
      state: sttManagerInstance.getState(),
      isListening: sttManagerInstance.isListening(),
    },
  });
});

// POST /v1/stt/trigger - Manually trigger a voice command (mock mode only)
router.post('/trigger', (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({
      ok: false,
      error: 'Missing "text" field',
    });
  }

  if (!sttManagerInstance) {
    return res.status(503).json({
      ok: false,
      error: 'STT Manager not available',
    });
  }

  // Trigger manual command in mock mode
  if ((sttManagerInstance as any).mockStream) {
    (sttManagerInstance as any).mockStream.triggerCommand(text);
    res.json({
      ok: true,
      data: { message: `Triggered command: "${text}"` },
    });
  } else {
    res.json({
      ok: false,
      error: 'Manual trigger only available in mock mode',
    });
  }
});

export default router;
