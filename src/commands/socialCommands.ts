import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { executeEndorsementDeal } from '../engines/socialEngine.js';

export async function handleAdvertCommand(message: Message, args: string[]) {
  const dealKey = args[0];
  const result = await executeEndorsementDeal(message.author.id, dealKey);
  if (result.embed) {
    return await message.reply({ embeds: [result.embed] });
  }
  return await message.reply(result.message);
}

export async function handleCoachingCommand(message: Message) {
  const player = await prisma.player.findUnique({ where: { id: message.author.id } });
  if (!player) return await message.reply('❌ Player profile not found. Run `-profile` to register.');

  if (player.currentLocation !== 'cp') {
    return await message.reply('❌ You must travel to the **🏟️ Local Club Pavilion** (`-travel cp`) to coach youth players!');
  }

  const now = new Date();
  if (player.lastCoachedAt && (now.getTime() - player.lastCoachedAt.getTime()) < 2 * 60 * 60 * 1000) {
    const mins = Math.ceil((2 * 60 * 60 * 1000 - (now.getTime() - player.lastCoachedAt.getTime())) / 60000);
    return await message.reply(`⏳ Youth coaching on cooldown. Next session ready in **${mins} minutes**.`);
  }

  if (player.stamina < 10) {
    return await message.reply(`⚠️ Coaching requires **10 Stamina** (You have ${player.stamina}/100).`);
  }

  const coinPayout = 50000n;
  await prisma.player.update({
    where: { id: message.author.id },
    data: {
      coins: { increment: coinPayout },
      stamina: { decrement: 10 },
      lastCoachedAt: now
    }
  });

  const embed = new EmbedBuilder()
    .setColor('#2ecc71')
    .setTitle('🏏 Grassroots Youth Coaching Complete')
    .setDescription(
      `You conducted a 2-hour batting masterclass for local academy rookies.\n\n` +
      `🪙 **Earnings:** \`+50,000 coins\`\n` +
      `⚡ **Energy Spent:** \`-10 stamina\` (Remaining: ${player.stamina - 10}/100)`
    )
    .setFooter({ text: 'Next coaching session available in 2 hours' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleMeetGreetCommand(message: Message) {
  const player = await prisma.player.findUnique({ where: { id: message.author.id } });
  if (!player) return await message.reply('❌ Player profile not found. Run `-profile` to register.');

  if (player.currentLocation !== 'cp') {
    return await message.reply('❌ You must travel to the **🏟️ Local Club Pavilion** (`-travel cp`) for fan signing sessions!');
  }

  const now = new Date();
  if (player.lastMeetGreetAt && (now.getTime() - player.lastMeetGreetAt.getTime()) < 2 * 60 * 60 * 1000) {
    const mins = Math.ceil((2 * 60 * 60 * 1000 - (now.getTime() - player.lastMeetGreetAt.getTime())) / 60000);
    return await message.reply(`⏳ Fan meet & greet on cooldown. Next session ready in **${mins} minutes**.`);
  }

  if (player.stamina < 10) {
    return await message.reply(`⚠️ Fan signing requires **10 Stamina** (You have ${player.stamina}/100).`);
  }

  const fanGain = 50000n;
  await prisma.player.update({
    where: { id: message.author.id },
    data: {
      followers: { increment: fanGain },
      stamina: { decrement: 10 },
      lastMeetGreetAt: now
    }
  });

  const embed = new EmbedBuilder()
    .setColor('#38bdf8')
    .setTitle('📸 Autograph & Fan Photo Session Complete')
    .setDescription(
      `You signed jerseys and bats for hundreds of passionate fans outside the pavilion gates!\n\n` +
      `👥 **New Followers:** \`+50,000 fans\`\n` +
      `⚡ **Energy Spent:** \`-10 stamina\` (Remaining: ${player.stamina - 10}/100)`
    )
    .setFooter({ text: 'Next meet & greet session available in 2 hours' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleChirpCommand(message: Message, args: string[]) {
  const text = args.join(' ').trim();
  if (!text) {
    return await message.reply('❌ What would you like to chirp to your fanbase? Example: `-chirp Ready for the big derby tonight! 🔥`');
  }

  const player = await prisma.player.findUnique({ where: { id: message.author.id } });
  if (!player) return await message.reply('❌ Player profile not found. Run `-profile` to register.');

  // Create Chirp in DB
  const post = await prisma.cricTwitPost.create({
    data: {
      guildId: message.guildId || 'global',
      playerId: message.author.id,
      content: text
    }
  });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`chirp_like_${post.id}`)
      .setLabel('👍 Applaud (+100k Fans)')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`chirp_dislike_${post.id}`)
      .setLabel('👎 Troll (-50k Fans)')
      .setStyle(ButtonStyle.Danger)
  );

  const embed = new EmbedBuilder()
    .setColor('#1da1f2')
    .setAuthor({ name: `${player.username} on CricTwit`, iconURL: message.author.displayAvatarURL() })
    .setDescription(`"${text}"`)
    .setFooter({ text: 'Click buttons below to react • 5% daily relevancy decay applies' })
    .setTimestamp();

  const chirpMsg = await message.reply({ embeds: [embed], components: [row] });

  // Reaction Collector
  const collector = chirpMsg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 24 * 60 * 60 * 1000 // 24 hours
  });

  const reactedUsers = new Set<string>();

  collector.on('collect', async interaction => {
    if (interaction.user.id === message.author.id) {
      await interaction.reply({ content: '❌ You cannot like or dislike your own chirp!', ephemeral: true });
      return;
    }

    if (reactedUsers.has(interaction.user.id)) {
      await interaction.reply({ content: 'ℹ️ You have already reacted to this chirp!', ephemeral: true });
      return;
    }

    reactedUsers.add(interaction.user.id);
    const isLike = interaction.customId.startsWith('chirp_like');

    if (isLike) {
      await prisma.player.update({
        where: { id: message.author.id },
        data: { followers: { increment: 100000n } }
      });
      await prisma.cricTwitPost.update({
        where: { id: post.id },
        data: { likes: { increment: 1 } }
      });
      await interaction.reply({ content: `👍 You applauded <@${message.author.id}>'s chirp! (+100k fans)`, ephemeral: true });
    } else {
      await prisma.player.update({
        where: { id: message.author.id },
        data: { followers: { decrement: 50000n } }
      });
      await prisma.cricTwitPost.update({
        where: { id: post.id },
        data: { dislikes: { increment: 1 } }
      });
      await interaction.reply({ content: `👎 You trolled <@${message.author.id}>'s chirp! (-50k fans)`, ephemeral: true });
    }
  });
}
