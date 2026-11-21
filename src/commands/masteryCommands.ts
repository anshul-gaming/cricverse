import { Message, EmbedBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';
import { SIGNATURE_MOVES, getPlayerMasteries, upgradePlayerMastery } from '../engines/masteryEngine.js';

export async function handleMasteryCommand(message: Message, args: string[]) {
  const sub = args[0]?.toLowerCase();

  if (sub === 'upgrade' || sub === 'up') {
    const moveArg = args[1]?.toUpperCase();
    if (!moveArg) {
      return await message.reply('❌ Please specify a move to upgrade. Example: `-mastery upgrade helicopter` or `-mastery upgrade yorker_150`');
    }

    const result = await upgradePlayerMastery(message.author.id, moveArg);
    const embed = new EmbedBuilder()
      .setColor(result.success ? '#2ecc71' : '#e74c3c')
      .setTitle(result.success ? '⚡ Signature Mastery Upgraded' : '❌ Mastery Upgrade Failed')
      .setDescription(result.message)
      .setFooter({ text: 'Apex CricVerse Specialization Tree' })
      .setTimestamp();

    return await message.reply({ embeds: [embed] });
  }

  // Display all masteries
  const masteries = await getPlayerMasteries(message.author.id);
  const masteryMap = new Map(masteries.map(m => [m.masteryKey, m.level]));

  const battingMoves: string[] = [];
  const bowlingMoves: string[] = [];

  for (const [key, def] of Object.entries(SIGNATURE_MOVES)) {
    const level = masteryMap.get(key) || 0;
    const stars = '⭐'.repeat(level) + '☆'.repeat(def.maxLevel - level);
    const line = `${def.emoji} **${def.name}** [${stars} Lvl ${level}/${def.maxLevel}]\n` +
      `└ *${def.counterDescription}*\n` +
      `└ Code: \`${key.toLowerCase()}\` | Next Upgrade: **${(level + 1) * def.baseTpCost} TP**`;

    if (def.type === 'BATTING') battingMoves.push(line);
    else bowlingMoves.push(line);
  }

  const embed = new EmbedBuilder()
    .setColor('#f59e0b')
    .setTitle(`🌟 ${message.author.username}'s Signature Masteries & Specializations`)
    .setDescription(
      `Masteries give you game-changing advantages during live match duels and death overs!\n` +
      `Use **\`-mastery upgrade <move_code>\`** to level up a technique.\n` +
      `Earn Training Points via **\`-train\`** and biometrics at the campus.`
    )
    .addFields(
      {
        name: '🏏 Batting Signature Moves',
        value: battingMoves.join('\n\n') || '*None unlocked*',
        inline: false
      },
      {
        name: '🎯 Bowling Signature Moves',
        value: bowlingMoves.join('\n\n') || '*None unlocked*',
        inline: false
      }
    )
    .setFooter({ text: 'Commands: -mastery upgrade helicopter | -mastery upgrade yorker_150' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}
