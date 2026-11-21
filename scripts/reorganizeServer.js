import dotenv from 'dotenv';
dotenv.config();

import {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits
} from 'discord.js';

const GUILD_ID = '1546880116125077546';

async function run() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once('ready', async () => {
    console.log('🤖 Connected as:', client.user.tag);
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error('❌ Guild not found');
      process.exit(1);
    }

    console.log(`🏟️ Reorganizing & Locking down campus in: ${guild.name}`);

    // ==========================================
    // 1. LOCK DOWN CAMPUS FOR @EVERYONE
    // ==========================================
    const campusCategory = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('campus')
    );

    if (campusCategory) {
      console.log('🔒 Locking down Campus Category for @everyone...');

      // Deny ViewChannel for @everyone on the category
      await campusCategory.permissionOverwrites.set([
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        },
        {
          id: client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.EmbedLinks
          ]
        }
      ]);

      // Lock down each campus channel individually and sync
      const campusChannelNames = [
        'cricket-nets',
        'sports-lab',
        'gear-pavilion',
        'press-center',
        'physio-clinic',
        'club-pavilion',
        'dealership'
      ];

      for (const name of campusChannelNames) {
        const ch = guild.channels.cache.find(
          c => c.isTextBased() && c.name.toLowerCase().includes(name)
        );

        if (ch) {
          await ch.permissionOverwrites.edit(guild.roles.everyone.id, {
            [PermissionFlagsBits.ViewChannel.toString()]: false,
            [PermissionFlagsBits.SendMessages.toString()]: false
          });
          console.log(`🔒 Locked #${ch.name} (Hidden from @everyone)`);
        }
      }

      // Unlock cricket-nets as the starting lobby for @everyone or verified members
      const netsChannel = guild.channels.cache.find(
        c => c.isTextBased() && c.name.toLowerCase().includes('cricket-nets')
      );
      if (netsChannel) {
        // Unlock for all server members so everyone can see their starting academy nets
        await netsChannel.permissionOverwrites.edit(guild.roles.everyone.id, {
          [PermissionFlagsBits.ViewChannel.toString()]: true,
          [PermissionFlagsBits.SendMessages.toString()]: true,
          [PermissionFlagsBits.ReadMessageHistory.toString()]: true
        });
        console.log(`🔓 Unlocked starting facility #${netsChannel.name} for all rookies!`);
      }
    }

    // ==========================================
    // 2. RENAME BLITZ CATEGORY TO TOURNAMENTS & ARENA
    // ==========================================
    const blitzCategory = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && (c.name.includes('BLITZ') || c.id === '1570453293065314455')
    );
    if (blitzCategory) {
      await blitzCategory.setName('🏆 TOURNAMENTS & ARENA');
      console.log('✅ Renamed category: ⚡ BLITZ TOURNAMENTS ➔ 🏆 TOURNAMENTS & ARENA');
    }

    // Rename blitz-announcements
    const blitzAnnounce = guild.channels.cache.find(
      c => c.isTextBased() && c.name.includes('blitz-announcements')
    );
    if (blitzAnnounce) {
      await blitzAnnounce.setName('『📢』tournament-announcements');
      console.log('✅ Renamed blitz-announcements ➔ 『📢』tournament-announcements');
    }

    // ==========================================
    // 3. CLEAN UP VANGUARD-TIMES
    // ==========================================
    const vanguardTimes = guild.channels.cache.find(
      c => c.isTextBased() && c.name.includes('vanguard-times')
    );
    if (vanguardTimes) {
      // It has 0 messages; delete it so it doesn't cause confusion with cricket-news
      await vanguardTimes.delete('Cleaned up legacy unused channel');
      console.log('🗑️ Deleted empty legacy channel: 『📰』vanguard-times');
    }

    console.log('🎉 Server reorganization and campus spatial lockdown complete!');
    process.exit(0);
  });

  client.login(process.env.CRICVERSE_TOKEN || process.env.DISCORD_TOKEN);
}

run().catch(err => {
  console.error('Fatal error during reorganization:', err);
  process.exit(1);
});
