import dotenv from 'dotenv';
dotenv.config();

import { CricVerseClient } from './client/CricVerseClient.js';
import { onMessageCreate } from './events/messageCreate.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  logger.info('Initializing Apex CricVerse MMORPG Engine...');

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
