import { Message, EmbedBuilder } from 'discord.js';
import { prisma } from '../database/prisma.js';

export async function handleBuyCommand(message: Message, args: string[]) {
  const itemAlias = args[0]?.toLowerCase();
  if (!itemAlias) {
    const catalogEmbed = new EmbedBuilder()
      .setColor('#38bdf8')
      .setTitle('🛍️ Gear Pavilion: Matchday Pro Shop')
      .setDescription(
        `Purchase energy supplements and matchday equipment boosts!\n\n` +
        `• \`-buy sd\` — **Sports Drink** (Recovers +50 Stamina) | **100,000 🪙**\n` +
        `• \`-buy bat\` — **English Willow Bat** (+10 Batting Power next match) | **500,000 🪙**\n` +
        `• \`-buy spikes\` — **Seam & Pace Spikes** (+10 Bowling Pace next match) | **500,000 🪙**\n` +
        `• \`-buy gloves\` — **Padded Keeping Gloves** (+10 Glovework next match) | **500,000 🪙**\n\n` +
        `*Note: Equipment boosts last for 1 matchday and do not stack.*`
      )
      .setFooter({ text: 'Location: -travel gp' });

    return await message.reply({ embeds: [catalogEmbed] });
  }

  const player = await prisma.player.findUnique({ where: { id: message.author.id } });
  if (!player) return await message.reply('❌ Player profile not found. Run `-profile` to register.');

  if (player.currentLocation !== 'gp') {
    return await message.reply('❌ You must travel to the **🛍️ Gear Pavilion** (`-travel gp`) to purchase equipment!');
  }

  // Sports Drink
  if (itemAlias === 'sd' || itemAlias === 'drink') {
    const cost = 100000n;
    if (player.coins < cost) {
      return await message.reply(`💸 A Sports Drink costs **100,000 coins** (You have ${Number(player.coins).toLocaleString()} coins).`);
    }

    if (player.stamina >= 100) {
      return await message.reply('⚡ Your stamina is already at **100/100 maximum capacity**!');
    }

    const restore = Math.min(50, 100 - player.stamina);
    const updated = await prisma.player.update({
      where: { id: message.author.id },
      data: {
        coins: { decrement: cost },
        stamina: { increment: restore }
      }
    });

    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('🥤 Sports Drink Consumed!')
      .setDescription(
        `Electrolyte surge restored your physical condition.\n\n` +
        `⚡ **+${restore} Stamina Restored!** (Current: **${updated.stamina}/100**)\n` +
        `🪙 **Cost Paid:** \`100,000 coins\``
      )
      .setFooter({ text: 'Stamina cap is 100' })
      .setTimestamp();

    return await message.reply({ embeds: [embed] });
  }

  // Equipment Boosts: bat, spikes, gloves
  let boostType = '';
  let boostStat = '';
  if (itemAlias === 'bat') {
    boostType = 'English Willow Bat';
    boostStat = 'power';
  } else if (itemAlias === 'spikes') {
    boostType = 'Seam & Pace Spikes';
    boostStat = 'pace';
  } else if (itemAlias === 'gloves') {
    boostType = 'Padded Keeping Gloves';
    boostStat = 'glovework';
  } else {
    return await message.reply(`❌ Unknown item \`${itemAlias}\`. Options: \`sd\`, \`bat\`, \`spikes\`, \`gloves\`.`);
  }

  const gearCost = 500000n;
  if (player.coins < gearCost) {
    return await message.reply(`💸 **${boostType}** costs **500,000 coins** (You have ${Number(player.coins).toLocaleString()} coins).`);
  }

  // Add gear item
  await prisma.player.update({
    where: { id: message.author.id },
    data: {
      coins: { decrement: gearCost },
      gear: {
        create: {
          gearType: itemAlias.toUpperCase(),
          name: boostType,
          statBoost: 10,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      }
    }
  });

  const embed = new EmbedBuilder()
    .setColor('#f39c12')
    .setTitle(`🏏 Equipment Acquired: ${boostType}!`)
    .setDescription(
      `Premium matchday equipment equipped for your next fixture.\n\n` +
      `✨ **Matchday Boost:** \`+10 to ${boostStat.toUpperCase()}\`\n` +
      `🪙 **Cost Paid:** \`500,000 coins\`\n` +
      `⏱️ *Validity: 1 matchday*`
    )
    .setFooter({ text: 'Gear effects do not stack' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

export async function handleIntelCommand(message: Message) {
  const player = await prisma.player.findUnique({ where: { id: message.author.id } });
  if (!player) return await message.reply('❌ Player profile not found. Run `-profile` to register.');

  const boostVal = Math.floor(Math.random() * 6) + 1; // +1 to +6
  const attributes = ['power', 'timing', 'pace', 'spin', 'accuracy', 'catching'];
  const targetAttr = attributes[Math.floor(Math.random() * attributes.length)];

  const embed = new EmbedBuilder()
    .setColor('#9b59b6')
    .setTitle('🕵️ Opposition Intel & Video Scouting Brief')
    .setDescription(
      `Analysis of opponent wagon wheels and bowling release angles completed.\n\n` +
      `✨ **Tactical Bonus:** \`+${boostVal} to ${targetAttr.toUpperCase()}\` for your next fixture!\n` +
      `*Free scouting report resets after matchday.*`
    )
    .setFooter({ text: 'Apex CricVerse Tactical Intel' })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}
