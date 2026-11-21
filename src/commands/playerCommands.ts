import { Message, EmbedBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { CAMPUS_LOCATIONS } from '../config/constants.js';

export async function handleProfileCommand(message: Message, args: string[]) {
  const targetUser = message.mentions.users.first() || message.author;

  let player = await prisma.player.findUnique({
    where: { id: targetUser.id },
    include: { vehicles: true, club: true, nation: true }
  });

  if (!player && targetUser.id === message.author.id) {
    player = await prisma.player.create({
      data: {
        id: message.author.id,
        username: message.author.username,
        discriminator: message.author.discriminator !== '0' ? message.author.discriminator : null,
        avatar: message.author.displayAvatarURL(),
        currentLocation: 'cn'
      },
      include: { vehicles: true, club: true, nation: true }
    });
  }

  if (!player) {
    return await message.reply('❌ That player has not registered on Apex CricVerse yet.');
  }

  // Calculate Derived Ratings (BAT, BOWL, FLD)
  const batRating = Math.round((player.power + player.timing + player.defensiveTech + player.running) / 4);
  const bowlRating = Math.round((player.pace + player.swing + player.spin + player.accuracy) / 4);
  const fldRating = Math.round((player.catching + player.throwing + player.agility + player.glovework) / 4);

  const loc = CAMPUS_LOCATIONS[player.currentLocation] || CAMPUS_LOCATIONS.cn;
  const vehiclesCount = player.vehicles.length;

  const embed = new EmbedBuilder()
    .setColor('#38bdf8')
    .setTitle(`🏏 ${player.username}'s Cricket Career Profile`)
    .setDescription(`*"${player.bio}"*\n\n` +
      `📍 **Current Location:** ${loc.emoji} ${loc.name}\n` +
      `⚡ **Stamina:** \`${player.stamina}/100\` | 🏃 **Training Points:** \`${player.trainingPoints} TP\`\n` +
      `🪙 **Net Worth:** \`${Number(player.coins).toLocaleString()} coins\` | 👥 **Fans:** \`${Number(player.followers).toLocaleString()}\``
    )
    .addFields(
      {
        name: '📊 Derived Overall Ratings',
        value: `🏏 **BAT:** \`${batRating}\` | 🎯 **BOWL:** \`${bowlRating}\` | 🧤 **FLD:** \`${fldRating}\``,
        inline: false
      },
      {
        name: '🏏 Batting Attributes',
        value: `• Power: \`${player.power}\` | Timing: \`${player.timing}\`\n• Defense: \`${player.defensiveTech}\` | Running: \`${player.running}\``,
        inline: true
      },
      {
        name: '🎯 Bowling Attributes',
        value: `• Pace: \`${player.pace}\` | Swing: \`${player.swing}\`\n• Spin: \`${player.spin}\` | Accuracy: \`${player.accuracy}\``,
        inline: true
      },
      {
        name: '🧤 Fielding & Mental',
        value: `• Catching: \`${player.catching}\` | Throwing: \`${player.throwing}\`\n• Composure: \`${player.composure}\` | Fitness: \`${player.fitness}\``,
        inline: true
      },
      {
        name: '🏆 Career Match Stats',
        value: `• Matches: **${player.matchesPlayed}** | Runs: **${player.runsScored}** (HS: ${player.highestScore})\n• Wickets: **${player.wicketsTaken}** | POTM Awards: **${player.potmCount} 👑**`,
        inline: false
      },
      {
        name: '🛡️ Teams & Garage',
        value: `• National Team: **${player.nation?.name || 'Unsigned'}**\n• Franchise Club: **${player.club?.name || 'Free Agent'}**\n• Garage: **${vehiclesCount} vehicle(s)** owned`,
        inline: false
      }
    )
    .setThumbnail(targetUser.displayAvatarURL())
    .setFooter({ text: 'Apex CricVerse Career Engine' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleSetDescCommand(message: Message, args: string[]) {
  const bio = args.join(' ').trim();
  if (!bio) {
    return await message.reply('❌ Please provide a bio. Example: `-setdesc Fearless top-order striker.`');
  }

  if (bio.length > 100) {
    return await message.reply(`❌ Bio exceeds maximum limit of 100 characters (Your text: ${bio.length} chars).`);
  }

  await prisma.player.upsert({
    where: { id: message.author.id },
    update: { bio },
    create: {
      id: message.author.id,
      username: message.author.username,
      bio
    }
  });

  await message.reply(`✅ Your profile bio has been updated to:\n*"${bio}"*`);
}

export async function handleLeaderboardCommand(message: Message, args: string[]) {
  const category = args[0]?.toLowerCase() || 'runs';

  let title = '🏆 Most Runs Scored';
  let orderByField: any = { runsScored: 'desc' };
  let valueFormatter = (p: any) => `${p.runsScored} runs (Avg: ${(p.runsScored / Math.max(1, p.matchesPlayed - p.notOuts)).toFixed(1)})`;

  if (category === 'wickets' || category === 'bowl') {
    title = '🎯 Most Wickets Taken (Purple Cap)';
    orderByField = { wicketsTaken: 'desc' };
    valueFormatter = (p: any) => `${p.wicketsTaken} wickets (Hauls: ${p.threeWicketHauls})`;
  } else if (category === 'wealth' || category === 'coins') {
    title = '🪙 Wealth & Net Worth Leaderboard';
    orderByField = { coins: 'desc' };
    valueFormatter = (p: any) => `${Number(p.coins).toLocaleString()} coins`;
  } else if (category === 'fans' || category === 'followers') {
    title = '👥 Global Follower Fame Leaderboard';
    orderByField = { followers: 'desc' };
    valueFormatter = (p: any) => `${Number(p.followers).toLocaleString()} followers`;
  } else if (category === 'tp' || category === 'training') {
    title = '🏃 Training Points (TP) Leaderboard';
    orderByField = { trainingPoints: 'desc' };
    valueFormatter = (p: any) => `${p.trainingPoints} TP`;
  }

  const topPlayers = await prisma.player.findMany({
    orderBy: orderByField,
    take: 10
  });

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  const lines = topPlayers.map((p, i) => {
    return `${medals[i] || '•'} **${p.username}** — ${valueFormatter(p)}`;
  });

  const embed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setTitle(title)
    .setDescription(lines.length > 0 ? lines.join('\n') : '*No player data recorded yet.*')
    .setFooter({ text: 'Categories: runs, wickets, coins, fans, tp • Usage: -lb <category>' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}
