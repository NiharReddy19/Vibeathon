// File: packages/core-engine/test-ws.js
// Purpose: Test WebSocket transcript streaming

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080/v1/logs');

ws.on('open', () => {
  console.log('✅ Connected to WebSocket at ws://localhost:8080/v1/logs\n');
  console.log('Listening for transcript events...\n');
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  
  if (message.type === 'stt.partial') {
    console.log(`🗣️  [PARTIAL]: "${message.payload.text}"`);
  } else if (message.type === 'stt.final') {
    console.log(`✅ [FINAL]: "${message.payload.text}" (confidence: ${message.payload.confidence})\n`);
  } else {
    console.log(`📡 [${message.type}]:`, message.payload);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('\n🔌 WebSocket connection closed');
});

console.log('🚀 Connecting to Aurora Engine WebSocket...');
console.log('   Make sure server is running on http://localhost:8080');
console.log('   Start STT with: POST http://localhost:8080/v1/stt/start\n');
