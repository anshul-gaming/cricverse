import { Client, ClientOptions, GatewayIntentBits, Partials } from 'discord.js';
import { logger } from '../utils/logger.js';

export class CricVerseClient extends Client {
  public constructor(options?: ClientOptions) {
    super(
      options || {
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent
        ],
        partials: [Partials.Message, Partials.Channel, Partials.Reaction]
      }
    );
  }

  public async start(token?: string) {
    const botToken = token || process.env.DISCORD_TOKEN || process.env.CRICVERSE_TOKEN;
    if (!botToken) {
      logger.error('CRICVERSE_TOKEN or DISCORD_TOKEN is missing in environment variables.');
      return;
    }
    await this.login(botToken);
    logger.info('Apex CricVerse bot logged in successfully.');
  }
}
