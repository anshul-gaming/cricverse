import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, PermissionFlagsBits } from 'discord.js';

const GUILD_ID = '1546880116125077546';

// Categories to hide from @everyone
const CATEGORIES_TO_HIDE = [
  '1570453293065314455', // 🏆 TOURNAMENTS & ARENA (Blitz tournament fixtures, points table, results)
  '1548073273928056924', // 👥 TEAMS & LEAGUE (Rosters, transfers, teams, purses)
  '1548073752993210398'  // 💰 AUCTION (Pools, unsold, auction history, live auction)
];

// Channels that should stay visible to the community (moved to COMMUNITY category)
const CHANNELS_TO_KEEP_IN_COMMUNITY = [
  '1573690950960816263', // 『⚔️』match-arena (Where players play -match, -duel)
  '1573690967658201109', // 『📢』cricket-news (Where Cricinfo articles post)
  '1573690974344056932'  // 『💬』crictwit-feed (Where players post -chirp)
];

const COMMUNITY_CATEGORY_ID = '1548072904586166352';

async function run() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once('ready', async () => {
    console.log('🤖 Connected as:', client.user.tag);
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error('❌ Guild not found');
      process.exit(1);
    }

    console.log(`🏟️ Hiding tournament categories in: ${guild.name}`);

    // 1. Move active CricVerse channels (match-arena, cricket-news, crictwit-feed) to COMMUNITY category
    // so players can still play matches, read news, and chirp!
    const communityCategory = guild.channels.cache.get(COMMUNITY_CATEGORY_ID);
    if (communityCategory) {
      for (const chId of CHANNELS_TO_KEEP_IN_COMMUNITY) {
        const ch = guild.channels.cache.get(chId);
        if (ch) {
          await ch.setParent(communityCategory.id, { lockPermissions: false });
          // Ensure @everyone can view and send messages
          await ch.permissionOverwrites.edit(guild.roles.everyone.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
          });
          console.log(`✅ Moved #${ch.name} to 💬 COMMUNITY category (Visible to all)`);
        }
      }
    }

    // 2. Hide each tournament category from @everyone
    for (const catId of CATEGORIES_TO_HIDE) {
      const cat = guild.channels.cache.get(catId);
      if (cat) {
        // Lock down category
        await cat.permissionOverwrites.set([
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          },
          {
            id: client.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
          }
        ]);
        console.log(`🔒 Hidden Category: ${cat.name}`);

        // Lock down all channels under this category
        const children = guild.channels.cache.filter(c => c.parentId === catId);
        for (const [_, child] of children) {
          await child.permissionOverwrites.edit(guild.roles.everyone.id, {
            ViewChannel: false,
            SendMessages: false
          }).catch(() => {});
          console.log(`   └ 🔒 Locked #${child.name}`);
        }
      }
    }

    console.log('🎉 All tournament, blitz, league, and auction categories have been hidden from @everyone!');
    process.exit(0);
  });

  client.login(process.env.CRICVERSE_TOKEN || process.env.DISCORD_TOKEN);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
