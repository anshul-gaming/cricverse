import {
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';
import { prisma } from '../database/prisma.js';
import { PitchType, getPitchReport, simulateDelivery, calculateMatchImpact, PlayerMatchStats } from '../engines/matchEngine.js';
import { resolveDeliveryDuel, BowlerChoice, BatterChoice } from '../engines/duelEngine.js';
import { dispatchMatchTelemetry } from '../services/leagueMasterBridge.js';

export async function handlePitchReportCommand(message: Message, args: string[]) {
  let pitchType: PitchType = 'HIGHWAY';
  const arg = args[0]?.toLowerCase();
  if (arg === 'green' || arg === 'mamba') pitchType = 'GREEN_MAMBA';
  else if (arg === 'dust' || arg === 'turner') pitchType = 'DUST_BOWL';

  const isNight = true;
  const dewActive = pitchType === 'HIGHWAY' && isNight;
  const report = getPitchReport(pitchType, dewActive);

  const embed = new EmbedBuilder()
    .setColor('#f39c12')
    .setTitle(`🏟️ Venue Pitch & Weather Telemetry: ${report.title}`)
    .setDescription(report.desc)
    .addFields(
      { name: '🌡️ Surface Type', value: pitchType, inline: true },
      { name: '💧 Night Dew Forecast', value: dewActive ? '⚠️ Heavy Dew in 2nd Innings' : 'None', inline: true },
      { name: '💡 Tactical Advice', value: pitchType === 'GREEN_MAMBA' ? 'Bowl first & exploit early seam!' : pitchType === 'DUST_BOWL' ? 'Bat first before pitch cracks!' : 'Win toss & chase with dew advantage!' }
    )
    .setFooter({ text: 'Options: -pitchreport <green|dust|highway>' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleTossCommand(message: Message, args: string[]) {
  const call = args[0]?.toLowerCase();
  if (call !== 'heads' && call !== 'tails') {
    return await message.reply('🪙 Please call `heads` or `tails`. Example: `-toss heads`');
  }

  const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
  const won = call === coinResult;

  const embed = new EmbedBuilder()
    .setColor(won ? '#2ecc71' : '#e74c3c')
    .setTitle(`🪙 Matchday Coin Toss: ${coinResult.toUpperCase()}!`)
    .setDescription(
      won
        ? `🎉 **You won the toss!**\nUse \`-pitchreport\` to assess conditions and decide your match strategy.`
        : `😢 **Opposition won the toss!**\nThe opposition captain will decide to bat or bowl first.`
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleDuelCommand(message: Message) {
  const opponent = message.mentions.users.first();
  const isPvP = !!opponent && opponent.id !== message.author.id;

  const bowlerName = isPvP ? opponent.username : 'Express Strike Bot';
  const batterName = message.author.username;

  const bowlerRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('duel_yorker').setLabel('🎯 Inswing Yorker').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('duel_bouncer').setLabel('🚀 145km/h Bouncer').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('duel_slower').setLabel('🌀 Slower Cutter').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('duel_wide').setLabel('📐 Tramline Line').setStyle(ButtonStyle.Secondary)
  );

  const batterRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('duel_helicopter').setLabel('🚁 Helicopter Shot').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('duel_ramp').setLabel('🤿 360° Ramp').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('duel_loft').setLabel('💥 Step-Out Loft').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('duel_defense').setLabel('🛡️ Compact Defense').setStyle(ButtonStyle.Secondary)
  );

  const embed = new EmbedBuilder()
    .setColor('#9b59b6')
    .setTitle('⚡ 10-Second Delivery Mind-Game Duel')
    .setDescription(
      `**Bowler:** ${bowlerName}\n**Batter:** ${batterName}\n\n` +
      `🏏 **${batterName}**, select your shot from the buttons below!\n` +
      `⏱️ You have **15 seconds** to lock in your strategy.`
    )
    .setFooter({ text: 'High-leverage delivery duel engine' })
    .setTimestamp();

  const duelMsg = await message.reply({ embeds: [embed], components: [batterRow] });

  let batterChoice: BatterChoice = 'STEP_OUT_LOFT';
  let bowlerChoice: BowlerChoice = 'YORKER';

  if (!isPvP) {
    const aiChoices: BowlerChoice[] = ['YORKER', 'BOUNCER', 'SLOWER_CUTTER', 'WIDE_OFF'];
    bowlerChoice = aiChoices[Math.floor(Math.random() * aiChoices.length)];
  }

  const collector = duelMsg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 15000,
    filter: i => i.user.id === message.author.id
  });

  collector.on('collect', async interaction => {
    if (interaction.customId === 'duel_helicopter') batterChoice = 'HELICOPTER';
    else if (interaction.customId === 'duel_ramp') batterChoice = 'RAMP_360';
    else if (interaction.customId === 'duel_loft') batterChoice = 'STEP_OUT_LOFT';
    else batterChoice = 'COMPACT_DEFENSE';

    const duelOutcome = resolveDeliveryDuel(
      bowlerName,
      batterName,
      bowlerChoice,
      batterChoice,
      { pace: 75, accuracy: 70, swing: 65 },
      { power: 80, timing: 75, defensiveTech: 60 }
    );

    const outcomeEmbed = new EmbedBuilder()
      .setColor(duelOutcome.runs >= 4 ? '#2ecc71' : duelOutcome.isWicket ? '#e74c3c' : '#3498db')
      .setTitle(`⚔️ Duel Resolved: Bowler [${bowlerChoice}] vs Batter [${batterChoice}]`)
      .setDescription(`${duelOutcome.commentary}\n\n📊 **Outcome:** \`${duelOutcome.runs} runs\` | Wicket: \`${duelOutcome.isWicket ? 'YES' : 'NO'}\``)
      .setFooter({ text: 'Apex CricVerse Tactical Delivery Engine' })
      .setTimestamp();

    await interaction.update({ embeds: [outcomeEmbed], components: [] });
    collector.stop('resolved');
  });

  collector.on('end', async (_collected, reason) => {
    if (reason !== 'resolved') {
      await duelMsg.edit({ content: '⏱️ Duel timed out! Batsman left in confusion outside off-stump.', components: [] }).catch(() => {});
    }
  });
}

export async function handleMatchCommand(message: Message, args: string[]) {
  const formatArg = args[0]?.toLowerCase() || 't5';
  const totalOvers = formatArg === 't10' ? 10 : 5;
  const pitchType: PitchType = 'HIGHWAY';

  const homeTeam = 'India Gladiators';
  const awayTeam = 'Australia Titans';

  const startEmbed = new EmbedBuilder()
    .setColor('#38bdf8')
    .setTitle(`🏟️ ${homeTeam} vs ${awayTeam} (${formatArg.toUpperCase()} Live Match)`)
    .setDescription(`Pitch: **${pitchType}** | Format: **${totalOvers} Overs per side**\n\n*Simulating 1st Innings...*`)
    .setTimestamp();

  const matchMsg = await message.reply({ embeds: [startEmbed] });

  // Innings 1
  let homeScore = 0;
  let homeWickets = 0;
  let dotStreak = 0;
  const homeStats: PlayerMatchStats = {
    id: message.author.id,
    name: message.author.username,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
    bowledBalls: 0,
    runsConceded: 0,
    wickets: 0,
    maidens: 0,
    catches: 0
  };

  const ballsTotal = totalOvers * 6;
  const highlights: string[] = [];

  for (let b = 1; b <= ballsTotal; b++) {
    if (homeWickets >= 10) break;
    const overNum = Math.floor((b - 1) / 6);
    const ballInOver = ((b - 1) % 6) + 1;

    const delivery = simulateDelivery(pitchType, false, false, overNum, dotStreak, 'Mitchell Starc', message.author.username);
    homeScore += delivery.runs;
    homeStats.balls++;

    if (delivery.runs === 0 && !delivery.isWicket) dotStreak++;
    else dotStreak = 0;

    if (delivery.runs === 4) homeStats.fours++;
    if (delivery.runs === 6) homeStats.sixes++;
    homeStats.runs += delivery.runs;

    if (delivery.isWicket) {
      homeWickets++;
      homeStats.isOut = true;
      highlights.push(`❌ ${overNum}.${ballInOver}: ${delivery.commentary}`);
    } else if (delivery.isBoundary) {
      highlights.push(`${delivery.runs === 6 ? '💥' : '🎯'} ${overNum}.${ballInOver}: ${delivery.commentary}`);
    }
  }

  // Innings 2: Run chase
  const target = homeScore + 1;
  let awayScore = 0;
  let awayWickets = 0;
  dotStreak = 0;

  for (let b = 1; b <= ballsTotal; b++) {
    if (awayWickets >= 10 || awayScore >= target) break;
    const overNum = Math.floor((b - 1) / 6);

    const delivery = simulateDelivery(pitchType, true, true, overNum, dotStreak, message.author.username, 'David Warner');
    awayScore += delivery.runs;
    if (delivery.runs === 0 && !delivery.isWicket) dotStreak++;
    else dotStreak = 0;

    if (delivery.isWicket) awayWickets++;
  }

  // Determine Winner
  let winner = '';
  let margin = '';
  if (homeScore > awayScore) {
    winner = homeTeam;
    margin = `by ${homeScore - awayScore} runs`;
  } else if (awayScore > homeScore) {
    winner = awayTeam;
    margin = `by ${10 - awayWickets} wickets`;
  } else {
    winner = 'TIE';
    margin = 'Match Tied (Super Over required)';
  }

  // POTM Calculation
  const potmPoints = calculateMatchImpact(homeStats);
  const potmBoostAttribute = 'power';

  // Dispatch Telemetry to LeagueMaster
  await dispatchMatchTelemetry({
    matchId: `cric_${Date.now()}`,
    competition: 'Apex Premier League',
    format: totalOvers === 10 ? 'T10' : 'T5',
    pitchType,
    dewActive: true,
    homeTeam: { name: homeTeam, score: homeScore, wickets: homeWickets, overs: totalOvers },
    awayTeam: { name: awayTeam, score: awayScore, wickets: awayWickets, overs: totalOvers },
    winner,
    margin,
    potm: {
      userId: message.author.id,
      username: message.author.username,
      rating: potmPoints,
      statUpgrade: { attribute: potmBoostAttribute, boost: 2 }
    },
    keyMoments: []
  }).catch(() => {});

  const finalEmbed = new EmbedBuilder()
    .setColor(winner === homeTeam ? '#2ecc71' : '#f1c40f')
    .setTitle(`🏆 Match Result: ${winner} won ${margin}!`)
    .setDescription(
      `**${homeTeam}:** \`${homeScore}/${homeWickets}\` (${totalOvers}.0 ov)\n` +
      `**${awayTeam}:** \`${awayScore}/${awayWickets}\` (${totalOvers}.0 ov)\n\n` +
      `👑 **Player of the Match (POTM):** <@${message.author.id}> (**${potmPoints} pts**)\n` +
      `✨ *Performance Reward:* **+2 permanent upgrade** to **${potmBoostAttribute.toUpperCase()}**!\n\n` +
      `**🌟 Key Match Highlights:**\n${highlights.slice(0, 4).join('\n') || '*A steady, tactical encounter.*'}`
    )
    .setFooter({ text: 'Apex CricVerse Match Simulation Engine • Synced to LeagueMaster' })
    .setTimestamp();

  await matchMsg.edit({ embeds: [finalEmbed] });
}
