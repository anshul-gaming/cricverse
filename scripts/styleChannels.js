import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, ChannelType } from 'discord.js';

const GUILD_ID = '1546880116125077546';

const CHANNEL_RENAME_MAP = {
  'cricket-nets': '『🏏』cricket-nets',
  'sports-lab': '『🔬』sports-lab',
  'gear-pavilion': '『🛍️』gear-pavilion',
  'press-center': '『📸』press-center',
  'physio-clinic': '『❄️』physio-clinic',
  'club-pavilion': '『🏟️』club-pavilion',
  'dealership': '『🏎️』dealership',
  'match-arena': '『⚔️』match-arena',
  'cricket-news': '『📢』cricket-news',
  'crictwit-feed': '『💬』crictwit-feed',
  'auction-room': '『🔨』auction-room',
  'spectator-fantasy': '『🎮』spectator-fantasy'
};

async function run() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once('ready', async () => {
    console.log('🤖 Connected as:', client.user.tag);
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error('❌ Guild not found');
      process.exit(1);
    }

    console.log(`🏟️ Styling channels & positioning categories in: ${guild.name}`);

    // 1. Position Categories at the Top
    const campusCategory = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('campus')
    );
    if (campusCategory) {
      await campusCategory.setPosition(1).catch(err => console.error('Failed to move campus category:', err));
      console.log('✅ Moved 🏟️ CRICVERSE CAMPUS to position 1');
    }

    const arenaCategory = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && (c.name.toLowerCase().includes('tournament') || c.name.toLowerCase().includes('arena'))
    );
    if (arenaCategory) {
      await arenaCategory.setPosition(2).catch(err => console.error('Failed to move arena category:', err));
      console.log('✅ Moved 🏆 TOURNAMENTS & ARENA to position 2');
    }

    // 2. Rename Channels with Styled Brackets & Icons
    for (const [rawName, styledName] of Object.entries(CHANNEL_RENAME_MAP)) {
      const channel = guild.channels.cache.find(
        c => c.isTextBased() && (c.name.toLowerCase() === rawName || c.name.toLowerCase() === styledName.toLowerCase())
      );

      if (channel) {
        if (channel.name !== styledName) {
          await channel.setName(styledName);
          console.log(`✅ Renamed #${channel.name} ➔ #${styledName}`);
        } else {
          console.log(`ℹ️ Already styled: #${styledName}`);
        }
      } else {
        console.log(`⚠️ Channel not found for ${rawName}`);
      }
    }

    console.log('🎉 All channels styled with icon logos and categories positioned at the top!');
    process.exit(0);
  });

  client.login(process.env.CRICVERSE_TOKEN || process.env.DISCORD_TOKEN);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
