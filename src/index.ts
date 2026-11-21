import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { CricVerseClient } from './client/CricVerseClient.js';
import { onMessageCreate } from './events/messageCreate.js';
import { startKeepAliveWorker } from './services/keepAliveService.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  logger.info('Initializing Apex CricVerse MMORPG Engine...');

  // Start lightweight HTTP health-check server for cloud hosts (Render, Railway, Fly)
  const port = process.env.PORT || 3001;
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', service: 'Apex CricVerse MMORPG', uptime: process.uptime() }));
  });
  server.listen(port, () => {
    logger.info(`Cloud health check listening on port ${port}`);
    // Start 9-minute self-pinger to prevent Render sleep
    startKeepAliveWorker();
  });

  const client = new CricVerseClient();

  client.on('ready', () => {
    logger.info(`🏏 CricVerse bot is live as ${client.user?.tag}! Ready to play.`);
  });

  client.on('messageCreate', async message => {
    await onMessageCreate(message);
  });

  await client.start();
}

bootstrap().catch(err => {
  logger.fatal({ err }, 'Fatal error during CricVerse startup');
  process.exit(1);
});
