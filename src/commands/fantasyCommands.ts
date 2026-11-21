import { Message, EmbedBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';
import {
  calculateLiveOdds,
  placeMatchPrediction,
  saveFantasyTeam
} from '../engines/fantasyEngine.js';

export async function handleFantasyCommand(message: Message, args: string[]) {
  const sub = args[0]?.toLowerCase();

  if (sub === 'create' || sub === 'set') {
    const mentions = message.mentions.users.filter(u => !u.bot);
    if (mentions.size < 3) {
      return await message.reply('❌ Please mention at least 3 players to form your fantasy core! Example: `-fantasy create @player1 @player2 @player3`');
    }

    const playerIds = Array.from(mentions.keys()).slice(0, 11);
    const captainId = playerIds[0];
    const viceCaptainId = playerIds[1] || playerIds[0];

    await saveFantasyTeam(
      message.author.id,
      message.guildId || 'global',
      `${message.author.username}'s XI`,
      playerIds,
      captainId,
      viceCaptainId
    );

    const embed = new EmbedBuilder()
      .setColor('#10b981')
      .setTitle(`🎮 Fantasy XI Created: ${message.author.username}'s XI`)
      .setDescription(
        `⭐ **Squad (${playerIds.length} players):** ${playerIds.map(id => `<@${id}>`).join(', ')}\n` +
        `👑 **Captain (2x Points):** <@${captainId}>\n` +
        `🌟 **Vice-Captain (1.5x Points):** <@${viceCaptainId}>\n\n` +
        `*Your fantasy points will update live as your selected stars play matches in CricVerse!*`
      )
      .setFooter({ text: 'Apex Dream XI Fantasy League' })
      .setTimestamp();

    return await message.reply({ embeds: [embed] });
  }

  if (sub === 'lb' || sub === 'leaderboard') {
    const teams = await prisma.fantasyTeam.findMany({
      orderBy: { totalPoints: 'desc' },
      take: 10
    });

    const lines = teams.map((t, idx) => {
      const medals = ['🥇', '🥈', '🥉'];
      const rank = idx < 3 ? medals[idx] : `\`#${idx + 1}\``;
      return `${rank} <@${t.userId}> — **${t.teamName}** (\`${t.totalPoints.toFixed(1)} pts\`)`;
    });

    const embed = new EmbedBuilder()
      .setColor('#f59e0b')
      .setTitle('🏆 Apex Fantasy League Standings')
      .setDescription(lines.join('\n') || '*No fantasy managers registered yet. Use `-fantasy create` to enter!*')
      .setFooter({ text: 'Fantasy points awarded for runs, wickets, catches, and POTM honors' })
      .setTimestamp();

    return await message.reply({ embeds: [embed] });
  }

  // Display user's fantasy team
  const team = await prisma.fantasyTeam.findUnique({
    where: {
      userId_guildId: {
        userId: message.author.id,
        guildId: message.guildId || 'global'
      }
    }
  });

  if (!team) {
    return await message.reply('ℹ️ You have not created a fantasy lineup yet. Use `-fantasy create @player1 @player2 @player3` to join the action!');
  }

  const ids = team.selectedPlayerIds.split(',').filter(Boolean);

  const embed = new EmbedBuilder()
    .setColor('#38bdf8')
    .setTitle(`🎮 ${team.teamName}`)
    .setDescription(
      `📊 **Total Career Fantasy Points:** \`${team.totalPoints.toFixed(1)} pts\`\n` +
      `👑 **Captain (2x):** <@${team.captainId}>\n` +
      `🌟 **Vice-Captain (1.5x):** <@${team.viceCaptainId}>\n\n` +
      `**Selected Roster (${ids.length}):**\n${ids.map(id => `• <@${id}>`).join('\n')}`
    )
    .setFooter({ text: 'Commands: -fantasy create | -fantasy lb' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleOddsCommand(message: Message, args: string[]) {
  const homeTeam = args[0] || 'India Gladiators';
  const awayTeam = args[1] || 'Australia Titans';

  // Sample live in-play scenario
  const target = 165;
  const currentRuns = 120;
  const wicketsLost = 4;
  const ballsRemaining = 24;

  const odds = calculateLiveOdds(homeTeam, awayTeam, target, currentRuns, wicketsLost, ballsRemaining, 'HIGHWAY', true);

  const embed = new EmbedBuilder()
    .setColor('#0284c7')
    .setTitle(`📊 Live Match Bookmaker Odds: ${homeTeam} vs ${awayTeam}`)
    .setDescription(
      `🏟️ **Match Scenario:** ${awayTeam} need \`${target - currentRuns} runs\` off \`${ballsRemaining} balls\` with \`${10 - wicketsLost} wickets\` in hand.\n\n` +
      `${odds.tacticalSummary}\n\n` +
      `🛡️ **${homeTeam}:** \`${odds.homeWinProbability}%\` Win Probability | Odds: **${odds.homeOdds}x**\n` +
      `⚔️ **${awayTeam}:** \`${odds.awayWinProbability}%\` Win Probability | Odds: **${odds.awayOdds}x**`
    )
    .setFooter({ text: 'Place predictions with -predict <team> <coins>' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handlePredictCommand(message: Message, args: string[]) {
  const teamArg = args[0];
  const coinsArg = parseInt(args[1]);

  if (!teamArg || isNaN(coinsArg) || coinsArg <= 0) {
    return await message.reply('❌ Please specify a team and coin stake. Example: `-predict "India Gladiators" 50000` or `-predict india 50000`');
  }

  const odds = 1.85; // Standard matched odds
  const matchId = `match_${Date.now()}`;

  const result = await placeMatchPrediction(
    message.author.id,
    matchId,
    teamArg,
    BigInt(coinsArg),
    odds
  );

  const embed = new EmbedBuilder()
    .setColor(result.success ? '#10b981' : '#e74c3c')
    .setTitle(result.success ? '🎰 Prediction Confirmed' : '❌ Prediction Error')
    .setDescription(result.message)
    .setFooter({ text: 'Apex CricVerse Live Betting & Predictions' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}
